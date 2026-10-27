export type MethodId = 'flood' | 'sprinkler' | 'drip'
export type CropId = 'wheat' | 'vegetables' | 'maize' | 'orchard'

export const METHODS: readonly MethodId[] = ['flood', 'sprinkler', 'drip']

/**
 * Typical application efficiency: the share of the water put on the field that the crop can use.
 * Round values in line with FAO's irrigation guidance: surface 60 %, sprinkler 75 %, drip 90 %.
 */
export const EFFICIENCY: Record<MethodId, number> = { flood: 0.6, sprinkler: 0.75, drip: 0.9 }

export interface Crop {
  id: CropId
  /** Net irrigation requirement for a season, in millimetres. Round, illustrative values. */
  netMm: number
}

export const CROPS: readonly Crop[] = [
  { id: 'wheat', netMm: 450 },
  { id: 'vegetables', netMm: 500 },
  { id: 'maize', netMm: 600 },
  { id: 'orchard', netMm: 650 },
]

export const MIN_HECTARES = 1
export const MAX_HECTARES = 500

/** One Olympic swimming pool holds about 2,500 m3. */
export const OLYMPIC_POOL_M3 = 2500

export function clampHectares(value: number): number {
  if (!Number.isFinite(value)) return MIN_HECTARES
  return Math.min(Math.max(Math.round(value), MIN_HECTARES), MAX_HECTARES)
}

export function findCrop(id: CropId): Crop {
  return CROPS.find((crop) => crop.id === id) ?? CROPS[0]
}

/** 1 mm of water over 1 hectare is 10 m3, so the crop needs `netMm x 10` m3 per hectare. */
export function cropNeedM3(crop: CropId, hectares: number): number {
  return findCrop(crop).netMm * 10 * clampHectares(hectares)
}

/** Water taken from the source for a season: what the crop needs, divided by how much of it the method delivers. */
export function waterUseM3(crop: CropId, hectares: number, method: MethodId): number {
  return cropNeedM3(crop, hectares) / EFFICIENCY[method]
}

export function savingM3(crop: CropId, hectares: number, from: MethodId, to: MethodId = 'drip'): number {
  return Math.max(0, waterUseM3(crop, hectares, from) - waterUseM3(crop, hectares, to))
}

/** Share of today's water saved by switching `from` -> `to`. */
export function savingShare(from: MethodId, to: MethodId = 'drip'): number {
  return Math.max(0, 1 - EFFICIENCY[from] / EFFICIENCY[to])
}

export function poolsOf(m3: number): number {
  return m3 / OLYMPIC_POOL_M3
}
