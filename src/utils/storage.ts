import { clampHectares, CROPS, METHODS, type CropId, type MethodId } from './irrigation'
import { clampLitres as clampReuseLitres, clampRate, nearestPeopleStep } from './reuse'
import { clampLitres as clampDesalLitres, REGIONS, TECHS, type RegionId, type TechId } from './desal'
import { clampField, DEFAULT_HOME, DEFAULT_PLAN, HOME_RANGES, PLAN_KEYS, type HomeField, type HomeInputs, type Plan } from './home'

export interface WaterState {
  irrigation: { hectares: number; crop: CropId; current: MethodId }
  reuse: { people: number; litres: number; rate: number }
  desal: { people: number; litres: number; tech: TechId; region: RegionId }
  home: HomeInputs & { plan: Plan }
}

export const STORAGE_KEY = 'dropwise-state-v1'

export function defaultState(): WaterState {
  return {
    irrigation: { hectares: 20, crop: 'maize', current: 'flood' },
    reuse: { people: 100000, litres: 130, rate: 50 },
    desal: { people: 100000, litres: 130, tech: 'efficient', region: 'gulf' },
    home: { ...DEFAULT_HOME, plan: { ...DEFAULT_PLAN } },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

/** Rebuilds a state from whatever was in localStorage; every field that does not check out falls back to its default. */
export function sanitizeState(raw: unknown): WaterState {
  const state = defaultState()
  if (!isRecord(raw)) return state

  if (isRecord(raw.irrigation)) {
    const r = raw.irrigation
    if (typeof r.hectares === 'number') state.irrigation.hectares = clampHectares(r.hectares)
    state.irrigation.crop = oneOf(
      r.crop,
      CROPS.map((c) => c.id),
      state.irrigation.crop,
    )
    state.irrigation.current = oneOf(r.current, METHODS, state.irrigation.current)
  }

  if (isRecord(raw.reuse)) {
    const r = raw.reuse
    if (typeof r.people === 'number') state.reuse.people = nearestPeopleStep(r.people)
    if (typeof r.litres === 'number') state.reuse.litres = clampReuseLitres(r.litres)
    if (typeof r.rate === 'number') state.reuse.rate = clampRate(r.rate)
  }

  if (isRecord(raw.desal)) {
    const r = raw.desal
    if (typeof r.people === 'number') state.desal.people = nearestPeopleStep(r.people)
    if (typeof r.litres === 'number') state.desal.litres = clampDesalLitres(r.litres)
    state.desal.tech = oneOf(r.tech, TECHS, state.desal.tech)
    state.desal.region = oneOf(r.region, REGIONS, state.desal.region)
  }

  if (isRecord(raw.home)) {
    const r = raw.home
    for (const field of Object.keys(HOME_RANGES) as HomeField[]) {
      const value = r[field]
      if (typeof value === 'number') state.home[field] = clampField(field, value)
    }
    if (isRecord(r.plan)) {
      for (const key of PLAN_KEYS) {
        if (typeof r.plan[key] === 'boolean') state.home.plan[key] = r.plan[key]
      }
    }
  }

  return state
}

export function loadState(): WaterState {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (!text) return defaultState()
    return sanitizeState(JSON.parse(text))
  } catch {
    // localStorage unavailable or the saved text is not JSON: start fresh
    return defaultState()
  }
}

export function saveState(state: WaterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore: the plan only lasts for this visit
  }
}
