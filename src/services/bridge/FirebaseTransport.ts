import { Emitter } from './emitter'
import type { Command, Transport, TransportEvent } from './types'

/**
 * EMPLACEMENT RÉSERVÉ - Firebase n’est pas encore installé.
 *
 * Le jour ou on le branché, il n'y aura QUE ce fichier a ecrire :
 *   1. npm install firebase
 *   2. renseigner .env.local a partir de .env.example
 *   3. remplacer les corps de methodes ci-dessous :
 *      - connect()    : initializeApp + auth + onSnapshot sur
 *                       "postes/{uid}" (instantané publié par Electron)
 *                       -> emit { type: 'snapshot', snapshot }
 *                       -> emit { type: 'status', status: 'online' }
 *      - send(cmd)    : addDoc dans "commandes/{uid}/file" avec cmd.id
 *                       comme identifiant (idempotence), puis suivre le champ
 *                       "statut" écrit par Electron -> emit { type: 'command' }
 *      - disconnect() : couper les abonnements.
 *
 * Aucune clé n’est écrite dans le code : tout passe par import.meta.env.
 */
export class FirebaseTransport implements Transport {
  readonly id = 'firebase'
  readonly libelle = 'Firebase (non configuré)'

  private emitter = new Emitter()

  subscribe(listener: (event: TransportEvent) => void): () => void {
    return this.emitter.subscribe(listener)
  }

  connect(): void {
    this.emitter.emit({ type: 'status', status: 'offline' })
    console.warn(
      '[bridge] Le transport Firebase n’est pas encore implémenté. ' +
        'Reste en mode simulation : VITE_TRANSPORT=mock',
    )
  }

  disconnect(): void {
    this.emitter.emit({ type: 'status', status: 'offline' })
  }

  async send(command: Command): Promise<void> {
    this.emitter.emit({
      type: 'command',
      id: command.id,
      statut: 'echouee',
      erreur: 'Transport Firebase non configuré',
    })
  }
}
