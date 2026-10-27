export interface Leak {
  id: number
  x: number
  y: number
  /** Percentage points of the water produced that this leak loses. */
  share: number
  fixed: boolean
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export const NETWORK_W = 1000
export const NETWORK_H = 560

/** Water the plant puts into the network each day, m3 (a mid-sized city). */
export const PRODUCTION_M3_PER_DAY = 25000

/** Domestic use per person per day, litres. */
export const LITRES_PER_PERSON = 130

/** How close a dig has to land to a leak to reach it, in map units. */
export const DIG_RADIUS = 40

/** The pipes of the city. Every leak sits on one of them. */
export const PIPES: readonly Segment[] = [
  { x1: 90, y1: 280, x2: 910, y2: 280 },
  { x1: 330, y1: 110, x2: 910, y2: 110 },
  { x1: 330, y1: 450, x2: 910, y2: 450 },
  { x1: 330, y1: 110, x2: 330, y2: 450 },
  { x1: 620, y1: 110, x2: 620, y2: 450 },
  { x1: 910, y1: 110, x2: 910, y2: 450 },
  { x1: 475, y1: 110, x2: 475, y2: 280 },
  { x1: 765, y1: 280, x2: 765, y2: 450 },
]

/** The plant that feeds the network. */
export const PLANT = { x: 90, y: 280 }

/** Six leaks that together lose 38 % of the water, like many old city networks. */
export const START_LEAKS: readonly Leak[] = [
  { id: 1, x: 200, y: 280, share: 11, fixed: false },
  { id: 2, x: 330, y: 190, share: 8, fixed: false },
  { id: 3, x: 545, y: 110, share: 7, fixed: false },
  { id: 4, x: 620, y: 365, share: 5, fixed: false },
  { id: 5, x: 765, y: 450, share: 4, fixed: false },
  { id: 6, x: 910, y: 200, share: 3, fixed: false },
]

export function freshLeaks(): Leak[] {
  return START_LEAKS.map((leak) => ({ ...leak }))
}

/** Share of the production that leaks out, in percent. */
export function lostPercent(leaks: readonly Leak[]): number {
  return leaks.filter((leak) => !leak.fixed).reduce((sum, leak) => sum + leak.share, 0)
}

export function deliveredPercent(leaks: readonly Leak[]): number {
  return 100 - lostPercent(leaks)
}

export interface DigResult {
  leaks: Leak[]
  /** The leak that was reached, if any. */
  hit: Leak | null
}

/** Digs at a point of the map: the nearest unfixed leak within `radius` is fixed, otherwise it is a dry hole. */
export function dig(leaks: readonly Leak[], x: number, y: number, radius = DIG_RADIUS): DigResult {
  let target: Leak | null = null
  let best = Infinity
  for (const leak of leaks) {
    if (leak.fixed) continue
    const d = Math.hypot(leak.x - x, leak.y - y)
    if (d <= radius && d < best) {
      best = d
      target = leak
    }
  }
  if (!target) return { leaks: leaks.map((leak) => ({ ...leak })), hit: null }
  const hit = target
  return { leaks: leaks.map((leak) => (leak.id === hit.id ? { ...leak, fixed: true } : { ...leak })), hit: { ...hit, fixed: true } }
}

/** Water a share of the production stands for, m3 per day. */
export function m3FromPercent(percent: number, production = PRODUCTION_M3_PER_DAY): number {
  return (production * percent) / 100
}

/** People whose domestic water the given volume covers. */
export function peopleServed(m3PerDay: number): number {
  return Math.round((m3PerDay * 1000) / LITRES_PER_PERSON)
}

/** Where the pressure sensors say the leak is: close to it, but not exactly on it (a repeatable nudge per leak). */
export function sensorHint(leak: Leak): { x: number; y: number; r: number } {
  const angle = leak.id * 2.4
  return { x: leak.x + Math.cos(angle) * 16, y: leak.y + Math.sin(angle) * 16, r: 62 }
}
