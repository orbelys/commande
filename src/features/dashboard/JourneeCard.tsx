import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import styles from './JourneeCard.module.css'
import type { Ton } from '../../components/ui/Badge'

const TON_STATUT: Record<string, Ton> = {
  'Réalisé': 'ok',
  'En cours': 'live',
  'À terminer': 'attention',
  'Reporté': 'attention',
  'Non réalisé': 'danger',
  'Annulé': 'neutre',
  'Prévu': 'neutre',
}

function enMinutes(h: string): number | null {
  const m = /^(\d{1,2})[:h.](\d{2})?/.exec(String(h || '').trim())
  return m ? Number(m[1]) * 60 + Number(m[2] ?? 0) : null
}

/** La journée en frise : ce qui est passé, ce qui se joue, ce qui vient. */
export default function JourneeCard() {
  const maintenant = useHorloge(60_000)
  const { snapshot } = useBridge()
  const journee = snapshot?.journee ?? []
  const nowMin = maintenant.getHours() * 60 + maintenant.getMinutes()

  return (
    <Card titre="Aujourd’hui" padding={false}>
      {journee.length === 0 ? (
        <EmptyState titre="Journée vide" detail="Aucun cours ni événement reçu pour aujourd’hui." />
      ) : (
        <ol className={styles.frise}>
          {journee.map((e) => {
            const debut = enMinutes(e.debut)
            const fin = enMinutes(e.fin)
            const passe = fin !== null && nowMin >= fin
            const actif = debut !== null && nowMin >= debut && (fin === null || nowMin < fin)
            return (
              <li
                key={e.id}
                className={[styles.item, passe ? styles.passe : '', actif ? styles.actif : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles.heure}>{e.debut || '—'}</span>
                <span className={styles.trait} aria-hidden="true">
                  <span className={styles.point} />
                </span>
                <span className={styles.corps}>
                  <span className={styles.titre}>{e.titre}</span>
                  <span className={styles.detail}>
                    {[e.lieu, e.fin && `jusqu’à ${e.fin}`].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {e.statut && (
                  <Badge ton={TON_STATUT[e.statut] ?? 'neutre'}>{e.statut}</Badge>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </Card>
  )
}
