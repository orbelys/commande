import { createContext } from 'react'
import type {
  Command,
  CommandPayload,
  CommandType,
  ConnectionStatus,
  Session,
  Snapshot,
} from './types'
import type { TransportKind } from './createTransport'

/** Ce que toute l'application peut lire et déclencher. */
export interface BridgeValue {
  status: ConnectionStatus
  transportId: TransportKind
  transportLibelle: string
  /** Le transport exige une connexion par identifiants. */
  authRequise: boolean
  session: Session | null
  snapshot: Snapshot | null
  commandes: Command[]
  erreur: string | null
  connecter: () => void
  deconnecter: () => void
  seConnecter: (email: string, motDePasse: string) => Promise<void>
  seDeconnecter: () => Promise<void>
  envoyer: (type: CommandType, payload?: CommandPayload) => Command
  viderHistorique: () => void
}

/**
 * Le contexte vit dans son propre fichier (sans composant) :
 * c'est ce qui permet au rechargement à chaud de Vite de fonctionner
 * correctement quand on modifie le fournisseur.
 */
export const BridgeContext = createContext<BridgeValue | null>(null)
