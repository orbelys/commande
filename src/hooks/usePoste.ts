import { useBridge } from './useBridge'
import { useHorloge } from './useHorloge'

/** Au-delà de ce délai sans instantané, l'ordinateur ne publie plus.
 *  Le pont republie toutes les 25 secondes : 90 laisse trois battements. */
const VEILLE_MS = 90_000

export type EtatPoste = 'hors_ligne' | 'connexion' | 'en_veille' | 'actif'

export interface Poste {
  etat: EtatPoste
  /** Millisecondes depuis le dernier instantané, ou null. */
  depuis: number | null
  libelle: string
  libelleCourt: string
}

/**
 * Fraîcheur des données de l'ordinateur, distincte de l'état du réseau.
 *
 * « Connecté » disait seulement que le téléphone parlait à Firebase. Or
 * l'ordinateur peut être fermé dans un sac : on bloque les nouvelles commandes.
 */
export function usePoste(): Poste {
  const { status, snapshot } = useBridge()
  useHorloge(30_000)

  if (status === 'connecting') {
    return { etat: 'connexion', depuis: null, libelle: 'Connexion…', libelleCourt: '…' }
  }
  if (status === 'offline') {
    return {
      etat: 'hors_ligne',
      depuis: null,
      libelle: 'Hors ligne',
      libelleCourt: 'Hors ligne',
    }
  }

  const maj = snapshot ? new Date(snapshot.majA).getTime() : null
  // Une réception déclenche un rendu entre deux ticks : comparer à l'heure
  // réelle, jamais au tick mémorisé qui pourrait précéder l'instantané reçu.
  const ecart = maj ? Date.now() - maj : null

  if (ecart === null || !Number.isFinite(ecart) || ecart > VEILLE_MS || ecart < -5_000) {
    return {
      etat: 'en_veille',
      depuis: ecart,
      libelle: 'Liaison à vérifier',
      libelleCourt: 'À vérifier',
    }
  }
  return {
    etat: 'actif',
    depuis: ecart,
    libelle: 'Liaison active',
    libelleCourt: 'Active',
  }
}
