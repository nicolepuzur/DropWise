import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { homeSavings } from '../utils/home'
import { defaultState, loadState, saveState, type WaterState } from '../utils/storage'
import { WaterContext, type WaterContextValue } from './water'

export function WaterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WaterState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const update = useCallback<WaterContextValue['update']>((section, patch) => {
    setState((s) => ({ ...s, [section]: { ...s[section], ...patch } }))
  }, [])

  const reset = useCallback(() => setState(defaultState()), [])

  const value = useMemo<WaterContextValue>(
    () => ({ ...state, update, reset, planLitres: homeSavings(state.home, state.home.plan).total }),
    [state, update, reset],
  )

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>
}
