import { describe, expect, it } from 'vitest'
import {
  deliveredPercent,
  dig,
  DIG_RADIUS,
  freshLeaks,
  lostPercent,
  m3FromPercent,
  peopleServed,
  PIPES,
  PRODUCTION_M3_PER_DAY,
  sensorHint,
  START_LEAKS,
} from './leaks'

function distanceToSegment(px: number, py: number, s: { x1: number; y1: number; x2: number; y2: number }): number {
  const dx = s.x2 - s.x1
  const dy = s.y2 - s.y1
  const t = Math.max(0, Math.min(1, ((px - s.x1) * dx + (py - s.y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy))
}

describe('leak hunter', () => {
  it('starts with 38 percent of the water lost', () => {
    expect(lostPercent(freshLeaks())).toBe(38)
    expect(deliveredPercent(freshLeaks())).toBe(62)
  })

  it('places every leak on a pipe', () => {
    for (const leak of START_LEAKS) {
      const nearest = Math.min(...PIPES.map((pipe) => distanceToSegment(leak.x, leak.y, pipe)))
      expect(nearest).toBeLessThan(1)
    }
  })

  it('fixes a leak that is dug close enough', () => {
    const leaks = freshLeaks()
    const result = dig(leaks, 205, 285)
    expect(result.hit?.id).toBe(1)
    expect(lostPercent(result.leaks)).toBe(27)
    // the original list is not touched
    expect(lostPercent(leaks)).toBe(38)
  })

  it('treats a dig far from every leak as a dry hole', () => {
    const result = dig(freshLeaks(), 500, 400)
    expect(result.hit).toBeNull()
    expect(lostPercent(result.leaks)).toBe(38)
  })

  it('never fixes the same leak twice', () => {
    const once = dig(freshLeaks(), 200, 280).leaks
    const twice = dig(once, 200, 280)
    expect(twice.hit).toBeNull()
    expect(lostPercent(twice.leaks)).toBe(27)
  })

  it('reaches every leak by digging at the place the sensors point to', () => {
    let leaks = freshLeaks()
    for (const leak of START_LEAKS) {
      const hint = sensorHint(leak)
      const result = dig(leaks, hint.x, hint.y)
      expect(result.hit?.id).toBe(leak.id)
      leaks = result.leaks
    }
    expect(lostPercent(leaks)).toBe(0)
  })

  it('keeps the sensor hint inside the dig radius', () => {
    for (const leak of START_LEAKS) {
      const hint = sensorHint(leak)
      expect(Math.hypot(hint.x - leak.x, hint.y - leak.y)).toBeLessThan(DIG_RADIUS)
    }
  })

  it('converts percentage points into water and people', () => {
    expect(m3FromPercent(38)).toBe(PRODUCTION_M3_PER_DAY * 0.38)
    expect(peopleServed(130)).toBe(1000)
  })
})
