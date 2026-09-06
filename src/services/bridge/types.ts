/**
 * Contrat partagé entre le telephone et l'application Electron.
 * Ce fichier est la reference : côté Electron, on implementera exactement
 * ces mêmes formes de donnees et de commandes.
 */

/** État du lien avec Electron. */
export type ConnectionStatus = 'offline' | 'connecting' | 'online'

/** Une classe (données fictives tant que le pont n'est pas branché). */
export interface Classe {
  id: string
  nom: string
  niveau: string
  effectif: number
}

/** Un cours de la bibliothèque. */
export interface Cours {
  id: string
  titre: string
  module: string
  classeId: string
  nbEtapes: number
  duree: number // minutes
}

/** La séance en cours de projection dans Electron. */
export interface Seance {
  coursId: string
  classeId: string
  etape: number // index 1..nbEtapes
  demarreeA: string | null // ISO
  enPause: boolean
  corrigeVisible: boolean
}

/** Une ligne de progression annuelle. */
export interface ProgressionItem {
  id: string
  classeId: string
  intitule: string
  statut: 'a_venir' | 'en_cours' | 'fait'
  date: string // ISO (jour)
}

/** Un document disponible dans Electron. */
export interface DocumentItem {
  id: string
  titre: string
  type: 'cours' | 'evaluation' | 'fiche' | 'ressource'
  classeId: string | null
  maj: string // ISO
}

/**
 * Projection en lecture seule de l’état d'Electron.
 * Le telephone n’écrit jamais dedans : il envoie des commandes,
 * Electron republie un nouvel instantané.
 */
export interface Snapshot {
  majA: string // ISO
  appareil: string // nom lisible du poste Electron
  seance: Seance | null
  classes: Classe[]
  cours: Cours[]
  progression: ProgressionItem[]
  documents: DocumentItem[]
}

/** Types de commandes envoyées vers Electron. */
export type CommandType =
  | 'classe.selectionner'
  | 'cours.selectionner'
  | 'seance.demarrer'
  | 'seance.etape.suivante'
  | 'seance.etape.precedente'
  | 'seance.pause.basculer'
  | 'seance.corrige.basculer'
  | 'seance.valider'
  | 'seance.enregistrer'
  | 'progression.marquer'
  | 'document.ouvrir'

export type CommandPayload = Record<string, string | number | boolean | null>

export type CommandStatus = 'en_attente' | 'envoyee' | 'appliquee' | 'echouee'

/** Une commande est idempotente : Electron peut la rejouer sans risque. */
export interface Command {
  id: string
  type: CommandType
  libelle: string
  payload: CommandPayload
  creeeA: string // ISO
  statut: CommandStatus
  erreur?: string
}

/** Événements poussés par un transport vers l'application. */
export type TransportEvent =
  | { type: 'status'; status: ConnectionStatus }
  | { type: 'snapshot'; snapshot: Snapshot }
  | { type: 'command'; id: string; statut: CommandStatus; erreur?: string }

/**
 * Interface que toute implémentation doit respecter :
 * MockTransport aujourd'hui, FirebaseTransport demain.
 * Les pages ne connaissent que cette interface.
 */
export interface Transport {
  readonly id: string
  readonly libelle: string
  connect(): void
  disconnect(): void
  /** Renvoie une fonction de désabonnement. */
  subscribe(listener: (event: TransportEvent) => void): () => void
  send(command: Command): Promise<void>
}
