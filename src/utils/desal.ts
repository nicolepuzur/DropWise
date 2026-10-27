export type TechId = 'minimum' | 'efficient' | 'typical'
export type RegionId = 'romania' | 'spain' | 'gulf'

export const TECHS: readonly TechId[] = ['minimum', 'efficient', 'typical']
export const REGIONS: readonly RegionId[] = ['romania', 'spain', 'gulf']

/**
 * Electricity needed to make 1 m3 of fresh water from seawater.
 * 1.06 kWh/m3 is the thermodynamic minimum (Elimelech & Phillip, Science, 2011); real reverse-osmosis plants use
 * roughly 2.5-4 kWh/m3, so "efficient" and "typical" sit inside that range.
 */
export const KWH_PER_M3: Record<TechId, number> = { minimum: 1.06, efficient: 2.5, typical: 3.5 }

/** Rounded yearly yield of 1 kWp of solar panels, in kWh (PVGIS-style typical values). */
export const SOLAR_KWH_PER_KWP_YEAR: Record<RegionId, number> = { romania: 1300, spain: 1700, gulf: 2000 }

/** Panel area per kWp: modern panels turn about a fifth of the sun's light into power, so ~5 m2 per kWp. */
export const PANEL_M2_PER_KWP = 5

/** A full-size football pitch (105 m x 68 m). */
export const PITCH_M2 = 7140

/** Desalination leaves about 1.5 L of salty brine for every litre of fresh water (UN University, 2019). */
export const BRINE_PER_FRESH = 1.5

export const MIN_LITRES = 50
export const MAX_LITRES = 300
export const DEFAULT_LITRES = 130

export function clampLitres(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_LITRES
  return Math.min(Math.max(Math.round(value), MIN_LITRES), MAX_LITRES)
}

export interface DesalResult {
  freshM3PerDay: number
  brineM3PerDay: number
  energyKwhPerDay: number
  /** Solar power that covers the plant's daily energy over a year, in kWp. */
  solarKwp: number
  panelAreaM2: number
  pitches: number
}

export function calcDesal(people: number, litresPerPerson: number, tech: TechId, region: RegionId): DesalResult {
  const safePeople = Number.isFinite(people) ? Math.max(people, 0) : 0
  const freshM3PerDay = (safePeople * clampLitres(litresPerPerson)) / 1000
  const energyKwhPerDay = freshM3PerDay * KWH_PER_M3[tech]
  const kwhPerKwpPerDay = SOLAR_KWH_PER_KWP_YEAR[region] / 365
  const solarKwp = energyKwhPerDay / kwhPerKwpPerDay
  const panelAreaM2 = solarKwp * PANEL_M2_PER_KWP
  return {
    freshM3PerDay,
    brineM3PerDay: freshM3PerDay * BRINE_PER_FRESH,
    energyKwhPerDay,
    solarKwp,
    panelAreaM2,
    pitches: panelAreaM2 / PITCH_M2,
  }
}
