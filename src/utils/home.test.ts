import { describe, expect, it } from 'vitest'
import {
  aeratorSaving,
  clampField,
  DEFAULT_HOME,
  DEFAULT_PLAN,
  homeSavings,
  leakLoss,
  rainCollected,
  rainSaving,
  showerSaving,
  type HomeInputs,
} from './home'

const home: HomeInputs = { ...DEFAULT_HOME }

describe('home water audit', () => {
  it('saves water by showering less', () => {
    // 3 people, 8 -> 5 minutes: 3 x 3 x 9 L x 365
    expect(showerSaving(home)).toBe(3 * 3 * 9 * 365)
    expect(showerSaving({ ...home, targetMin: 12 })).toBe(0)
  })

  it('cuts tap use by 30 percent with an aerator', () => {
    expect(aeratorSaving(home)).toBeCloseTo(3 * 40 * 0.3 * 365, 6)
  })

  it('counts a dripping tap from the size of a drop', () => {
    // 1 drop a second x 0.05 mL x 86,400 s = 4.32 L a day
    expect(leakLoss({ ...home, leakDrops: 1 })).toBeCloseTo(4.32 * 365, 6)
    expect(leakLoss({ ...home, leakDrops: 0 })).toBe(0)
  })

  it('collects rain from the roof: 1 mm on 1 m2 is 1 L', () => {
    expect(rainCollected({ ...home, roofM2: 50, rainMm: 600 })).toBe(50 * 600 * 0.8)
  })

  it('never counts more rain than the garden can use', () => {
    const small = { ...home, roofM2: 200, rainMm: 800, gardenM2: 10 }
    expect(rainSaving(small)).toBe(10 * 300)
    const big = { ...home, roofM2: 20, rainMm: 600, gardenM2: 1000 }
    expect(rainSaving(big)).toBe(rainCollected(big))
  })

  it('adds up every action, or only the ones in the plan', () => {
    const all = homeSavings(home)
    expect(all.total).toBeCloseTo(all.shower + all.aerator + all.leak + all.rain, 6)
    expect(homeSavings(home, DEFAULT_PLAN).total).toBe(0)
    const plan = homeSavings(home, { ...DEFAULT_PLAN, shower: true })
    expect(plan.total).toBe(all.shower)
    expect(plan.aerator).toBe(0)
  })

  it('keeps every input in range', () => {
    expect(clampField('people', 0)).toBe(1)
    expect(clampField('people', 99)).toBe(8)
    expect(clampField('rainMm', 10)).toBe(200)
    expect(clampField('roofM2', Number.NaN)).toBe(60)
  })
})
