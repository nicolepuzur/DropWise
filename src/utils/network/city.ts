import { GRAPH, METRES_PER_UNIT, type PipeGraph } from './graph.ts'
import { distributeDemand, type HydraulicNetwork } from './hydraulics.ts'

/**
 * The physical data of the leak-hunter city. These numbers are assumptions chosen to look like an old district network:
 * a 400 mm main line from the plant, 250 mm ring mains and 200 mm branches, cast-iron roughness, 60 m of head at the
 * plant. The diameters were picked so that the lowest pressure in the quiet network is about 40 m, a realistic service
 * pressure. They were fixed before any leak-finding method was run (see research/PREREGISTRATION.md).
 */

/** Inner diameter of each drawn pipe (index = position in PIPES), m. */
export const DIAMETER_BY_SEGMENT: readonly number[] = [0.4, 0.25, 0.25, 0.25, 0.25, 0.25, 0.2, 0.2]

/** Hazen-Williams roughness of old cast iron. */
export const ROUGHNESS_C = 100

/** Head the plant keeps at the start of the network, m. */
export const SOURCE_HEAD_M = 60

/** Water the customers take together, m3/s (about 21,600 m3 a day). */
export const BASE_DEMAND_M3_S = 0.25

export function cityNetwork(graph: PipeGraph = GRAPH): HydraulicNetwork {
  return {
    nodeCount: graph.nodes.length,
    source: graph.source,
    sourceHead: SOURCE_HEAD_M,
    pipes: graph.pipes.map((p) => ({
      a: p.a,
      b: p.b,
      length: p.length * METRES_PER_UNIT,
      diameter: DIAMETER_BY_SEGMENT[p.segment],
      c: ROUGHNESS_C,
    })),
  }
}

export const CITY: HydraulicNetwork = cityNetwork()

/** The demand at every junction when nobody is using more or less than usual. */
export const NOMINAL_DEMANDS: readonly number[] = distributeDemand(CITY, BASE_DEMAND_M3_S)
