import { describe, expect, it } from 'vitest'
import { createFingerprintRanker, createModelFitRanker, rankNaive, rankRandom, runDigs } from './localize.ts'
import { createRng, logUniform, normal, shuffled } from './random.ts'
import { chooseSensors, createWorld, emitterFor, makeScenario, type ScenarioOptions } from './scenario.ts'
import { GRAPH } from './graph.ts'
import { CITY, NOMINAL_DEMANDS } from './city.ts'
import { solveNetwork } from './hydraulics.ts'

// These tests use the development seed (1) only. The seed of the benchmark (2027) is used by research/benchmark.ts.
const DEV_SEED = 1
const perfect: ScenarioOptions = { leakShare: { min: 0.02, max: 0.1 }, referenceHead: 40, demand: { perJunction: 0, common: 0 }, sensorNoise: 0 }
const world = createWorld(4, 20)

function meanDryHoles(rank: (drop: number[], rng: () => number) => ReturnType<typeof rankNaive>, scenarios: number, options = perfect): number {
  const rng = createRng(DEV_SEED)
  let sum = 0
  for (let i = 0; i < scenarios; i++) {
    const s = makeScenario(world, rng, options)
    sum += runDigs(rank(s.drop, rng), s.leak, 10).dryHoles
  }
  return sum / scenarios
}

describe('random numbers', () => {
  it('repeat for the same seed and differ between seeds', () => {
    const a = createRng(5)
    const b = createRng(5)
    const c = createRng(6)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
    expect(a()).not.toBe(c())
  })

  it('draw normal numbers with the asked mean and spread', () => {
    const rng = createRng(3)
    const xs = Array.from({ length: 20000 }, () => normal(rng, 2, 0.5))
    const mean = xs.reduce((s, x) => s + x, 0) / xs.length
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length)
    expect(mean).toBeGreaterThan(1.98)
    expect(mean).toBeLessThan(2.02)
    expect(sd).toBeGreaterThan(0.48)
    expect(sd).toBeLessThan(0.52)
  })

  it('draw log-uniform numbers inside the range, with as many below the geometric mean as above', () => {
    const rng = createRng(4)
    const xs = Array.from({ length: 4000 }, () => logUniform(rng, 0.02, 0.1))
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0.02)
    expect(Math.max(...xs)).toBeLessThanOrEqual(0.1)
    const below = xs.filter((x) => x < Math.sqrt(0.02 * 0.1)).length / xs.length
    expect(below).toBeGreaterThan(0.45)
    expect(below).toBeLessThan(0.55)
  })

  it('shuffle into a permutation', () => {
    const order = shuffled(createRng(9), 50)
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 50 }, (_, i) => i))
  })
})

describe('sensors and scenarios', () => {
  it('puts the first sensor at the lowest-pressure junction and never at the plant', () => {
    const heads = solveNetwork(CITY, NOMINAL_DEMANDS).heads
    for (const count of [3, 4, 6]) {
      const sensors = chooseSensors(GRAPH, heads, count)
      expect(sensors).toHaveLength(count)
      expect(new Set(sensors).size).toBe(count)
      expect(sensors).not.toContain(GRAPH.source)
      const others = heads.map((h, i) => ({ h, i })).filter((x) => x.i !== GRAPH.source)
      const lowest = others.reduce((best, x) => (x.h < best.h ? x : best)).i
      expect(sensors[0]).toBe(lowest)
    }
  })

  it('draws the same scenario for the same seed', () => {
    const a = makeScenario(world, createRng(DEV_SEED), perfect)
    const b = makeScenario(world, createRng(DEV_SEED), perfect)
    expect(a).toEqual(b)
    expect(a.drop).toHaveLength(world.sensors.length)
  })

  it('makes every sensor read a pressure fall when a leak opens and nothing else changes', () => {
    const rng = createRng(DEV_SEED)
    for (let i = 0; i < 20; i++) {
      const s = makeScenario(world, rng, perfect)
      for (const d of s.drop) expect(d).toBeGreaterThan(0)
    }
  })

  it('draws leaks between 2% and 10% of the demand and anywhere on the pipes', () => {
    const rng = createRng(DEV_SEED)
    const pipes = new Set<number>()
    for (let i = 0; i < 400; i++) {
      const s = makeScenario(world, rng, perfect)
      expect(s.leak.share).toBeGreaterThanOrEqual(0.02)
      expect(s.leak.share).toBeLessThanOrEqual(0.1)
      expect(s.leak.emitter).toBeCloseTo(emitterFor(s.leak.share, 40), 12)
      pipes.add(s.leak.pipe)
    }
    expect(pipes.size).toBe(GRAPH.pipes.length)
  })

  it('hides the sensor error and the unknown demand inside the readings', () => {
    const noisy: ScenarioOptions = { ...perfect, demand: { perJunction: 0.1, common: 0.05 }, sensorNoise: 0.1 }
    const a = makeScenario(world, createRng(DEV_SEED), perfect)
    const b = makeScenario(world, createRng(DEV_SEED), noisy)
    expect(b.drop).not.toEqual(a.drop)
  })
})

describe('the crew', () => {
  const at = (x: number, y: number) => ({ pipe: 0, t: 0.5, x, y })

  it('counts the dry holes before the leak is found', () => {
    const ranking = [at(0, 0), at(100, 0), at(200, 0)]
    expect(runDigs(ranking, { x: 205, y: 0 }, 10)).toEqual({ dryHoles: 2, found: true, firstError: 205 })
  })

  it('does not dig again within the dig radius of an earlier dig', () => {
    // the second place is 30 units from the first, so it is skipped and the third place is the second dig
    const ranking = [at(0, 0), at(30, 0), at(200, 0)]
    expect(runDigs(ranking, { x: 200, y: 0 }, 10).dryHoles).toBe(1)
  })

  it('counts a leak that is never found as the maximum number of dry holes', () => {
    const ranking = Array.from({ length: 30 }, (_, i) => at(i * 100, 0))
    const out = runDigs(ranking, { x: 5000, y: 5000 }, 10)
    expect(out.found).toBe(false)
    expect(out.dryHoles).toBe(10)
  })

  it('finds the leak with the first dig when the first place is close enough', () => {
    expect(runDigs([at(0, 0)], { x: 20, y: 0 }, 10)).toEqual({ dryHoles: 0, found: true, firstError: 20 })
  })
})

describe('the four methods', () => {
  it('list every candidate place exactly once', () => {
    const s = makeScenario(world, createRng(DEV_SEED), perfect)
    const n = world.candidates.length
    const lists = [rankRandom(world, createRng(2)), rankNaive(world, s.drop), createFingerprintRanker(world)(s.drop), createModelFitRanker(world)(s.drop)]
    for (const list of lists) {
      expect(list).toHaveLength(n)
      expect(new Set(list).size).toBe(n)
    }
  })

  it('naive: starts with the place nearest to the sensor that shows the biggest drop', () => {
    const drop = [0.1, 0.9, 0.3, 0.2]
    const sensor = world.graph.nodes[world.sensors[1]]
    const first = rankNaive(world, drop)[0]
    const nearest = Math.min(...world.candidates.map((c) => Math.hypot(c.x - sensor.x, c.y - sensor.y)))
    expect(Math.hypot(first.x - sensor.x, first.y - sensor.y)).toBeCloseTo(nearest, 9)
  })

  it('fingerprints do not care about the size of the leak, only the pattern', () => {
    const rank = createFingerprintRanker(world)
    const drop = [0.2, 0.5, 0.4, 0.3]
    expect(rank(drop).slice(0, 5)).toEqual(rank(drop.map((d) => d * 3)).slice(0, 5))
  })

  it('fingerprints and model fitting find the leak when the readings are exact', () => {
    const fingerprint = createFingerprintRanker(world)
    const fit = createModelFitRanker(world)
    const random = meanDryHoles((_, rng) => rankRandom(world, rng), 20)
    const byFingerprint = meanDryHoles((drop) => fingerprint(drop), 20)
    const byFit = meanDryHoles((drop) => fit(drop), 8)
    expect(random).toBeGreaterThan(6)
    expect(byFingerprint).toBeLessThan(1)
    expect(byFit).toBeLessThan(1)
  })

  it('model fitting finds the leak also when the overall demand is off by 20%', () => {
    const fit = createModelFitRanker(world)
    const off = { ...perfect, demand: { perJunction: 0, common: 0.2 } }
    expect(meanDryHoles((drop) => fit(drop), 8, off)).toBeLessThan(2)
  })
})
