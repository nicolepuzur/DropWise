import { describe, expect, it } from 'vitest'
import { allocateDots, EARTH_PARTS, FRESH_PERCENT, partOfDot, SURFACE_PERCENT, surfaceMillilitresPer100L } from './earth'

describe('Earth water', () => {
  it('adds up to 100 percent', () => {
    const sum = EARTH_PARTS.reduce((a, p) => a + p.percent, 0)
    expect(sum).toBeCloseTo(100, 9)
  })

  it('keeps fresh water at 2.5 percent', () => {
    const fresh = EARTH_PARTS.filter((p) => p.id !== 'salt').reduce((a, p) => a + p.percent, 0)
    expect(fresh).toBeCloseTo(FRESH_PERCENT, 9)
  })

  it('always hands out exactly the number of dots asked for', () => {
    const dots = allocateDots(EARTH_PARTS.map((p) => p.percent))
    expect(dots.reduce((a, b) => a + b, 0)).toBe(100)
    expect(dots).toEqual([97, 2, 1])
    expect(allocateDots([1, 1, 1], 10).reduce((a, b) => a + b, 0)).toBe(10)
  })

  it('returns zeros when there is nothing to share', () => {
    expect(allocateDots([0, 0], 100)).toEqual([0, 0])
  })

  it('maps a dot to its part', () => {
    const dots = [97, 2, 1]
    expect(partOfDot(0, dots)).toBe(0)
    expect(partOfDot(96, dots)).toBe(0)
    expect(partOfDot(97, dots)).toBe(1)
    expect(partOfDot(98, dots)).toBe(1)
    expect(partOfDot(99, dots)).toBe(2)
  })

  it('turns lakes and rivers into about 7 millilitres of 100 litres', () => {
    expect(SURFACE_PERCENT).toBe(0.007)
    expect(surfaceMillilitresPer100L()).toBeCloseTo(7, 6)
  })
})
