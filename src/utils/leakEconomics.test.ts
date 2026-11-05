import { describe, expect, it } from 'vitest'
import {
  breakEvenLeaksPerYear,
  estimateLeakEconomics,
  litresPerSecondToM3PerDay,
  MARKET_PRICES,
  MDL_PER_EUR,
  mdlToEur,
  meanBenchmarkLeakLitresPerSecond,
  WATER_TARIFF_MDL,
  type LeakEconomicsInput,
} from './leakEconomics'

const base: LeakEconomicsInput = {
  leakLitresPerSecond: 10,
  dryHoles: { naive: 7, fingerprint: 6, fit: 3 },
  costPerDigEur: 800,
  daysPerDig: 0.5,
  waterValueShare: 1,
  leaksPerYear: 4,
  systemCostEur: 12000,
  runningCostEurPerYear: 1500,
}

describe('leak economics', () => {
  it('converts litres per second to cubic metres a day', () => {
    expect(litresPerSecondToM3PerDay(1)).toBeCloseTo(86.4, 9)
    expect(litresPerSecondToM3PerDay(10)).toBeCloseTo(864, 9)
  })

  it('converts lei to euro at the rate of the model', () => {
    expect(mdlToEur(MDL_PER_EUR)).toBeCloseTo(1, 12)
    expect(mdlToEur(20.14 * 50)).toBeCloseTo(50, 9)
  })

  it('gives the mean leak of the benchmark (log-uniform 2-10 % of 0.25 m3/s)', () => {
    expect(meanBenchmarkLeakLitresPerSecond()).toBeCloseTo((250 * 0.08) / Math.log(5), 9)
    expect(meanBenchmarkLeakLitresPerSecond()).toBeGreaterThan(12)
    expect(meanBenchmarkLeakLitresPerSecond()).toBeLessThan(13)
  })

  it('values a dry hole as the dig plus the water lost while it takes place', () => {
    const e = estimateLeakEconomics(base)
    const lostMdl = 864 * WATER_TARIFF_MDL
    expect(e.waterLostM3PerDay).toBeCloseTo(864, 9)
    expect(e.waterLostMdlPerDay).toBeCloseTo(lostMdl, 6)
    expect(e.dryHoleCostEur).toBeCloseTo(800 + 0.5 * (lostMdl / MDL_PER_EUR), 6)
  })

  it('saves money for every dry hole a method avoids, and nothing for the naive method', () => {
    const e = estimateLeakEconomics(base)
    expect(e.fit.dryHolesAvoidedPerLeak).toBe(4)
    expect(e.fingerprint.dryHolesAvoidedPerLeak).toBe(1)
    expect(e.fit.savingPerLeakEur).toBeCloseTo(4 * e.dryHoleCostEur, 6)
    expect(e.fit.savingPerYearEur).toBeCloseTo(4 * e.fit.savingPerLeakEur - 1500, 6)
    expect(e.fit.savingPerLeakEur).toBeGreaterThan(e.fingerprint.savingPerLeakEur)
  })

  it('pays the system back in months from the yearly saving', () => {
    const e = estimateLeakEconomics(base)
    expect(e.fit.paybackMonths).toBeCloseTo((12000 / e.fit.savingPerYearEur) * 12, 9)
  })

  it('never pays back when the method is no better than the naive one', () => {
    const worse = estimateLeakEconomics({ ...base, dryHoles: { naive: 5, fingerprint: 5.5, fit: 5 } })
    expect(worse.fit.paybackMonths).toBe(Infinity)
    expect(worse.fingerprint.paybackMonths).toBe(Infinity)
  })

  it('never pays back when the running costs eat the whole saving', () => {
    expect(estimateLeakEconomics({ ...base, runningCostEurPerYear: 1_000_000 }).fit.paybackMonths).toBe(Infinity)
  })

  it('makes a longer dig or a bigger leak worth more', () => {
    expect(estimateLeakEconomics({ ...base, daysPerDig: 1 }).dryHoleCostEur).toBeGreaterThan(estimateLeakEconomics(base).dryHoleCostEur)
    expect(estimateLeakEconomics({ ...base, leakLitresPerSecond: 20 }).dryHoleCostEur).toBeGreaterThan(estimateLeakEconomics(base).dryHoleCostEur)
  })

  it('takes the share of the tariff into account', () => {
    const half = estimateLeakEconomics({ ...base, waterValueShare: 0.5 })
    expect(half.waterLostMdlPerDay).toBeCloseTo(estimateLeakEconomics(base).waterLostMdlPerDay / 2, 6)
  })

  it('finds the number of leaks a year at which the system pays for itself in five years', () => {
    const leaks = breakEvenLeaksPerYear(base, 'fit', 5)
    const check = estimateLeakEconomics({ ...base, leaksPerYear: leaks })
    // over five years the saving equals the system cost
    expect(check.fit.savingPerYearEur * 5).toBeCloseTo(12000, 4)
    expect(breakEvenLeaksPerYear(base, 'naive', 5)).toBe(Infinity)
    expect(breakEvenLeaksPerYear({ ...base, dryHoles: { naive: 5, fingerprint: 5, fit: 5 } }, 'fit', 5)).toBe(Infinity)
  })

  it('lists the market prices with a source for each', () => {
    expect(MARKET_PRICES.length).toBeGreaterThanOrEqual(4)
    for (const p of MARKET_PRICES) {
      expect(p.price.length).toBeGreaterThan(0)
      expect(p.source.length).toBeGreaterThan(0)
    }
  })
})
