/** A typical shower head delivers 8-12 L a minute; 9 is a round middle. */
export const SHOWER_L_PER_MIN = 9

/** Tap use per person per day: about 5 minutes at 8 L a minute. */
export const TAP_L_PER_PERSON_DAY = 40

/** A WaterSense-style aerator cuts a tap's flow by about 30 %. */
export const AERATOR_SAVING = 0.3

/** One drop is about 0.05 mL (20 drops to the millilitre). */
export const DROP_ML = 0.05

/** Share of the rain that falls on a roof and ends up in a barrel. */
export const RUNOFF = 0.8

/** Extra water a garden needs in a year, litres per square metre. */
export const GARDEN_L_PER_M2_YEAR = 300

export const BATH_L = 150

/** A person's drinking water: 2 litres a day. */
export const DRINKING_L_PER_YEAR = 730

export interface HomeInputs {
  people: number
  showerMin: number
  targetMin: number
  /** Drops per second from a dripping tap. */
  leakDrops: number
  roofM2: number
  rainMm: number
  gardenM2: number
}

export interface Plan {
  shower: boolean
  aerator: boolean
  leak: boolean
  rain: boolean
}

export type PlanKey = keyof Plan

export const PLAN_KEYS: readonly PlanKey[] = ['shower', 'aerator', 'leak', 'rain']

export const HOME_RANGES = {
  people: { min: 1, max: 8, def: 3 },
  showerMin: { min: 1, max: 30, def: 8 },
  targetMin: { min: 1, max: 30, def: 5 },
  leakDrops: { min: 0, max: 5, def: 1 },
  roofM2: { min: 0, max: 300, def: 60 },
  rainMm: { min: 200, max: 1500, def: 640 },
  gardenM2: { min: 0, max: 1000, def: 100 },
} as const

export type HomeField = keyof typeof HOME_RANGES

export const DEFAULT_HOME: HomeInputs = {
  people: HOME_RANGES.people.def,
  showerMin: HOME_RANGES.showerMin.def,
  targetMin: HOME_RANGES.targetMin.def,
  leakDrops: HOME_RANGES.leakDrops.def,
  roofM2: HOME_RANGES.roofM2.def,
  rainMm: HOME_RANGES.rainMm.def,
  gardenM2: HOME_RANGES.gardenM2.def,
}

export const DEFAULT_PLAN: Plan = { shower: false, aerator: false, leak: false, rain: false }

export function clampField(field: HomeField, value: number): number {
  const range = HOME_RANGES[field]
  if (!Number.isFinite(value)) return range.def
  return Math.min(Math.max(Math.round(value), range.min), range.max)
}

/** Litres a year saved by showering `targetMin` instead of `showerMin` minutes. */
export function showerSaving(h: HomeInputs): number {
  return h.people * Math.max(0, h.showerMin - h.targetMin) * SHOWER_L_PER_MIN * 365
}

export function aeratorSaving(h: HomeInputs): number {
  return h.people * TAP_L_PER_PERSON_DAY * AERATOR_SAVING * 365
}

/** Litres a year lost to a dripping tap. */
export function leakLoss(h: HomeInputs): number {
  return (h.leakDrops * DROP_ML * 86400 * 365) / 1000
}

/** Litres a year a roof collects. */
export function rainCollected(h: HomeInputs): number {
  return h.roofM2 * h.rainMm * RUNOFF
}

/** The barrel only helps as far as the garden needs the water. */
export function rainSaving(h: HomeInputs): number {
  return Math.min(rainCollected(h), h.gardenM2 * GARDEN_L_PER_M2_YEAR)
}

export interface HomeSavings {
  shower: number
  aerator: number
  leak: number
  rain: number
  total: number
}

/** Litres a year saved by each action, and in total. Pass a plan to count only the chosen actions. */
export function homeSavings(h: HomeInputs, plan?: Plan): HomeSavings {
  const on = (key: PlanKey) => (plan ? plan[key] : true)
  const shower = on('shower') ? showerSaving(h) : 0
  const aerator = on('aerator') ? aeratorSaving(h) : 0
  const leak = on('leak') ? leakLoss(h) : 0
  const rain = on('rain') ? rainSaving(h) : 0
  return { shower, aerator, leak, rain, total: shower + aerator + leak + rain }
}
