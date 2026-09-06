import { MockTransport } from './MockTransport'
import { FirebaseTransport } from './FirebaseTransport'
import { lireConfigFirebase } from './firebaseConfig'
import type { Transport } from './types'

export type TransportKind = 'mock' | 'firebase'

/**
 * Choix du transport : la variable VITE_TRANSPORT décide, mais on ne bascule
 * sur Firebase que si la configuration est réellement présente — sinon
 * l'application resterait bloquée sur un écran de connexion inutilisable.
 */
export function transportParDefaut(): TransportKind {
  if (import.meta.env.VITE_TRANSPORT !== 'firebase') return 'mock'
  return lireConfigFirebase() ? 'firebase' : 'mock'
}

/** Le seul endroit où l'on choisit l'implémentation du pont. */
export function createTransport(kind: TransportKind): Transport {
  return kind === 'firebase' ? new FirebaseTransport() : new MockTransport()
}
