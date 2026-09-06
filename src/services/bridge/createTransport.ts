import { MockTransport } from './MockTransport'
import { FirebaseTransport } from './FirebaseTransport'
import type { Transport } from './types'

export type TransportKind = 'mock' | 'firebase'

export function transportParDefaut(): TransportKind {
  const v = import.meta.env.VITE_TRANSPORT
  return v === 'firebase' ? 'firebase' : 'mock'
}

/** Unique endroit où l’on choisit l’implémentation du pont. */
export function createTransport(kind: TransportKind): Transport {
  return kind === 'firebase' ? new FirebaseTransport() : new MockTransport()
}
