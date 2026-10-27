import { describe, expect, it } from 'vitest'
import { clampHectares, cropNeedM3, EFFICIENCY, OLYMPIC_POOL_M3, poolsOf, savingM3, savingShare, waterUseM3 } from './irrigation'

describe('irrigation lab', () => {
  it('turns millimetres into cubic metres per hectare', () => {
    // maize: 600 mm x 10 m3 per mm per ha x 10 ha
    expect(cropNeedM3('maize', 10)).toBe(60000)
  })

  it('divides the need by the efficiency of the method', () => {
    expect(waterUseM3('maize', 10, 'flood')).toBeCloseTo(60000 / EFFICIENCY.flood, 6)
    expect(waterUseM3('maize', 10, 'drip')).toBeCloseTo(60000 / 0.9, 6)
  })

  it('uses less water the more efficient the method', () => {
    const flood = waterUseM3('wheat', 20, 'flood')
    const sprinkler = waterUseM3('wheat', 20, 'sprinkler')
    const drip = waterUseM3('wheat', 20, 'drip')
    expect(flood).toBeGreaterThan(sprinkler)
    expect(sprinkler).toBeGreaterThan(drip)
  })

  it('saves about a third when switching from flooding to drip', () => {
    expect(savingShare('flood', 'drip')).toBeCloseTo(1 / 3, 6)
    expect(savingM3('maize', 10, 'flood', 'drip')).toBeCloseTo(waterUseM3('maize', 10, 'flood') / 3, 6)
  })

  it('saves nothing when the field already uses drip', () => {
    expect(savingM3('orchard', 5, 'drip', 'drip')).toBe(0)
    expect(savingShare('drip', 'flood')).toBe(0)
  })

  it('keeps the field size in range', () => {
    expect(clampHectares(0)).toBe(1)
    expect(clampHectares(9999)).toBe(500)
    expect(clampHectares(Number.NaN)).toBe(1)
    expect(clampHectares(12.4)).toBe(12)
  })

  it('counts Olympic pools', () => {
    expect(poolsOf(OLYMPIC_POOL_M3 * 3)).toBe(3)
  })
})
