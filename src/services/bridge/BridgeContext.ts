import { createContext } from 'react'
import type { Command, CommandPayload, CommandType, ConnectionStatus, Snapshot } from './types'
import type { TransportKind } from './createTransport'

/** Ce que toute l'application peut lire et déclencher. */
export interface BridgeValue {
  status: ConnectionStatus
  transportId: TransportKind
  transportLibelle: string
  snapshot: Snapshot | null
  commandes: Command[]
  connecter: () => void
  deconnecter: () => void
  envoyer: (type: CommandType, payload?: CommandPayload) => Command
  viderHistorique: () => void
}

/**
 * Le contexte vit dans son propre fichier (sans composant) :
 * c'est ce qui permet au rechargement à chaud de Vite de fonctionner
 * correctement quand on modifie le fournisseur.
 */
export const BridgeContext = createContext<BridgeValue | null>(null)
