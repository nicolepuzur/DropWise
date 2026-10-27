import { createContext, useContext } from 'react'
import type { WaterState } from '../utils/storage'

export interface WaterContextValue extends WaterState {
  update: <K extends keyof WaterState>(section: K, patch: Partial<WaterState[K]>) => void
  reset: () => void
  /** Litres a year the home plan saves. */
  planLitres: number
}

export const WaterContext = createContext<WaterContextValue | null>(null)

export function useWater(): WaterContextValue {
  const ctx = useContext(WaterContext)
  if (!ctx) throw new Error('useWater must be used within a WaterProvider')
  return ctx
}
