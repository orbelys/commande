import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { situerToutes } from '../../lib/seances'
import { dateCourte } from '../../lib/format'
import styles from './ACloturerCard.module.css'

/**
 * Séances dont l'heure est passée sans qu'aucune décision n'ait été prise.
 * C'est le rattrapage automatique : plus besoin d'y penser, la liste se
 * remplit toute seule à mesure que les heures défilent.
 */
export default function ACloturerCard() {
  const maintenant = useHorloge(30_000)
  const { snapshot, envoyer, status } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)

  const enAttente = situerToutes(snapshot?.seances ?? [], maintenant).filter((s) => s.aCloturer)
  if (enAttente.length === 0) return null

  return (
    <Card
      titre="À clôturer"
      accent="attention"
      padding={false}
      action={<Badge ton="attention">{enAttente.length}</Badge>}
    >
      {enAttente.slice(0, 4).map((s) => (
        <div key={s.id} className={styles.ligne}>
          <div className={styles.texte}>
            <p className={styles.titre}>
              {s.moment === 'autre_jour' ? `${dateCourte(s.date)} · ` : ''}
              {s.debut} — {s.classeNom}
            </p>
            <p className={styles.detail}>
              {[s.moduleLabel || s.module, s.seance].filter(Boolean).join(' · ') || 'Séance'}
            </p>
          </div>
          <Button
            taille="sm"
            variante="succes"
            icone="✓"
            disabled={!dispo}
            onClick={() => envoyer('seance.statut', { seanceId: s.id, statut: 'Réalisé' })}
          >
            Réalisé
          </Button>
        </div>
      ))}
      {enAttente.length > 4 && (
        <p className={styles.reste}>et {enAttente.length - 4} autre(s) dans Progression</p>
      )}
    </Card>
  )
}
