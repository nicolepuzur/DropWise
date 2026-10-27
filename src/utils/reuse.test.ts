import { describe, expect, it } from 'vitest'
import { calcReuse, clampLitres, clampRate, nearestPeopleStep, PEOPLE_STEPS, RETURN_SHARE } from './reuse'

describe('reuse loop', () => {
  it('reuses nothing when the rate is zero', () => {
    const r = calcReuse(100000, 130, 0)
    expect(r.reusedM3PerDay).toBe(0)
    expect(r.releasedM3PerDay).toBeCloseTo(r.wastewaterM3PerDay, 9)
    expect(r.demandShare).toBe(0)
  })

  it('returns about 80 percent of the used water as wastewater', () => {
    const r = calcReuse(100000, 130, 50)
    // 100,000 people x 130 L = 13,000 m3 a day used
    expect(r.usedM3PerDay).toBe(13000)
    expect(r.wastewaterM3PerDay).toBeCloseTo(13000 * RETURN_SHARE, 6)
  })

  it('splits wastewater into reused and released', () => {
    const r = calcReuse(100000, 130, 90)
    expect(r.reusedM3PerDay + r.releasedM3PerDay).toBeCloseTo(r.wastewaterM3PerDay, 9)
    expect(r.reusedM3PerDay).toBeCloseTo(10400 * 0.9, 6)
    expect(r.reusedM3PerYear).toBeCloseTo(r.reusedM3PerDay * 365, 6)
    expect(r.demandShare).toBeCloseTo(0.72, 9)
  })

  it('snaps city sizes onto the slider steps', () => {
    expect(nearestPeopleStep(120000)).toBe(100000)
    expect(nearestPeopleStep(Number.NaN)).toBe(PEOPLE_STEPS[0])
    expect(PEOPLE_STEPS).toContain(nearestPeopleStep(300000))
  })

  it('clamps nonsense input', () => {
    expect(clampLitres(5)).toBe(50)
    expect(clampLitres(9999)).toBe(300)
    expect(clampLitres(Number.NaN)).toBe(130)
    expect(clampRate(-3)).toBe(0)
    expect(clampRate(140)).toBe(100)
  })
})
