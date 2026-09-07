import { useBridge } from './useBridge'
import type { Projection } from '../services/bridge/types'
import { usePoste } from './usePoste'
import { VERSION_CONTRAT } from '../services/bridge/types'

export interface EtatProjection {
  projection: Projection | null
  /** Une projection est ouverte et pilotable. */
  disponible: boolean
  raisonIndisponible: string | null
  messageCommande: string | null
  /** Libellé de l'étape courante ('Sommaire' avant la première question). */
  etapeLabel: string
  progressionPct: number
}

/** Lit l'état de la projection en classe dans l'instantané. */
export function useProjection(): EtatProjection {
  const { snapshot, status, commandes, transportId } = useBridge()
  const poste = usePoste()
  const projection = snapshot?.projection ?? null
  const capacite = snapshot?.capacites.projection ?? false

  if (!projection) {
    return { projection: null, disponible: false, raisonIndisponible: null, messageCommande: null, etapeLabel: '—', progressionPct: 0 }
  }

  const etape = projection.etape
  const label =
    etape < 0
      ? 'Sommaire'
      : (projection.sommaire[etape]?.label ?? `Étape ${etape + 1}`)

  const commandesSession = commandes.filter(c => c.type.startsWith('projection.') &&
    c.deviceId === snapshot?.deviceId && c.projectionSessionId === projection.sessionId)
  const attente = commandesSession.find(c => ['en_attente','envoyee','en_cours'].includes(c.statut) && Date.parse(c.expiresAt ?? '') > Date.now())
  const derniere = commandesSession[0]
  const messageCommande = derniere && ['echouee', 'sans_confirmation'].includes(derniere.statut)
    ? `${derniere.libelle} : ${derniere.erreur || 'Résultat non confirmé. Vérifie l’écran de l’ordinateur.'}` : null
  const raisonIndisponible = status === 'offline' ? 'Téléphone hors ligne. Reconnexion en attente.'
    : status !== 'online' ? 'Connexion à la télécommande en cours…'
    : transportId !== 'mock' && snapshot?.version !== VERSION_CONTRAT ? 'Versions incompatibles. Actualise le téléphone et rouvre Electron.'
    : poste.etat !== 'actif' ? (poste.depuis !== null && poste.depuis < -5_000
      ? 'Heure des appareils incohérente. Vérifie leur réglage automatique.'
      : 'Dernier état trop ancien. Vérifie la liaison avec Electron.')
    : !capacite ? 'Projection indisponible sur l’ordinateur.'
    : attente ? `Confirmation en attente : ${attente.libelle}.`
    : null

  return {
    projection,
    disponible: raisonIndisponible === null,
    raisonIndisponible,
    messageCommande,
    etapeLabel: label,
    progressionPct:
      projection.nbEtapes > 0
        ? Math.round(((etape + 1) / projection.nbEtapes) * 100)
        : 0,
  }
}
