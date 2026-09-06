import { useContext } from 'react'
import { BridgeContext, type BridgeValue } from '../services/bridge/BridgeContext'

/** Accès au pont Electron depuis n’importe quel composant. */
export function useBridge(): BridgeValue {
  const ctx = useContext(BridgeContext)
  if (!ctx) throw new Error('useBridge doit être utilisé dans <BridgeProvider>')
  return ctx
}
