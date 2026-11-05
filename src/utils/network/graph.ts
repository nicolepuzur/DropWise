import { PIPES, PLANT, type Segment } from '../leaks.ts'

/**
 * The drawn pipes of the leak hunter, turned into a graph: junctions are nodes, the stretches of pipe between two
 * junctions are edges. The hydraulic model, the sensors and the leak finders all work on this graph.
 */

export interface Point {
  x: number
  y: number
}

export interface GraphPipe {
  /** Index of the drawn segment (in PIPES) this stretch belongs to. */
  segment: number
  /** Node at the start of the stretch. */
  a: number
  /** Node at the end of the stretch. */
  b: number
  /** Length in map units. */
  length: number
}

export interface PipeGraph {
  nodes: Point[]
  pipes: GraphPipe[]
  /** The node where the plant feeds the network. */
  source: number
}

/** The map is 1000 units wide; one unit stands for 4 m of real pipe (a network a little over 3 km across). */
export const METRES_PER_UNIT = 4

/** A point of the map that lies on a pipe, given by the stretch and how far along it is (0 = start, 1 = end). */
export interface PipePosition {
  pipe: number
  t: number
  x: number
  y: number
}

function onSegment(p: Point, s: Segment): boolean {
  const cross = (s.x2 - s.x1) * (p.y - s.y1) - (s.y2 - s.y1) * (p.x - s.x1)
  if (cross !== 0) return false
  return p.x >= Math.min(s.x1, s.x2) && p.x <= Math.max(s.x1, s.x2) && p.y >= Math.min(s.y1, s.y2) && p.y <= Math.max(s.y1, s.y2)
}

/** Builds the graph: a node at every end of a pipe and at every crossing, an edge between neighbouring nodes. */
export function buildGraph(segments: readonly Segment[] = PIPES, plant: Point = PLANT): PipeGraph {
  const found = new Map<string, Point>()
  const add = (p: Point) => found.set(`${p.x},${p.y}`, p)

  for (const s of segments) {
    add({ x: s.x1, y: s.y1 })
    add({ x: s.x2, y: s.y2 })
  }
  for (const h of segments) {
    if (h.y1 !== h.y2) continue
    for (const v of segments) {
      if (v.x1 !== v.x2) continue
      const crossing = { x: v.x1, y: h.y1 }
      if (onSegment(crossing, h) && onSegment(crossing, v)) add(crossing)
    }
  }

  const nodes = [...found.values()].sort((p, q) => p.y - q.y || p.x - q.x)
  const indexOf = (p: Point) => nodes.findIndex((n) => n.x === p.x && n.y === p.y)

  const pipes: GraphPipe[] = []
  segments.forEach((s, segment) => {
    const dx = s.x2 - s.x1
    const dy = s.y2 - s.y1
    const along = (p: Point) => (p.x - s.x1) * dx + (p.y - s.y1) * dy
    const onIt = nodes.filter((n) => onSegment(n, s)).sort((p, q) => along(p) - along(q))
    for (let i = 0; i + 1 < onIt.length; i++) {
      pipes.push({
        segment,
        a: indexOf(onIt[i]),
        b: indexOf(onIt[i + 1]),
        length: Math.hypot(onIt[i + 1].x - onIt[i].x, onIt[i + 1].y - onIt[i].y),
      })
    }
  })

  return { nodes, pipes, source: indexOf(plant) }
}

export const GRAPH: PipeGraph = buildGraph()

/** Where a point at `t` along pipe `pipe` is on the map. */
export function positionOn(graph: PipeGraph, pipe: number, t: number): PipePosition {
  const p = graph.pipes[pipe]
  const a = graph.nodes[p.a]
  const b = graph.nodes[p.b]
  return { pipe, t, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

/**
 * Evenly spaced places along every pipe where a leak could be (or where we could dig). Each stretch is cut into equal
 * pieces about `spacing` map units long and one candidate sits in the middle of each piece.
 */
export function candidatePositions(graph: PipeGraph, spacing: number): PipePosition[] {
  const out: PipePosition[] = []
  graph.pipes.forEach((p, i) => {
    const pieces = Math.max(1, Math.round(p.length / spacing))
    for (let k = 0; k < pieces; k++) out.push(positionOn(graph, i, (k + 0.5) / pieces))
  })
  return out
}

export function totalLength(graph: PipeGraph): number {
  return graph.pipes.reduce((sum, p) => sum + p.length, 0)
}

/** Number of independent loops of the network (edges - nodes + 1 for a connected graph). */
export function loopCount(graph: PipeGraph): number {
  return graph.pipes.length - graph.nodes.length + 1
}
