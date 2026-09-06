import { Emitter } from './emitter'
import { snapshotDemo } from '../../data/demo'
import type { Command, Snapshot, StatutSeance, Transport, TransportEvent, Remise } from './types'

const DELAI_CONNEXION = 700
const DELAI_APPLICATION = 450

/**
 * Transport de démonstration : simule la Suite PSE sans réseau.
 * Il applique les commandes sur un instantané local puis le republie,
 * exactement comme le fera Electron via Firebase.
 */
export class MockTransport implements Transport {
  readonly id = 'mock'
  readonly libelle = 'Simulation locale'
  readonly authRequise = false

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
      try {
        this.appliquer(command)
        this.emitter.emit({ type: 'command', id: command.id, statut: 'appliquee' })
      } catch (e) {
        this.emitter.emit({
          type: 'command',
          id: command.id,
          statut: 'echouee',
          erreur: e instanceof Error ? e.message : String(e),
        })
      }
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
    const p = s.projection
    const payload = command.payload

    switch (command.type) {
      case 'projection.ouvrir':
        if (p) this.snapshot = { ...s, projection: { ...p, fenetreOuverte: true } }
        break

      case 'projection.etape.suivante':
        if (p) {
          const etape = Math.min(p.nbEtapes - 1, p.etape + 1)
          this.snapshot = { ...s, projection: this.majEtape(p, etape) }
        }
        break

      case 'projection.etape.precedente':
        if (p) {
          const etape = Math.max(-1, p.etape - 1)
          this.snapshot = { ...s, projection: this.majEtape(p, etape) }
        }
        break

      case 'projection.etape.aller':
        if (p) {
          const etape = Math.max(-1, Math.min(p.nbEtapes - 1, Number(payload.etape)))
          this.snapshot = { ...s, projection: this.majEtape(p, etape) }
        }
        break

      case 'projection.corrige.basculer':
        if (p) {
          if (!p.corrigeDisponible) throw new Error('Aucun corrigé pour cette étape')
          this.snapshot = { ...s, projection: { ...p, corrigeVisible: !p.corrigeVisible } }
        }
        break

      case 'projection.focus.basculer':
        if (p) this.snapshot = { ...s, projection: { ...p, focus: !p.focus } }
        break

      case 'projection.document.afficher':
        if (p) {
          const idx = Number(payload.idx)
          const visible = payload.visible !== false
          this.snapshot = {
            ...s,
            projection: {
              ...p,
              documents: p.documents.map((d) => (d.idx === idx ? { ...d, visible } : d)),
            },
          }
        }
        break

      case 'seance.statut':
        this.snapshot = this.majSeance(String(payload.seanceId), {
          statut: String(payload.statut) as StatutSeance,
        })
        break

      case 'seance.remise':
        this.snapshot = this.majSeance(String(payload.seanceId), {
          remise: String(payload.remise) as Remise,
        })
        break

      case 'seance.memo':
        this.snapshot = this.majSeance(String(payload.seanceId), { memo: String(payload.memo) })
        break

      case 'action.terminer':
        this.snapshot = {
          ...s,
          actions: s.actions.map((a) =>
            a.id === String(payload.actionId)
              ? { ...a, statut: payload.fait === false ? 'a_faire' : 'fait', retard: false }
              : a,
          ),
        }
        break

      case 'action.creer':
        this.snapshot = {
          ...s,
          actions: [
            {
              id: `a-${Date.now()}`,
              texte: String(payload.texte),
              echeance: payload.echeance ? String(payload.echeance) : null,
              statut: 'a_faire',
              retard: false,
            },
            ...s.actions,
          ],
        }
        break

      case 'note.rapide':
        // Côté Electron : création d'une note flash. Rien à refléter ici.
        break
    }
  }

  private majEtape(p: NonNullable<Snapshot['projection']>, etape: number) {
    const dispo = etape >= 0 ? (p.sommaire[etape]?.corrigeDisponible ?? false) : false
    return { ...p, etape, corrigeVisible: false, corrigeDisponible: dispo }
  }

  private majSeance(id: string, patch: Partial<Snapshot['seances'][number]>): Snapshot {
    const s = this.snapshot
    if (!s.seances.some((x) => x.id === id)) throw new Error('Séance introuvable')
    return { ...s, seances: s.seances.map((x) => (x.id === id ? { ...x, ...patch } : x)) }
  }
}
