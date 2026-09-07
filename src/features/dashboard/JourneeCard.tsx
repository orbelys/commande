import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { classeDepuisTitre, couleurDe } from '../../lib/couleurs'
import styles from './JourneeCard.module.css'
import type { Ton } from '../../components/ui/Badge'
import { lireHoraires, etatHoraire } from '../../lib/horaires'
import { jourLocal } from '../../lib/jours'
import { dateCourte } from '../../lib/format'

const TON_STATUT: Record<string, Ton> = {
  'Réalisé': 'ok',
  'En cours': 'live',
  'À terminer': 'attention',
  'Reporté': 'attention',
  'Non réalisé': 'danger',
  'Annulé': 'neutre',
  'Prévu': 'neutre',
}

/** La journée en frise : ce qui est passé, ce qui se joue, ce qui vient. */
export default function JourneeCard() {
  const maintenant = useHorloge(60_000)
  const { snapshot } = useBridge()
  const journee = snapshot?.journee ?? []
  const date = snapshot?.date || jourLocal(maintenant)

  return (
    <Card titre={date === jourLocal(maintenant) ? 'Aujourd’hui' : `Journée du ${dateCourte(date)}`} padding={false}>
      {journee.length === 0 ? (
        <EmptyState titre="Journée vide" detail="Aucun cours ni événement reçu pour cette date." />
      ) : (
        <ol className={styles.frise}>
          {journee.map((e) => {
            const { debut, fin } = lireHoraires(e.debut, e.fin)
            const { passe, actif } = etatHoraire(date, debut, fin, maintenant)
            const cle = e.classeNom || classeDepuisTitre(e.titre)
            const couleur = couleurDe(cle)
            return (
              <li
                key={e.id}
                className={[styles.item, passe ? styles.passe : '', actif ? styles.actif : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles.heure}>{debut || '—'}</span>
                <span className={styles.trait} aria-hidden="true">
                  <span
                    className={styles.point}
                    style={actif || !passe ? { background: couleur.vif } : undefined}
                  />
                </span>
                <span className={styles.corps} style={{ borderLeftColor: couleur.vif }}>
                  <span className={styles.titre}>{e.titre}</span>
                  <span className={styles.detail}>
                    {[e.lieu, fin ? `jusqu’à ${fin}` : debut ? 'Fin non précisée' : ''].filter(Boolean).join(' · ')}
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
