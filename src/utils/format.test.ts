import { describe, expect, it } from 'vitest'
import { fill, formatCompact, formatM3, formatNumber, formatVolume } from './format'

const units = { l: 'L', m3: 'm³' }

describe('number formatting', () => {
  it('groups thousands in the reader language', () => {
    expect(formatNumber(1234567, 'en')).toBe('1,234,567')
    expect(formatNumber(1234567, 'ro')).toContain('234')
  })

  it('shortens big numbers', () => {
    expect(formatCompact(2500000, 'en')).toBe('2.5M')
    expect(formatCompact(950, 'en')).toBe('950')
  })

  it('switches from litres to cubic metres at a thousand litres', () => {
    expect(formatVolume(250, 'en', units)).toBe('250 L')
    expect(formatVolume(5, 'en', units)).toBe('5 L')
    expect(formatVolume(12000, 'en', units)).toBe('12 m³')
  })

  it('formats cubic metres', () => {
    expect(formatM3(6.4, 'en', 'm³')).toBe('6.4 m³')
    expect(formatM3(260000, 'en', 'm³')).toBe('260K m³')
  })

  it('fills placeholders and leaves unknown ones alone', () => {
    expect(fill('{n} bathtubs of {what}', { n: 12, what: 'water' })).toBe('12 bathtubs of water')
    expect(fill('{missing} stays', {})).toBe('{missing} stays')
  })
})
