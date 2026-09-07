import { useBridge } from './useBridge'
import { useHorloge } from './useHorloge'

/** Au-delà de ce délai sans instantané, l'ordinateur ne publie plus.
 *  Le pont republie de lui-même toutes les 5 minutes : 12 laisse de la marge. */
const VEILLE_MS = 12 * 60_000

export type EtatPoste = 'hors_ligne' | 'connexion' | 'en_veille' | 'actif'

export interface Poste {
  etat: EtatPoste
  /** Millisecondes depuis le dernier instantané, ou null. */
  depuis: number | null
  libelle: string
  libelleCourt: string
}

/**
 * État réel de l'ordinateur, distinct de l'état du réseau.
 *
 * « Connecté » disait seulement que le téléphone parlait à Firebase. Or
 * l'ordinateur peut être fermé dans un sac : les commandes sont alors mises en
 * file et s'appliqueront à son réveil — mais il faut le dire.
 */
export function usePoste(): Poste {
  const { status, snapshot } = useBridge()
  const maintenant = useHorloge(30_000)

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
  const ecart = maj ? maintenant.getTime() - maj : null

  if (ecart === null || ecart > VEILLE_MS) {
    return {
      etat: 'en_veille',
      depuis: ecart,
      libelle: 'Ordinateur en veille',
      libelleCourt: 'En veille',
    }
  }
  return {
    etat: 'actif',
    depuis: ecart,
    libelle: 'Ordinateur actif',
    libelleCourt: 'Actif',
  }
}
