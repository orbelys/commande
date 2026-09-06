import { Emitter } from './emitter'
import { snapshotDemo } from '../../data/demo'
import type { Command, Snapshot, Transport, TransportEvent } from './types'

const DELAI_CONNEXION = 700
const DELAI_APPLICATION = 450

/**
 * Transport de démonstration : simule Electron sans reseau.
 * Il applique les commandes sur un instantané local puis le republie,
 * exactement comme le fera Electron via Firebase.
 */
export class MockTransport implements Transport {
  readonly id = 'mock'
  readonly libelle = 'Simulation locale'

  private emitter = new Emitter()
  private snapshot: Snapshot = snapshotDemo()
  private timers: ReturnType<typeof setTimeout>[] = []
  private connecte = false

  subscribe(listener: (event: TransportEvent) => void): () => void {
    return this.emitter.subscribe(listener)
  }

  connect(): void {
    this.emitter.emit({ type: 'status', status: 'connecting' })
    this.planifier(() => {
      this.connecte = true
      this.emitter.emit({ type: 'status', status: 'online' })
      this.publier()
    }, DELAI_CONNEXION)
  }

  disconnect(): void {
    this.connecte = false
    this.timers.forEach(clearTimeout)
    this.timers = []
    this.emitter.emit({ type: 'status', status: 'offline' })
  }

  async send(command: Command): Promise<void> {
    if (!this.connecte) {
      this.emitter.emit({
        type: 'command',
        id: command.id,
        statut: 'echouee',
        erreur: 'Electron est hors ligne',
      })
      return
    }
    this.emitter.emit({ type: 'command', id: command.id, statut: 'envoyee' })
    this.planifier(() => {
      this.appliquer(command)
      this.emitter.emit({ type: 'command', id: command.id, statut: 'appliquee' })
      this.publier()
    }, DELAI_APPLICATION)
  }

  private planifier(fn: () => void, delai: number): void {
    const t = setTimeout(() => {
      this.timers = this.timers.filter((x) => x !== t)
      fn()
    }, delai)
    this.timers.push(t)
  }

  private publier(): void {
    this.snapshot = { ...this.snapshot, majA: new Date().toISOString() }
    this.emitter.emit({ type: 'snapshot', snapshot: this.snapshot })
  }

  /** Reproduit ce que fera Electron à la réception d'une commande. */
  private appliquer(command: Command): void {
    const s = this.snapshot
    const seance = s.seance
    const cours = seance ? s.cours.find((c) => c.id === seance.coursId) : undefined
    const maxEtape = cours?.nbEtapes ?? 1

    switch (command.type) {
      case 'classe.selectionner': {
        const classeId = String(command.payload.classeId)
        const premier = s.cours.find((c) => c.classeId === classeId)
        this.snapshot = {
          ...s,
          seance: {
            coursId: premier?.id ?? seance?.coursId ?? s.cours[0].id,
            classeId,
            etape: 1,
            demarreeA: null,
            enPause: false,
            corrigeVisible: false,
          },
        }
        break
      }
      case 'cours.selectionner': {
        const coursId = String(command.payload.coursId)
        const choisi = s.cours.find((c) => c.id === coursId)
        this.snapshot = {
          ...s,
          seance: {
            coursId,
            classeId: choisi?.classeId ?? seance?.classeId ?? s.classes[0].id,
            etape: 1,
            demarreeA: null,
            enPause: false,
            corrigeVisible: false,
          },
        }
        break
      }
      case 'seance.demarrer':
        if (seance) {
          this.snapshot = {
            ...s,
            seance: { ...seance, demarreeA: new Date().toISOString(), enPause: false },
          }
        }
        break
      case 'seance.etape.suivante':
        if (seance) {
          this.snapshot = {
            ...s,
            seance: {
              ...seance,
              etape: Math.min(maxEtape, seance.etape + 1),
              corrigeVisible: false,
            },
          }
        }
        break
      case 'seance.etape.precedente':
        if (seance) {
          this.snapshot = {
            ...s,
            seance: { ...seance, etape: Math.max(1, seance.etape - 1), corrigeVisible: false },
          }
        }
        break
      case 'seance.pause.basculer':
        if (seance) this.snapshot = { ...s, seance: { ...seance, enPause: !seance.enPause } }
        break
      case 'seance.corrige.basculer':
        if (seance) {
          this.snapshot = { ...s, seance: { ...seance, corrigeVisible: !seance.corrigeVisible } }
        }
        break
      case 'progression.marquer': {
        const id = String(command.payload.itemId)
        const statut = String(command.payload.statut) as 'a_venir' | 'en_cours' | 'fait'
        this.snapshot = {
          ...s,
          progression: s.progression.map((p) => (p.id === id ? { ...p, statut } : p)),
        }
        break
      }
      case 'seance.valider':
      case 'seance.enregistrer':
      case 'document.ouvrir':
        // Rien a changer dans l'instantané simule : Electron s’en charge.
        break
    }
  }
}
