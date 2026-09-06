/**
 * CONTRAT partagé entre le téléphone et la Suite PSE (Electron).
 *
 * Ce fichier est la référence unique. Le module Electron
 * (electron/pse-mobile-bridge.js) produit exactement ces formes.
 *
 * Les noms suivent le vocabulaire réel de la Suite PSE :
 * séance de progression (classe + semaine + créneau), projection en classe,
 * journée d'agenda, actions de réunion.
 */

export const VERSION_CONTRAT = 3

/** État du lien avec Electron. */
export type ConnectionStatus = 'offline' | 'connecting' | 'online'

/**
 * Ce que le poste Electron sait faire réellement.
 * Publié dans chaque instantané : le téléphone désactive les boutons
 * dont la fonction n'est pas disponible, au lieu d'envoyer dans le vide.
 */
export interface Capacites {
  /** Une fenêtre de projection est ouverte et pilotable (window.P). */
  projection: boolean
  /** Les séances de progression sont lisibles / modifiables. */
  progression: boolean
  /** L'agenda du jour est lisible. */
  agenda: boolean
  /** Les actions de réunion sont lisibles / modifiables. */
  actions: boolean
}

export interface Classe {
  id: string
  nom: string
  diplome: string
  effectif: number
}

/** Un document affiché dans le cours projeté (P.docToggle). */
export interface DocumentProjete {
  idx: number
  label: string
  visible: boolean
}

/** Une étape du sommaire de projection (P.gotoStep). */
export interface EtapeProjetee {
  idx: number
  label: string
  corrigeDisponible: boolean
}

/** Minuteur projeté à l'écran des élèves. */
export interface Minuteur {
  actif: boolean
  enPause: boolean
  /** Secondes restantes. */
  restant: number
}

/** État de la projection en cours dans Electron. */
export interface Projection {
  /** La fenêtre élèves est ouverte. */
  fenetreOuverte: boolean
  coursTitre: string
  classeNom: string
  /** Étape courante ; -1 = sommaire affiché, aucune question en cours. */
  etape: number
  nbEtapes: number
  corrigeVisible: boolean
  corrigeDisponible: boolean
  focus: boolean
  sommaire: EtapeProjetee[]
  documents: DocumentProjete[]
  /** Absent si le poste tourne encore sur une version antérieure du pont. */
  minuteur?: Minuteur
}

/** Statuts d'une séance, tels qu'ils existent dans la progression. */
export type StatutSeance =
  | 'Prévu'
  | 'En cours'
  | 'Réalisé'
  | 'À terminer'
  | 'Reporté'
  | 'Non réalisé'
  | 'Annulé'

/**
 * Statuts que le téléphone peut poser directement.
 * Les trois autres (« À terminer », « Reporté », « Non réalisé ») ouvrent la
 * fenêtre de reprise sur l'ordinateur : les envoyer d'ici ferait surgir une
 * boîte de dialogue en pleine classe.
 */
export const STATUTS_TELEPHONE: StatutSeance[] = ['Prévu', 'En cours', 'Réalisé', 'Annulé']

/** État de remise du support de cours pour ce créneau. */
export type Remise = '' | 'a_faire' | 'fait' | 'sans_objet'

/**
 * Une séance de progression = un créneau d'emploi du temps d'une classe,
 * dans une semaine donnée. Son identité est le triplet classe/semaine/créneau.
 */
export interface Seance {
  /** `${classeId}|${wkey}|${slotId}` — stable, sert de clé de commande. */
  id: string
  classeId: string
  classeNom: string
  /** Lundi de la semaine, format ISO (clé de semaine côté Electron). */
  wkey: string
  /** `${jour}|${début}|${fin}` — identifiant du créneau dans la semaine. */
  slotId: string
  date: string // jour ISO
  debut: string
  fin: string
  salle: string
  module: string
  moduleLabel: string
  seance: string
  phase: string
  objectif: string
  statut: StatutSeance
  remise: Remise
  memo: string
}

/** Une ligne de l'agenda du jour (cours d'EDT ou événement). */
export interface EvenementJournee {
  id: string
  type: 'cours' | 'evenement'
  debut: string
  fin: string
  titre: string
  lieu: string
  classeNom: string
  statut: string
}

export interface ActionItem {
  id: string
  texte: string
  echeance: string | null
  statut: 'a_faire' | 'fait'
  retard: boolean
}

/**
 * Projection en lecture seule de l'état d'Electron.
 * Le téléphone n'écrit jamais dedans : il envoie des commandes,
 * Electron applique puis republie un instantané.
 *
 * Règle de confidentialité : cet instantané ne contient AUCUNE donnée
 * nominative d'élève, aucun MOPPS, aucune donnée de santé. Uniquement
 * des intitulés de cours, de classes et de créneaux.
 */
export interface Snapshot {
  version: number
  majA: string // ISO
  poste: string
  date: string // jour ISO de référence
  capacites: Capacites
  projection: Projection | null
  journee: EvenementJournee[]
  seances: Seance[]
  classes: Classe[]
  actions: ActionItem[]
}

/** Commandes que le téléphone peut envoyer. */
export type CommandType =
  // — projection en classe (window.P dans projection.html)
  | 'projection.ouvrir'
  | 'projection.etape.suivante'
  | 'projection.etape.precedente'
  | 'projection.etape.aller'
  | 'projection.corrige.basculer'
  | 'projection.focus.basculer'
  | 'projection.document.afficher'
  | 'projection.minuteur.demarrer'
  | 'projection.minuteur.pause'
  | 'projection.minuteur.reprendre'
  | 'projection.minuteur.arreter'
  // — progression (créneau d'une classe)
  | 'seance.statut'
  | 'seance.remise'
  | 'seance.memo'
  // — actions et notes
  | 'action.creer'
  | 'action.terminer'
  | 'note.rapide'

export type CommandPayload = Record<string, string | number | boolean | null>

export type CommandStatus = 'en_attente' | 'envoyee' | 'appliquee' | 'echouee'

/**
 * Une commande porte un identifiant unique : Electron mémorise les
 * identifiants déjà appliqués, donc la rejouer est sans effet.
 */
export interface Command {
  id: string
  type: CommandType
  libelle: string
  payload: CommandPayload
  creeeA: string // ISO
  statut: CommandStatus
  erreur?: string
}

export type TransportEvent =
  | { type: 'status'; status: ConnectionStatus }
  | { type: 'snapshot'; snapshot: Snapshot }
  | { type: 'command'; id: string; statut: CommandStatus; erreur?: string }
  | { type: 'erreur'; message: string }

/** Compte connecté (Firebase) ; null en mode simulation. */
export interface Session {
  email: string
  uid: string
}

/**
 * Interface que toute implémentation doit respecter :
 * MockTransport (simulation) et FirebaseTransport (réel).
 * Les pages ne connaissent que cette interface.
 */
export interface Transport {
  readonly id: string
  readonly libelle: string
  /** Le transport exige-t-il une connexion par identifiants ? */
  readonly authRequise: boolean
  connect(): void
  disconnect(): void
  subscribe(listener: (event: TransportEvent) => void): () => void
  send(command: Command): Promise<void>
  /** Connexion par e-mail / mot de passe (Firebase). */
  seConnecter?(email: string, motDePasse: string): Promise<void>
  seDeconnecter?(): Promise<void>
  session?(): Session | null
}
