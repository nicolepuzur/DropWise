import { describe, expect, it } from 'vitest'
import { defaultState, sanitizeState } from './storage'

describe('saved state', () => {
  it('falls back to the defaults for anything that is not an object', () => {
    expect(sanitizeState(null)).toEqual(defaultState())
    expect(sanitizeState('hello')).toEqual(defaultState())
    expect(sanitizeState([1, 2, 3])).toEqual(defaultState())
  })

  it('keeps valid values', () => {
    const saved = {
      irrigation: { hectares: 80, crop: 'orchard', current: 'sprinkler' },
      reuse: { people: 500000, litres: 160, rate: 90 },
      desal: { people: 25000, litres: 100, tech: 'typical', region: 'spain' },
      home: { people: 4, showerMin: 12, targetMin: 6, leakDrops: 2, roofM2: 90, rainMm: 700, gardenM2: 200, plan: { shower: true, aerator: false, leak: true, rain: false } },
    }
    expect(sanitizeState(saved)).toEqual(saved)
  })

  it('clamps numbers that are out of range', () => {
    const state = sanitizeState({ irrigation: { hectares: 99999 }, reuse: { rate: 500, litres: 1 }, home: { people: 0, rainMm: 3 } })
    expect(state.irrigation.hectares).toBe(500)
    expect(state.reuse.rate).toBe(100)
    expect(state.reuse.litres).toBe(50)
    expect(state.home.people).toBe(1)
    expect(state.home.rainMm).toBe(200)
  })

  it('snaps city sizes onto the slider steps', () => {
    expect(sanitizeState({ reuse: { people: 120000 } }).reuse.people).toBe(100000)
  })

  it('ignores unknown choices and wrong types', () => {
    const state = sanitizeState({
      irrigation: { hectares: '20', crop: 'rice', current: 'laser' },
      desal: { tech: 'magic', region: 'moon' },
      home: { plan: { shower: 'yes', rain: true } },
    })
    const fresh = defaultState()
    expect(state.irrigation).toEqual(fresh.irrigation)
    expect(state.desal.tech).toBe(fresh.desal.tech)
    expect(state.desal.region).toBe(fresh.desal.region)
    expect(state.home.plan.shower).toBe(false)
    expect(state.home.plan.rain).toBe(true)
  })
})
