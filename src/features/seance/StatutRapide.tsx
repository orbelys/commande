import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import {
  STATUTS_TELEPHONE,
  AIDE_STATUT,
  type Seance,
  type StatutSeance,
} from '../../services/bridge/types'
import styles from './StatutRapide.module.css'

const ICONES: Partial<Record<StatutSeance, string>> = {
  'Prévu': '◦',
  'En cours': '▶',
  'À terminer': '⏳',
  'Réalisé': '✓',
  'Reporté': '↦',
  'Annulé': '✕',
  'Non réalisé': '⊘',
}

// Couleur du bouton actif selon le sens du statut.
function variante(actif: boolean, st: StatutSeance): 'succes' | 'principal' | 'doux' {
  if (!actif) return 'doux'
  return st === 'Réalisé' ? 'succes' : 'principal'
}

/**
 * Les 7 statuts de la progression, posables directement depuis le téléphone.
 * La liste vient de l'instantané (`snapshot.statuts`) quand il la fournit —
 * ainsi le téléphone suit exactement ce que gère l'ordinateur.
 */
export default function StatutRapide({
  membres,
  compact = false,
}: {
  /** Une classe = 1 membre ; cours co-enseigné = plusieurs membres. */
  membres: Seance[]
  compact?: boolean
}) {
  const { envoyer, status, snapshot } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const statuts = snapshot?.statuts?.length ? snapshot.statuts : STATUTS_TELEPHONE

  // Statut commun s'il est identique sur toutes les classes du bloc, sinon vide.
  const premier = membres[0]?.statut
  const commun = membres.every((m) => m.statut === premier) ? premier : ''

  function poser(st: StatutSeance) {
    // Un seul geste → on l'applique à toutes les classes co-enseignées.
    membres.forEach((m) => envoyer('seance.statut', { seanceId: m.id, statut: st }))
  }

  return (
    <div>
      <div className={compact ? styles.choixCompact : styles.choix}>
        {statuts.map((st) => {
          const actif = commun === st
          return (
            <Button
              key={st}
              taille={compact ? 'sm' : 'md'}
              variante={variante(actif, st)}
              icone={ICONES[st]}
              disabled={!dispo || actif}
              onClick={() => poser(st)}
            >
              {st}
            </Button>
          )
        })}
      </div>
      {!compact && commun && AIDE_STATUT[commun] && <p className={styles.aide}>{AIDE_STATUT[commun]}</p>}
      {!compact && !commun && membres.length > 1 && (
        <p className={styles.aide}>Statuts différents selon la classe — poser un statut les alignera toutes.</p>
      )}
    </div>
  )
}
