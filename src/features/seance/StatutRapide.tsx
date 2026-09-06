import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import { STATUTS_TELEPHONE, type Seance, type StatutSeance } from '../../services/bridge/types'
import styles from './StatutRapide.module.css'

const ICONES: Partial<Record<StatutSeance, string>> = {
  'Réalisé': '✓',
  'En cours': '▶',
  'Prévu': '◦',
  'Annulé': '✕',
}

/**
 * Les quatre statuts que le téléphone peut poser directement.
 * « À terminer » et « Reporté » ouvrent la fenêtre de reprise sur
 * l'ordinateur : ils restent volontairement absents d'ici.
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

  return (
    <div className={compact ? styles.choixCompact : styles.choix}>
      {STATUTS_TELEPHONE.map((st) => {
        const actif = seance.statut === st
        return (
          <Button
            key={st}
            taille={compact ? 'sm' : 'md'}
            variante={actif ? (st === 'Réalisé' ? 'succes' : 'principal') : 'doux'}
            icone={ICONES[st]}
            disabled={!dispo || actif}
            onClick={() => envoyer('seance.statut', { seanceId: seance.id, statut: st })}
          >
            {st}
          </Button>
        )
      })}
    </div>
  )
}
