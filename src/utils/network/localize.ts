import { DIG_RADIUS } from '../leaks.ts'
import { solveNetwork, type PointLeak } from './hydraulics.ts'
import type { PipePosition } from './graph.ts'
import { emitterFor, type World } from './scenario.ts'
import { shuffled, type Rng } from './random.ts'

/**
 * Four ways of choosing where to dig, given only the pressure drops reported by the sensors.
 * Every method returns the candidate places in the order a crew should try them.
 */
export type Ranking = PipePosition[]

export interface FingerprintOptions {
  /** Size of the reference leak used for the fingerprints, as a share of the nominal demand. */
  referenceShare: number
  referenceHead: number
}

export interface ModelFitOptions extends FingerprintOptions {
  maxIterations: number
  /** The demand factor the fit may use, as a range. */
  demandRange: { min: number; max: number }
}

/** The settings used in the report (fixed in research/PREREGISTRATION.md before any run). */
export const FINGERPRINT_DEFAULTS: FingerprintOptions = { referenceShare: 0.05, referenceHead: 40 }
export const MODEL_FIT_DEFAULTS: ModelFitOptions = { ...FINGERPRINT_DEFAULTS, maxIterations: 6, demandRange: { min: 0.5, max: 1.5 } }

/** M0: no information at all, a random order. */
export function rankRandom(world: World, rng: Rng): Ranking {
  return shuffled(rng, world.candidates.length).map((i) => world.candidates[i])
}

/** M1: dig around the sensor that shows the biggest pressure drop, nearest places first. */
export function rankNaive(world: World, drop: readonly number[]): Ranking {
  let biggest = 0
  for (let j = 1; j < drop.length; j++) if (drop[j] > drop[biggest]) biggest = j
  const sensor = world.graph.nodes[world.sensors[biggest]]
  const distance = (p: PipePosition) => Math.hypot(p.x - sensor.x, p.y - sensor.y)
  return [...world.candidates].sort((p, q) => distance(p) - distance(q))
}

/** What the sensors would show if a leak opened at `place`, with the usual demand. */
function simulatedDrop(world: World, leak: PointLeak, demands: readonly number[] = world.nominalDemands): number[] {
  const heads = solveNetwork(world.net, demands, [leak]).heads
  return world.sensors.map((s) => world.nominalHeads[s] - heads[s])
}

/**
 * M2: fingerprints. For every place, work out once what a leak there does to the sensors. A leak is then looked for
 * where the fingerprint has the same pattern as the real readings (cosine similarity), whatever its size.
 */
export function createFingerprintRanker(world: World, options: FingerprintOptions = FINGERPRINT_DEFAULTS): (drop: readonly number[]) => Ranking {
  const emitter = emitterFor(options.referenceShare, options.referenceHead)
  const prints = world.candidates.map((c) => simulatedDrop(world, { pipe: c.pipe, at: c.t, emitter }))
  const lengths = prints.map((f) => Math.sqrt(f.reduce((s, v) => s + v * v, 0)))
  return (drop) => {
    const norm = Math.sqrt(drop.reduce((s, v) => s + v * v, 0))
    const score = prints.map((f, i) => (norm === 0 || lengths[i] === 0 ? 0 : f.reduce((s, v, j) => s + v * drop[j], 0) / (norm * lengths[i])))
    return world.candidates.map((_, i) => i).sort((a, b) => score[b] - score[a]).map((i) => world.candidates[i])
  }
}

/** Least-squares fit of (leak size, demand factor) for a leak at one place; returns the remaining squared error. */
function fitPlace(world: World, place: PipePosition, drop: readonly number[], emitter: number, options: ModelFitOptions): number {
  const predict = (a: number, b: number) =>
    simulatedDrop(
      world,
      { pipe: place.pipe, at: place.t, emitter: a * emitter },
      world.nominalDemands.map((d) => d * b),
    )
  const residual = (p: readonly number[]) => drop.map((y, j) => y - p[j])
  const cost = (r: readonly number[]) => r.reduce((s, v) => s + v * v, 0)
  const clip = (a: number, b: number): [number, number] => [Math.max(0, a), Math.min(options.demandRange.max, Math.max(options.demandRange.min, b))]

  let [a, b] = clip(1, 1)
  let pred = predict(a, b)
  let r = residual(pred)
  let best = cost(r)
  let damping = 0.01
  const stepA = 0.05
  const stepB = 0.01

  for (let iteration = 0; iteration < options.maxIterations; iteration++) {
    // finite-difference Jacobian of the readings with respect to (a, b)
    const pa = predict(a + stepA, b)
    const pb = predict(a, b + stepB)
    const ja = pa.map((v, j) => (v - pred[j]) / stepA)
    const jb = pb.map((v, j) => (v - pred[j]) / stepB)
    const aa = ja.reduce((s, v) => s + v * v, 0)
    const bb = jb.reduce((s, v) => s + v * v, 0)
    const ab = ja.reduce((s, v, j) => s + v * jb[j], 0)
    const ga = ja.reduce((s, v, j) => s + v * r[j], 0)
    const gb = jb.reduce((s, v, j) => s + v * r[j], 0)

    // Levenberg-Marquardt step: (JtJ + damping x diag(JtJ)) delta = Jt r
    const m00 = aa * (1 + damping) + 1e-12
    const m11 = bb * (1 + damping) + 1e-12
    const det = m00 * m11 - ab * ab
    if (!(Math.abs(det) > 1e-30)) break
    const da = (m11 * ga - ab * gb) / det
    const db = (m00 * gb - ab * ga) / det
    const [na, nb] = clip(a + da, b + db)
    const trial = predict(na, nb)
    const trialCost = cost(residual(trial))
    if (trialCost < best) {
      const small = Math.abs(na - a) < 1e-4 && Math.abs(nb - b) < 1e-5
      ;[a, b, pred] = [na, nb, trial]
      r = residual(pred)
      best = trialCost
      damping *= 0.3
      if (small) break
    } else {
      damping *= 10
    }
  }
  return best
}

/**
 * M3: model fitting. For every place, ask: if the leak were here, what size of leak and what overall demand would make
 * the full hydraulic model match the readings best? Places are ranked by how small the remaining error is.
 */
export function createModelFitRanker(world: World, options: ModelFitOptions = MODEL_FIT_DEFAULTS): (drop: readonly number[]) => Ranking {
  const emitter = emitterFor(options.referenceShare, options.referenceHead)
  return (drop) => {
    const error = world.candidates.map((c) => fitPlace(world, c, drop, emitter, options))
    return world.candidates.map((_, i) => i).sort((a, b) => error[a] - error[b]).map((i) => world.candidates[i])
  }
}

export interface DigOutcome {
  /** Digs before the one that found the leak; `maxDigs` if it was not found. */
  dryHoles: number
  found: boolean
  /** Distance of the first dig from the leak, map units. */
  firstError: number
}

/**
 * The same crew for every method: walk down the list, skip a place within the dig radius of an earlier dig, dig, stop
 * when the leak is found or after `maxDigs` digs.
 */
export function runDigs(ranking: Ranking, leak: { x: number; y: number }, maxDigs: number, radius = DIG_RADIUS): DigOutcome {
  const digs: PipePosition[] = []
  let firstError = Infinity
  for (const place of ranking) {
    if (digs.length >= maxDigs) break
    if (digs.some((d) => Math.hypot(d.x - place.x, d.y - place.y) <= radius)) continue
    digs.push(place)
    const error = Math.hypot(place.x - leak.x, place.y - leak.y)
    if (digs.length === 1) firstError = error
    if (error <= radius) return { dryHoles: digs.length - 1, found: true, firstError }
  }
  return { dryHoles: maxDigs, found: false, firstError }
}
