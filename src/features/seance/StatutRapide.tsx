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
  seance,
  compact = false,
}: {
  seance: Seance
  compact?: boolean
}) {
  const { envoyer, status, snapshot } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const statuts = snapshot?.statuts?.length ? snapshot.statuts : STATUTS_TELEPHONE

  return (
    <div>
      <div className={compact ? styles.choixCompact : styles.choix}>
        {statuts.map((st) => {
          const actif = seance.statut === st
          return (
            <Button
              key={st}
              taille={compact ? 'sm' : 'md'}
              variante={variante(actif, st)}
              icone={ICONES[st]}
              disabled={!dispo || actif}
              onClick={() => envoyer('seance.statut', { seanceId: seance.id, statut: st })}
            >
              {st}
            </Button>
          )
        })}
      </div>
      {!compact && seance.statut && AIDE_STATUT[seance.statut] && (
        <p className={styles.aide}>{AIDE_STATUT[seance.statut]}</p>
      )}
    </div>
  )
}
