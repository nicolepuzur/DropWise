import { describe, expect, it } from 'vitest'
import { PIPES, START_LEAKS } from '../leaks.ts'
import { CITY, NOMINAL_DEMANDS, SOURCE_HEAD_M } from './city.ts'
import { buildGraph, candidatePositions, GRAPH, loopCount, positionOn, totalLength } from './graph.ts'
import { distributeDemand, HW_EXPONENT, pipeResistance, solveNetwork, solveSymmetric, type HydraulicNetwork } from './hydraulics.ts'

function distanceToSegment(px: number, py: number, s: { x1: number; y1: number; x2: number; y2: number }): number {
  const dx = s.x2 - s.x1
  const dy = s.y2 - s.y1
  const t = Math.max(0, Math.min(1, ((px - s.x1) * dx + (py - s.y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy))
}

describe('pipe graph', () => {
  it('has a node at every end and crossing and an edge between neighbours', () => {
    expect(GRAPH.nodes).toHaveLength(14)
    expect(GRAPH.pipes).toHaveLength(19)
    expect(loopCount(GRAPH)).toBe(6)
  })

  it('keeps the total pipe length of the drawing', () => {
    const drawn = PIPES.reduce((sum, p) => sum + Math.hypot(p.x2 - p.x1, p.y2 - p.y1), 0)
    expect(totalLength(GRAPH)).toBe(drawn)
    expect(drawn).toBe(3340)
  })

  it('puts the source at the plant', () => {
    expect(GRAPH.nodes[GRAPH.source]).toEqual({ x: 90, y: 280 })
  })

  it('is connected', () => {
    const seen = new Set<number>([GRAPH.source])
    const queue = [GRAPH.source]
    while (queue.length) {
      const node = queue.pop()!
      for (const p of GRAPH.pipes) {
        const next = p.a === node ? p.b : p.b === node ? p.a : -1
        if (next >= 0 && !seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }
    expect(seen.size).toBe(GRAPH.nodes.length)
  })

  it('keeps every leak of the game on a pipe of the graph', () => {
    for (const leak of START_LEAKS) {
      const nearest = Math.min(...GRAPH.pipes.map((_, i) => {
        const a = positionOn(GRAPH, i, 0)
        const b = positionOn(GRAPH, i, 1)
        return distanceToSegment(leak.x, leak.y, { x1: a.x, y1: a.y, x2: b.x, y2: b.y })
      }))
      expect(nearest).toBeLessThan(1)
    }
  })

  it('spaces candidate positions about evenly along the pipes', () => {
    const spots = candidatePositions(GRAPH, 20)
    expect(spots.length).toBeGreaterThan(150)
    expect(spots.length).toBeLessThan(190)
    for (const s of spots) expect(s.t).toBeGreaterThan(0)
  })

  it('also works for a tiny drawing', () => {
    const g = buildGraph([{ x1: 0, y1: 0, x2: 10, y2: 0 }, { x1: 5, y1: -5, x2: 5, y2: 5 }], { x: 0, y: 0 })
    expect(g.nodes).toHaveLength(5)
    expect(g.pipes).toHaveLength(4)
    expect(g.nodes[g.source]).toEqual({ x: 0, y: 0 })
  })
})

describe('linear solver', () => {
  it('solves a small symmetric positive definite system', () => {
    const a = [Float64Array.from([4, 1, 0]), Float64Array.from([1, 3, 1]), Float64Array.from([0, 1, 2])]
    const x = solveSymmetric(a, Float64Array.from([1, 2, 3]))
    const check = a.map((row) => row[0] * x[0] + row[1] * x[1] + row[2] * x[2])
    expect(check[0]).toBeCloseTo(1, 12)
    expect(check[1]).toBeCloseTo(2, 12)
    expect(check[2]).toBeCloseTo(3, 12)
  })
})

describe('hydraulic model', () => {
  const single: HydraulicNetwork = { nodeCount: 2, source: 0, sourceHead: 50, pipes: [{ a: 0, b: 1, length: 1000, diameter: 0.3, c: 100 }] }

  it('matches the Hazen-Williams law on a single pipe', () => {
    const q = 0.05
    const sol = solveNetwork(single, [0, q])
    const r = pipeResistance(1000, 0.3, 100)
    expect(sol.converged).toBe(true)
    expect(sol.heads[1]).toBeCloseTo(50 - r * Math.pow(q, HW_EXPONENT), 6)
    expect(sol.pipeFlows[0]).toBeCloseTo(q, 9)
    expect(sol.supply).toBeCloseTo(q, 9)
  })

  it('splits the flow evenly between two identical parallel pipes', () => {
    const twin: HydraulicNetwork = { ...single, pipes: [single.pipes[0], single.pipes[0]] }
    const sol = solveNetwork(twin, [0, 0.06])
    expect(sol.pipeFlows[0]).toBeCloseTo(0.03, 9)
    expect(sol.pipeFlows[1]).toBeCloseTo(0.03, 9)
    // two pipes in parallel lose less head than one
    expect(sol.heads[1]).toBeGreaterThan(solveNetwork(single, [0, 0.06]).heads[1])
  })

  it('sends more water through the wider of two parallel pipes', () => {
    const mixed: HydraulicNetwork = { ...single, pipes: [single.pipes[0], { ...single.pipes[0], diameter: 0.4 }] }
    const sol = solveNetwork(mixed, [0, 0.06])
    expect(sol.pipeFlows[1]).toBeGreaterThan(sol.pipeFlows[0])
    expect(sol.pipeFlows[0] + sol.pipeFlows[1]).toBeCloseTo(0.06, 9)
  })

  it('conserves mass at every junction of the city', () => {
    const sol = solveNetwork(CITY, NOMINAL_DEMANDS)
    expect(sol.converged).toBe(true)
    expect(sol.supply).toBeCloseTo(NOMINAL_DEMANDS.reduce((s, d) => s + d, 0), 9)
    const net = new Array(CITY.nodeCount).fill(0)
    CITY.pipes.forEach((p, i) => {
      net[p.b] += sol.pipeFlows[i]
      net[p.a] -= sol.pipeFlows[i]
    })
    for (let node = 0; node < CITY.nodeCount; node++) {
      if (node === CITY.source) continue
      expect(net[node]).toBeCloseTo(NOMINAL_DEMANDS[node], 8)
    }
  })

  it('obeys the head-loss law in every pipe of the city (energy is conserved around every loop)', () => {
    const sol = solveNetwork(CITY, NOMINAL_DEMANDS)
    CITY.pipes.forEach((p, i) => {
      const q = sol.pipeFlows[i]
      const loss = pipeResistance(p.length, p.diameter, p.c) * Math.sign(q) * Math.pow(Math.abs(q), HW_EXPONENT)
      expect(sol.heads[p.a] - sol.heads[p.b]).toBeCloseTo(loss, 6)
    })
  })

  it('keeps the quiet network at a realistic service pressure', () => {
    const sol = solveNetwork(CITY, NOMINAL_DEMANDS)
    const lowest = Math.min(...sol.heads)
    expect(sol.heads[CITY.source]).toBe(SOURCE_HEAD_M)
    expect(lowest).toBeGreaterThan(35)
    expect(lowest).toBeLessThan(45)
  })

  it('shares the demand out in proportion to the pipe that serves each junction', () => {
    const d = distributeDemand(CITY, 0.25)
    expect(d[CITY.source]).toBe(0)
    expect(d.reduce((s, x) => s + x, 0)).toBeCloseTo(0.25, 12)
  })

  it('loses water through a leak and lowers the pressure everywhere', () => {
    const quiet = solveNetwork(CITY, NOMINAL_DEMANDS)
    const emitter = 0.01 / Math.sqrt(40)
    const sol = solveNetwork(CITY, NOMINAL_DEMANDS, [{ pipe: 3, at: 0.5, emitter }])
    expect(sol.converged).toBe(true)
    // the leak sits on a new node after the ones of the network
    const leakHead = sol.heads[CITY.nodeCount]
    expect(sol.leakFlows[0]).toBeCloseTo(emitter * Math.sqrt(leakHead), 9)
    expect(sol.supply).toBeCloseTo(NOMINAL_DEMANDS.reduce((s, d) => s + d, 0) + sol.leakFlows[0], 9)
    for (let i = 0; i < CITY.nodeCount; i++) if (i !== CITY.source) expect(sol.heads[i]).toBeLessThan(quiet.heads[i])
  })

  it('makes a bigger leak lower the pressure more and lose more water', () => {
    const small = solveNetwork(CITY, NOMINAL_DEMANDS, [{ pipe: 8, at: 0.4, emitter: 0.005 }])
    const big = solveNetwork(CITY, NOMINAL_DEMANDS, [{ pipe: 8, at: 0.4, emitter: 0.02 }])
    expect(big.leakFlows[0]).toBeGreaterThan(small.leakFlows[0])
    expect(Math.min(...big.heads)).toBeLessThan(Math.min(...small.heads))
  })

  it('lowers the pressure most at one of the two ends of the leaking pipe', () => {
    const quiet = solveNetwork(CITY, NOMINAL_DEMANDS)
    for (const pipeIndex of [3, 8, 12, 15]) {
      const pipe = CITY.pipes[pipeIndex]
      const sol = solveNetwork(CITY, NOMINAL_DEMANDS, [{ pipe: pipeIndex, at: 0.5, emitter: 0.01 }])
      let worst = -1
      let worstDrop = -Infinity
      for (let i = 0; i < CITY.nodeCount; i++) {
        const drop = quiet.heads[i] - sol.heads[i]
        if (drop > worstDrop) {
          worstDrop = drop
          worst = i
        }
      }
      expect([pipe.a, pipe.b]).toContain(worst)
    }
  })

  it('puts a leak at the very end of a pipe on the junction instead of cutting the pipe', () => {
    const sol = solveNetwork(CITY, NOMINAL_DEMANDS, [{ pipe: 3, at: 1, emitter: 0.01 }])
    expect(sol.heads).toHaveLength(CITY.nodeCount)
    expect(sol.leakFlows[0]).toBeGreaterThan(0)
  })

  it('refuses a network with a junction that is cut off from the source', () => {
    const cut: HydraulicNetwork = { ...single, nodeCount: 3 }
    expect(() => solveNetwork(cut, [0, 0.01, 0.01])).toThrow()
  })
})
