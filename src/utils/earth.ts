export type EarthPartId = 'salt' | 'ice' | 'ground'

export interface EarthPart {
  id: EarthPartId
  /** Share of all the water on Earth, in percent (USGS Water Science School, rounded). */
  percent: number
}

/**
 * Where Earth's water is. 97.5 % is salt water, 2.5 % is fresh: 1.74 % locked in ice and 0.76 % underground.
 * The three parts add up to 100.
 */
export const EARTH_PARTS: readonly EarthPart[] = [
  { id: 'salt', percent: 97.5 },
  { id: 'ice', percent: 1.74 },
  { id: 'ground', percent: 0.76 },
]

/** Fresh lakes hold 0.007 % of all water, rivers about 0.0002 % (USGS). Lakes and rivers are the water people see and use most. */
export const SURFACE_PERCENT = 0.007

export const FRESH_PERCENT = 2.5

/** Splits `total` dots between the shares with the largest-remainder method, so the dots always add up exactly. */
export function allocateDots(shares: readonly number[], total = 100): number[] {
  const sum = shares.reduce((a, b) => a + b, 0)
  if (sum <= 0) return shares.map(() => 0)
  const exact = shares.map((s) => (s / sum) * total)
  const dots = exact.map(Math.floor)
  let left = total - dots.reduce((a, b) => a + b, 0)
  const order = exact.map((value, i) => ({ i, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest)
  for (let k = 0; left > 0 && k < order.length; k++, left--) dots[order[k].i] += 1
  return dots
}

/** Millilitres of lakes and rivers in a 100-litre pour of all Earth's water. */
export function surfaceMillilitresPer100L(): number {
  return (SURFACE_PERCENT / 100) * 100 * 1000
}

/** Which part a dot (0-based, counted from the first dot) belongs to. */
export function partOfDot(index: number, dots: readonly number[]): number {
  let end = 0
  for (let i = 0; i < dots.length; i++) {
    end += dots[i]
    if (index < end) return i
  }
  return dots.length - 1
}
