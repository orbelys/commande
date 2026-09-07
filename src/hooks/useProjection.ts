import { useBridge } from './useBridge'
import type { Projection } from '../services/bridge/types'
import { usePoste } from './usePoste'
import { VERSION_CONTRAT } from '../services/bridge/types'

export interface EtatProjection {
  projection: Projection | null
  /** Une projection est ouverte et pilotable. */
  disponible: boolean
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
    return { projection: null, disponible: false, etapeLabel: '—', progressionPct: 0 }
  }

  const etape = projection.etape
  const label =
    etape < 0
      ? 'Sommaire'
      : (projection.sommaire[etape]?.label ?? `Étape ${etape + 1}`)

  return {
    projection,
    disponible: capacite && status === 'online' && poste.etat === 'actif' &&
      (transportId === 'mock' || snapshot?.version === VERSION_CONTRAT) &&
      !commandes.some(c => c.type.startsWith('projection.') && ['en_attente','envoyee','en_cours'].includes(c.statut) && Date.parse(c.expiresAt ?? '') > Date.now()),
    etapeLabel: label,
    progressionPct:
      projection.nbEtapes > 0
        ? Math.round(((etape + 1) / projection.nbEtapes) * 100)
        : 0,
  }
}
