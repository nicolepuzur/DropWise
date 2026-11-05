import { describe, expect, it } from 'vitest'
import { bootstrap, mean, meanAt, median, quantile, shareAt, verdictH1, verdictH2 } from './stats.ts'

describe('statistics', () => {
  it('computes mean, median and quantiles', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5)
    expect(median([5, 1, 3])).toBe(3)
    expect(quantile([0, 10], 0.25)).toBe(2.5)
    expect(mean([])).toBeNaN()
  })

  it('takes means and shares over chosen scenarios', () => {
    expect(meanAt([1, 2, 3, 10], [0, 0, 3])).toBe(4)
    expect(shareAt([0, 1, 2, 3], [0, 1, 2, 3], (v) => v <= 1)).toBe(0.5)
  })

  it('gives a bootstrap interval that contains the estimate and shrinks with more data', () => {
    const small = Array.from({ length: 30 }, (_, i) => (i % 5))
    const big = Array.from({ length: 3000 }, (_, i) => (i % 5))
    const a = bootstrap(small.length, (idx) => meanAt(small, idx), 500, 11)
    const b = bootstrap(big.length, (idx) => meanAt(big, idx), 500, 11)
    expect(a.estimate).toBe(2)
    expect(a.low).toBeLessThan(a.estimate)
    expect(a.high).toBeGreaterThan(a.estimate)
    expect(b.high - b.low).toBeLessThan(a.high - a.low)
  })

  it('repeats the same bootstrap for the same seed', () => {
    const xs = [1, 4, 2, 8, 5, 7]
    const f = (idx: readonly number[]) => meanAt(xs, idx)
    expect(bootstrap(6, f, 200, 11)).toEqual(bootstrap(6, f, 200, 11))
  })

  it('applies the decision rule of H1', () => {
    expect(verdictH1({ estimate: 0.6, low: 0.4, high: 0.8 }, 0.5)).toBe('supported')
    expect(verdictH1({ estimate: 0.3, low: 0.1, high: 0.5 }, 0.5)).toBe('partially supported')
    expect(verdictH1({ estimate: 0.6, low: -0.1, high: 0.9 }, 0.5)).toBe('not supported')
    expect(verdictH1({ estimate: 0.5, low: 0.2, high: 0.7 }, 0.5)).toBe('supported')
  })

  it('applies the decision rule of H2', () => {
    expect(verdictH2({ estimate: 0.01, low: -0.02, high: 0.04 }, 0.05, 10, 50)).toBe('supported')
    expect(verdictH2({ estimate: 0.01, low: -0.02, high: 0.04 }, 0.05, 10, 5)).toBe('partially supported')
    expect(verdictH2({ estimate: 0.1, low: 0.05, high: 0.15 }, 0.05, 10, 50)).toBe('partially supported')
    expect(verdictH2({ estimate: 0.1, low: 0.05, high: 0.15 }, 0.05, 10, 5)).toBe('not supported')
  })
})
