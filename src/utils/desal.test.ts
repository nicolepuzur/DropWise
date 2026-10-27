import { describe, expect, it } from 'vitest'
import { BRINE_PER_FRESH, calcDesal, clampLitres, KWH_PER_M3, PANEL_M2_PER_KWP, PITCH_M2, SOLAR_KWH_PER_KWP_YEAR } from './desal'

describe('desalination sizer', () => {
  it('turns people and litres into cubic metres of fresh water a day', () => {
    // 100,000 people x 130 L = 13,000 m3
    expect(calcDesal(100000, 130, 'typical', 'gulf').freshM3PerDay).toBe(13000)
  })

  it('multiplies the water by the energy each technology needs', () => {
    const typical = calcDesal(100000, 130, 'typical', 'gulf')
    expect(typical.energyKwhPerDay).toBeCloseTo(13000 * KWH_PER_M3.typical, 6)
    const minimum = calcDesal(100000, 130, 'minimum', 'gulf')
    expect(minimum.energyKwhPerDay).toBeLessThan(typical.energyKwhPerDay)
  })

  it('sizes the solar field from the yearly yield of the region', () => {
    const r = calcDesal(100000, 130, 'typical', 'gulf')
    const kwhPerKwpPerDay = SOLAR_KWH_PER_KWP_YEAR.gulf / 365
    expect(r.solarKwp).toBeCloseTo(r.energyKwhPerDay / kwhPerKwpPerDay, 6)
    expect(r.panelAreaM2).toBeCloseTo(r.solarKwp * PANEL_M2_PER_KWP, 6)
    expect(r.pitches).toBeCloseTo(r.panelAreaM2 / PITCH_M2, 9)
  })

  it('needs more panels where the sun is weaker', () => {
    const romania = calcDesal(100000, 130, 'typical', 'romania')
    const gulf = calcDesal(100000, 130, 'typical', 'gulf')
    expect(romania.panelAreaM2).toBeGreaterThan(gulf.panelAreaM2)
  })

  it('leaves brine behind', () => {
    const r = calcDesal(1000, 100, 'efficient', 'spain')
    expect(r.brineM3PerDay).toBeCloseTo(r.freshM3PerDay * BRINE_PER_FRESH, 9)
  })

  it('stays sane with bad input', () => {
    expect(calcDesal(Number.NaN, 130, 'typical', 'gulf').freshM3PerDay).toBe(0)
    expect(calcDesal(-5, 130, 'typical', 'gulf').freshM3PerDay).toBe(0)
    expect(clampLitres(1)).toBe(50)
    expect(clampLitres(1000)).toBe(300)
  })
})
