import { BASE_DEMAND_M3_S, CITY, NOMINAL_DEMANDS } from './city.ts'
import { candidatePositions, GRAPH, positionOn, type PipeGraph, type PipePosition } from './graph.ts'
import { solveNetwork, type HydraulicNetwork } from './hydraulics.ts'
import { logUniform, normal, type Rng } from './random.ts'

/**
 * Everything a leak-finding method is allowed to know: the network, the usual (nominal) demand, the pressures of the
 * quiet network, where the sensors are, and the places where a leak could be.
 */
export interface World {
  graph: PipeGraph
  net: HydraulicNetwork
  nominalDemands: readonly number[]
  /** Head at every junction of the quiet network, m. */
  nominalHeads: number[]
  /** Junctions that carry a pressure sensor. */
  sensors: number[]
  /** Places where a leak could be, evenly spaced along the pipes. */
  candidates: PipePosition[]
}

export interface ScenarioOptions {
  /** A leak loses this share of the nominal demand (log-uniform), measured at `referenceHead`. */
  leakShare: { min: number; max: number }
  referenceHead: number
  /** Standard deviations of the demand the model does not know: per junction, and common to all junctions. */
  demand: { perJunction: number; common: number }
  /** Standard deviation of the pressure sensors' error, m. */
  sensorNoise: number
}

export interface Scenario {
  leak: PipePosition & { share: number; emitter: number }
  /** What the sensors report: head of the quiet network minus the measured head, m (positive = pressure fell). */
  drop: number[]
}

/** Emitter coefficient of a leak that loses `share` of the nominal demand at `referenceHead`. */
export function emitterFor(share: number, referenceHead: number): number {
  return (share * BASE_DEMAND_M3_S) / Math.sqrt(referenceHead)
}

/**
 * Places the sensors with a fixed rule: the first at the junction with the lowest pressure of the quiet network, each
 * next one as far as possible on the map from those already chosen. Ties go to the lowest junction number. Never at
 * the plant, whose pressure is fixed.
 */
export function chooseSensors(graph: PipeGraph, nominalHeads: readonly number[], count: number): number[] {
  const allowed = graph.nodes.map((_, i) => i).filter((i) => i !== graph.source)
  const chosen: number[] = []
  let first = allowed[0]
  for (const i of allowed) if (nominalHeads[i] < nominalHeads[first]) first = i
  chosen.push(first)
  while (chosen.length < Math.min(count, allowed.length)) {
    let best = -1
    let bestDistance = -1
    for (const i of allowed) {
      if (chosen.includes(i)) continue
      const d = Math.min(...chosen.map((c) => Math.hypot(graph.nodes[i].x - graph.nodes[c].x, graph.nodes[i].y - graph.nodes[c].y)))
      if (d > bestDistance) {
        bestDistance = d
        best = i
      }
    }
    chosen.push(best)
  }
  return chosen
}

export function createWorld(sensorCount: number, spacing: number): World {
  const nominalHeads = solveNetwork(CITY, NOMINAL_DEMANDS).heads
  return {
    graph: GRAPH,
    net: CITY,
    nominalDemands: NOMINAL_DEMANDS,
    nominalHeads,
    sensors: chooseSensors(GRAPH, nominalHeads, sensorCount),
    candidates: candidatePositions(GRAPH, spacing),
  }
}

/** Draws one random leak and the readings it would produce, with the real demand and the sensor error hidden inside. */
export function makeScenario(world: World, rng: Rng, options: ScenarioOptions): Scenario {
  // the pipe is chosen in proportion to its length, then a place along it
  const total = world.graph.pipes.reduce((sum, p) => sum + p.length, 0)
  let pick = rng() * total
  let pipe = 0
  for (let i = 0; i < world.graph.pipes.length; i++) {
    pick -= world.graph.pipes[i].length
    if (pick <= 0) {
      pipe = i
      break
    }
    pipe = i
  }
  const at = rng()
  const share = logUniform(rng, options.leakShare.min, options.leakShare.max)
  const emitter = emitterFor(share, options.referenceHead)

  // the real demand: nominal x a common factor x a factor per junction
  const common = Math.max(0.5, normal(rng, 1, options.demand.common))
  const demands = world.nominalDemands.map((d) => d * common * Math.max(0.1, normal(rng, 1, options.demand.perJunction)))

  const heads = solveNetwork(world.net, demands, [{ pipe, at, emitter }]).heads
  const drop = world.sensors.map((s) => world.nominalHeads[s] - (heads[s] + normal(rng, 0, options.sensorNoise)))
  return { leak: { ...positionOn(world.graph, pipe, at), share, emitter }, drop }
}
