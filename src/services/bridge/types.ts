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

export const VERSION_CONTRAT = 5

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
  /**
   * Codes élèves de la classe, tels qu'imprimés sur les documents distribués.
   * PSEUDONYMES : ce sont les userCode à quatre caractères du publipostage,
   * jamais des noms. Ils permettent de pointer une absence depuis le téléphone
   * sans qu'aucune identité ne quitte l'ordinateur.
   */
  codes: string[]
  /**
   * Codes qui n'ont pas reçu leur support et attendent un rattrapage.
   * Un code y entre quand on le marque absent, il en sort quand on le pointe
   * comme rattrapé.
   */
  aRattraper: string[]
}

/** Un document affiché dans le cours projeté (P.docToggle). */
export interface DocumentProjete {
  idx: number
  label: string
  visible: boolean
  autorise?: boolean
}

/** Une ressource préparée (vidéo YouTube, image, PDF…) projetable à distance. */
export interface RessourceProjetee {
  idx: number
  titre: string
  /** 'youtube' | 'video' | 'audio' | 'image' | 'pdf' … */
  type: string
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

/** État de la roue de tirage (projection). Publié par le pont Electron. */
export interface RoueEtat {
  /** Au moins un élève est dans la roue (classe choisie / prénoms saisis). */
  configuree: boolean
  classe: string
  dansLaRoue: number
  total: number
  dejaTires: number
  /** Dernier élève tiré (déjà affiché à l'écran ; rien à recalculer ici). */
  dernier: string
}

/** État de la projection en cours dans Electron. */
export interface Projection {
  sessionId?: string
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
  audio?: { disponible: boolean; statut: 'repos' | 'lecture' | 'pause'; cible: 'question' | 'corrige'; lisible: boolean; erreur: string } | null
  accessibilite?: { taille: number; contraste: boolean; interligne: boolean } | null
  /** Absent si le poste tourne encore sur une version antérieure du pont. */
  roue?: RoueEtat
  /** Ressources préparées (vidéos, PDF…) projetables à distance. Absent sur un pont antérieur. */
  ressources?: RessourceProjetee[]
  /** Index de la ressource actuellement projetée (-1 = aucune). Absent sur un pont antérieur. */
  ressourceActive?: number
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
 * Les 7 statuts, dans l'ordre d'affichage. Le téléphone peut désormais tous
 * les poser (le pont Electron écrit « À terminer / Reporté / Non réalisé » en
 * mode « statut seul », sans ouvrir la fenêtre de reprise). Si l'instantané
 * fournit `statuts`, on l'utilise à la place (source unique de vérité).
 */
export const STATUTS_TELEPHONE: StatutSeance[] = [
  'Prévu',
  'En cours',
  'À terminer',
  'Réalisé',
  'Reporté',
  'Annulé',
  'Non réalisé',
]

/** Statuts « de report » : la séance se poursuit plus tard ; un mémo de reprise est attendu. */
export const STATUTS_REPRISE: StatutSeance[] = ['En cours', 'À terminer', 'Reporté', 'Non réalisé']

/** Aide courte affichée sous le sélecteur, selon le statut choisi. */
export const AIDE_STATUT: Record<StatutSeance, string> = {
  'Prévu': 'Pas encore faite.',
  'En cours': 'Commencée, se poursuit plus tard (ex. révisions à continuer). Pense au mémo de reprise.',
  'À terminer': 'Presque finie, à reprendre. Le rattrapage se place ensuite sur l’ordinateur.',
  'Réalisé': 'Terminée. Clôture la séance.',
  'Reporté': 'Déplacée à une autre date (placement sur l’ordinateur).',
  'Annulé': 'N’a pas eu lieu, sans rattrapage.',
  'Non réalisé': 'Aurait dû avoir lieu, à rattraper.',
}

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
  /** Avancement du module « posées / volume », ex. « 1/3 » (« 1/1 » si module d'une séance). */
  sequenceLabel?: string
  /** Détail de l'avancement (facultatif). */
  sequence?: {
    current: number
    total: number
    placed: number
    done: number
    label: string
  } | null
  phase: string
  objectif: string
  statut: StatutSeance
  remise: Remise
  memo: string
  /** Codes élèves absents à cette séance (pseudonymes). */
  absents: string[]
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

/** Trois semaines d'agenda en lecture seule, compatibles avec les anciens postes. */
export interface AgendaPeriode {
  debut: string
  fin: string
  jours: { date: string; evenements: EvenementJournee[] }[]
  /** Certaines journées dépassaient le budget de publication. */
  incomplet?: boolean
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
  deviceId?: string
  majA: string // ISO
  poste: string
  date: string // jour ISO de référence
  capacites: Capacites
  projection: Projection | null
  journee: EvenementJournee[]
  agenda?: AgendaPeriode
  seances: Seance[]
  classes: Classe[]
  actions: ActionItem[]
  /** Les statuts gérés par la progression, source unique de vérité pour le
   * sélecteur. Absent si le poste tourne encore sur une version antérieure. */
  statuts?: StatutSeance[]
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
  | 'projection.audio.lire'
  | 'projection.audio.pause'
  | 'projection.audio.reprendre'
  | 'projection.audio.arreter'
  | 'projection.accessibilite.taille'
  | 'projection.accessibilite.prereglage'
  | 'projection.roue.tourner'
  | 'projection.roue.reinitialiser'
  | 'projection.roue.cacher'
  | 'projection.ressource.afficher'
  | 'projection.ressource.fermer'
  // — progression (créneau d'une classe)
  | 'seance.statut'
  | 'seance.remise'
  | 'seance.memo'
  | 'seance.absents'
  | 'eleve.besoins'
  | 'classe.rattrape'
  // — actions et notes
  | 'action.creer'
  | 'action.terminer'
  | 'note.rapide'

export type CommandPayload = Record<string, string | number | boolean | null>

export type CommandStatus = 'en_attente' | 'envoyee' | 'en_cours' | 'appliquee' | 'echouee' | 'sans_confirmation'

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
  protocol?: number
  deviceId?: string
  projectionSessionId?: string
  expiresAt?: string
  expected?: string | number | boolean
}

export type TransportEvent =
  | { type: 'status'; status: ConnectionStatus }
  | { type: 'snapshot'; snapshot: Snapshot }
  | { type: 'command'; id: string; statut: CommandStatus; erreur?: string }
  | { type: 'history'; commandes: Command[] }
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
