import { createRng } from '../src/utils/network/random.ts'

export interface Interval {
  estimate: number
  low: number
  high: number
}

export function mean(xs: readonly number[]): number {
  return xs.length === 0 ? NaN : xs.reduce((s, x) => s + x, 0) / xs.length
}

export function quantile(xs: readonly number[], q: number): number {
  if (xs.length === 0) return NaN
  const sorted = [...xs].sort((a, b) => a - b)
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)
}

export const median = (xs: readonly number[]): number => quantile(xs, 0.5)

/**
 * Percentile bootstrap over scenarios. `statistic` receives the indices of one resample (drawn with replacement), so a
 * statistic that compares two methods uses the same scenarios for both: a paired bootstrap.
 */
export function bootstrap(n: number, statistic: (indices: readonly number[]) => number, resamples: number, seed: number): Interval {
  const rng = createRng(seed)
  const all = Array.from({ length: n }, (_, i) => i)
  const draws: number[] = []
  const picked = new Array<number>(n)
  for (let r = 0; r < resamples; r++) {
    for (let i = 0; i < n; i++) picked[i] = Math.floor(rng() * n)
    draws.push(statistic(picked))
  }
  return { estimate: statistic(all), low: quantile(draws, 0.025), high: quantile(draws, 0.975) }
}

/** Mean of `values` at the given indices. */
export const meanAt = (values: readonly number[], indices: readonly number[]): number => {
  let sum = 0
  for (const i of indices) sum += values[i]
  return sum / indices.length
}

/** Share of the scenarios at `indices` where `test` holds. */
export const shareAt = (values: readonly number[], indices: readonly number[], test: (v: number) => boolean): number => {
  let count = 0
  for (const i of indices) if (test(values[i])) count++
  return count / indices.length
}

export type Verdict = 'supported' | 'partially supported' | 'not supported'

/** H1: a reduction of at least `target` with a 95% interval above zero is supported; interval above zero only is partial. */
export function verdictH1(reduction: Interval, target: number): Verdict {
  if (reduction.estimate >= target && reduction.low > 0) return 'supported'
  if (reduction.low > 0) return 'partially supported'
  return 'not supported'
}

/**
 * H2: two conditions. The gap (M3 minus M2, in share of scenarios found within three digs) must have its upper 95%
 * bound at or below `margin`, and M2 must be at least `speedUp` times faster.
 */
export function verdictH2(gap: Interval, margin: number, speedUp: number, observedSpeedUp: number): Verdict {
  const accurate = gap.high <= margin
  const fast = observedSpeedUp >= speedUp
  if (accurate && fast) return 'supported'
  if (accurate || fast) return 'partially supported'
  return 'not supported'
}
