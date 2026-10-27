/** Rule of thumb: about 80 % of the water a household uses goes back into the sewer. */
export const RETURN_SHARE = 0.8

export const MIN_LITRES = 50
export const MAX_LITRES = 300
export const DEFAULT_LITRES = 130

/** City sizes the slider steps through (people). */
export const PEOPLE_STEPS: readonly number[] = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000]

/** Reuse rates offered as shortcuts, in percent. The last one is roughly Israel's. */
export const REUSE_PRESETS: readonly number[] = [10, 50, 90]

export function clampLitres(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LITRES
  return Math.min(Math.max(Math.round(value), MIN_LITRES), MAX_LITRES)
}

export function clampRate(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(Math.round(value), 0), 100)
}

/** The step closest to `people`; used to snap saved values back onto the slider. */
export function nearestPeopleStep(people: number): number {
  if (!Number.isFinite(people)) return PEOPLE_STEPS[0]
  let best = PEOPLE_STEPS[0]
  for (const step of PEOPLE_STEPS) {
    if (Math.abs(step - people) < Math.abs(best - people)) best = step
  }
  return best
}

export interface ReuseResult {
  /** Water the city uses in a day, m3. */
  usedM3PerDay: number
  /** Used water that returns to the sewer, m3 per day. */
  wastewaterM3PerDay: number
  reusedM3PerDay: number
  releasedM3PerDay: number
  reusedM3PerYear: number
  /** Share of the city's whole demand that reused water could replace, 0..1. */
  demandShare: number
}

export function calcReuse(people: number, litresPerPerson: number, ratePercent: number): ReuseResult {
  const usedM3PerDay = (nearestPeopleStep(people) * clampLitres(litresPerPerson)) / 1000
  const wastewaterM3PerDay = usedM3PerDay * RETURN_SHARE
  const rate = clampRate(ratePercent) / 100
  const reusedM3PerDay = wastewaterM3PerDay * rate
  return {
    usedM3PerDay,
    wastewaterM3PerDay,
    reusedM3PerDay,
    releasedM3PerDay: wastewaterM3PerDay - reusedM3PerDay,
    reusedM3PerYear: reusedM3PerDay * 365,
    demandShare: RETURN_SHARE * rate,
  }
}
