/**
 * A steady-state hydraulic model of a pipe network.
 *
 * What it computes: given the water the plant keeps at a fixed pressure, how much water every customer takes and
 * where the leaks are, it finds the pressure (as a head in metres of water) at every junction and the flow in every
 * pipe. It uses the Hazen-Williams head-loss law for the pipes and the Global Gradient Algorithm of Todini and Pilati
 * (1988), the same method the EPANET program uses: guess the flows, replace every pipe law with its tangent line,
 * solve one small linear system for the heads, update the flows, repeat until nothing changes.
 *
 * A leak is a hole, so the water that escapes depends on the pressure: q = emitter x sqrt(head), the orifice law.
 */

export interface HydraulicPipe {
  a: number
  b: number
  /** Length, m. */
  length: number
  /** Inner diameter, m. */
  diameter: number
  /** Hazen-Williams roughness coefficient (higher is smoother; old cast iron is about 80-110). */
  c: number
}

export interface HydraulicNetwork {
  nodeCount: number
  pipes: HydraulicPipe[]
  /** The node held at a fixed head (the plant / reservoir). */
  source: number
  /** Head of the source, m. */
  sourceHead: number
}

/** A leak on pipe `pipe`, `at` of the way from its start (0..1), losing `emitter x sqrt(head)` m3/s. */
export interface PointLeak {
  pipe: number
  at: number
  emitter: number
}

export interface Solution {
  /** Head at every node: first the nodes of the network, then one extra node for every leak that sits inside a pipe. */
  heads: number[]
  /** Flow in every (possibly split) pipe, m3/s, positive from `a` to `b`. */
  pipeFlows: number[]
  /** Water lost by each leak, m3/s, in the order the leaks were given. */
  leakFlows: number[]
  /** Water the source has to supply, m3/s. */
  supply: number
  iterations: number
  converged: boolean
}

export interface SolveOptions {
  maxIterations?: number
  /** Stop when the flows change by less than this share of the total flow. */
  tolerance?: number
}

/** Hazen-Williams exponent for the flow. */
export const HW_EXPONENT = 1.852

/** Head loss in metres is `resistance x Q^1.852` with Q in m3/s (SI form of the Hazen-Williams equation). */
export function pipeResistance(length: number, diameter: number, c: number): number {
  return (10.67 * length) / (Math.pow(c, HW_EXPONENT) * Math.pow(diameter, 4.8704))
}

/** A leak closer than this to the end of a pipe is placed on the junction itself instead of cutting the pipe. */
const MIN_PIECE_M = 0.5

/** Below this flow the tangent of the head-loss law is frozen, so a pipe at rest does not give an infinite slope. */
const MIN_FLOW = 1e-5

/** Solves A x = b for a symmetric positive definite A with a Cholesky factorisation. A is copied, not changed. */
export function solveSymmetric(a: readonly Float64Array[], b: Float64Array): Float64Array {
  const n = b.length
  const l = a.map((row) => Float64Array.from(row))
  for (let j = 0; j < n; j++) {
    let d = l[j][j]
    for (let k = 0; k < j; k++) d -= l[j][k] * l[j][k]
    if (!(d > 0)) throw new Error('The network matrix is not positive definite (a node is cut off from the source).')
    const diag = Math.sqrt(d)
    l[j][j] = diag
    for (let i = j + 1; i < n; i++) {
      let s = l[i][j]
      for (let k = 0; k < j; k++) s -= l[i][k] * l[j][k]
      l[i][j] = s / diag
    }
  }
  const y = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let s = b[i]
    for (let k = 0; k < i; k++) s -= l[i][k] * y[k]
    y[i] = s / l[i][i]
  }
  const x = new Float64Array(n)
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i]
    for (let k = i + 1; k < n; k++) s -= l[k][i] * x[k]
    x[i] = s / l[i][i]
  }
  return x
}

interface Piece {
  a: number
  b: number
  r: number
}

export function solveNetwork(net: HydraulicNetwork, demands: readonly number[], leaks: readonly PointLeak[] = [], options: SolveOptions = {}): Solution {
  const maxIterations = options.maxIterations ?? 100
  const tolerance = options.tolerance ?? 1e-9
  const n = HW_EXPONENT

  // 1. Cut the pipes that hold a leak, so that every leak sits on a node of its own.
  const pieces: Piece[] = []
  const extraEmitter: number[] = []
  let nodeCount = net.nodeCount
  const emitterAt = new Map<number, number>()
  const leakNode: number[] = new Array(leaks.length).fill(-1)

  const byPipe = new Map<number, number[]>()
  leaks.forEach((leak, i) => byPipe.set(leak.pipe, [...(byPipe.get(leak.pipe) ?? []), i]))

  net.pipes.forEach((pipe, p) => {
    const here = (byPipe.get(p) ?? []).sort((i, j) => leaks[i].at - leaks[j].at)
    let from = pipe.a
    let fromAt = 0
    for (const i of here) {
      const at = leaks[i].at
      const alongM = at * pipe.length
      if (alongM < MIN_PIECE_M || (1 - at) * pipe.length < MIN_PIECE_M) {
        const node = alongM < MIN_PIECE_M ? pipe.a : pipe.b
        leakNode[i] = node
        emitterAt.set(node, (emitterAt.get(node) ?? 0) + leaks[i].emitter)
        continue
      }
      const node = nodeCount++
      leakNode[i] = node
      emitterAt.set(node, leaks[i].emitter)
      pieces.push({ a: from, b: node, r: pipeResistance((at - fromAt) * pipe.length, pipe.diameter, pipe.c) })
      from = node
      fromAt = at
    }
    pieces.push({ a: from, b: pipe.b, r: pipeResistance((1 - fromAt) * pipe.length, pipe.diameter, pipe.c) })
  })
  for (let i = 0; i < nodeCount; i++) extraEmitter.push(emitterAt.get(i) ?? 0)

  // 2. Number the nodes whose head is unknown (everything except the source).
  const slot: number[] = new Array(nodeCount).fill(-1)
  let unknowns = 0
  for (let i = 0; i < nodeCount; i++) if (i !== net.source) slot[i] = unknowns++

  const heads: number[] = new Array(nodeCount).fill(net.sourceHead)
  const flows: number[] = new Array(pieces.length).fill(0.05)
  const conductance: number[] = new Array(pieces.length).fill(0)
  const matrix = Array.from({ length: unknowns }, () => new Float64Array(unknowns))
  const rhs = new Float64Array(unknowns)
  const net1 = 1 - 1 / n

  let iterations = 0
  let converged = false

  while (iterations < maxIterations) {
    iterations++
    for (const row of matrix) row.fill(0)
    rhs.fill(0)

    // 3. Tangent of every pipe law at the current flow: Q = c x (head difference) + (1 - 1/n) x Q_now.
    pieces.forEach((piece, p) => {
      const slope = n * piece.r * Math.pow(Math.max(Math.abs(flows[p]), MIN_FLOW), n - 1)
      const c = 1 / slope
      conductance[p] = c
      const ia = slot[piece.a]
      const ib = slot[piece.b]
      if (ia >= 0) {
        matrix[ia][ia] += c
        rhs[ia] -= net1 * flows[p]
      }
      if (ib >= 0) {
        matrix[ib][ib] += c
        rhs[ib] += net1 * flows[p]
      }
      if (ia >= 0 && ib >= 0) {
        matrix[ia][ib] -= c
        matrix[ib][ia] -= c
      } else if (ia >= 0) {
        rhs[ia] += c * net.sourceHead
      } else if (ib >= 0) {
        rhs[ib] += c * net.sourceHead
      }
    })

    // 4. Customer demand and the leaks (the tangent of q = emitter x sqrt(head)).
    for (let i = 0; i < nodeCount; i++) {
      const s = slot[i]
      if (s < 0) continue
      const demand = i < net.nodeCount ? (demands[i] ?? 0) : 0
      const emitter = extraEmitter[i]
      if (emitter > 0) {
        const h = Math.max(heads[i], 0.5)
        const root = Math.sqrt(h)
        const lost = emitter * root
        const slopeLeak = emitter / (2 * root)
        matrix[s][s] += slopeLeak
        rhs[s] += -(demand + lost) + slopeLeak * h
      } else {
        rhs[s] -= demand
      }
    }

    const solved = solveSymmetric(matrix, rhs)
    let maxHeadChange = 0
    for (let i = 0; i < nodeCount; i++) {
      if (slot[i] < 0) continue
      maxHeadChange = Math.max(maxHeadChange, Math.abs(solved[slot[i]] - heads[i]))
      heads[i] = solved[slot[i]]
    }

    let change = 0
    let total = 0
    pieces.forEach((piece, p) => {
      const next = conductance[p] * (heads[piece.a] - heads[piece.b]) + net1 * flows[p]
      change += Math.abs(next - flows[p])
      total += Math.abs(next)
      flows[p] = next
    })
    if (change <= tolerance * Math.max(total, 1e-12) && maxHeadChange < 1e-7) {
      converged = true
      break
    }
  }

  const leakFlows = leaks.map((_, i) => leakShare(leaks, i, leakNode, extraEmitter, heads))
  let supply = 0
  pieces.forEach((piece, p) => {
    if (piece.a === net.source) supply += flows[p]
    if (piece.b === net.source) supply -= flows[p]
  })

  return { heads, pipeFlows: flows, leakFlows, supply, iterations, converged }
}

/** Water lost by leak `i`; leaks that share a junction share its emitter in proportion to their coefficients. */
function leakShare(leaks: readonly PointLeak[], i: number, leakNode: readonly number[], emitter: readonly number[], heads: readonly number[]): number {
  const node = leakNode[i]
  const total = emitter[node]
  if (!(total > 0)) return 0
  const lostAtNode = total * Math.sqrt(Math.max(heads[node], 0.5))
  return (lostAtNode * leaks[i].emitter) / total
}

/**
 * Splits a total demand over the junctions in proportion to the length of pipe that serves them (half of every pipe
 * that ends at the junction), a standard way to spread the customers of a district network.
 */
export function distributeDemand(net: HydraulicNetwork, total: number): number[] {
  const weight: number[] = new Array(net.nodeCount).fill(0)
  for (const p of net.pipes) {
    weight[p.a] += p.length / 2
    weight[p.b] += p.length / 2
  }
  weight[net.source] = 0
  const sum = weight.reduce((s, w) => s + w, 0)
  return weight.map((w) => (w / sum) * total)
}
