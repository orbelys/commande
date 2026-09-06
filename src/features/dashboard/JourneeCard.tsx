import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import type { Ton } from '../../components/ui/Badge'

const TON_STATUT: Record<string, Ton> = {
  'Fait': 'ok',
  'En cours': 'accent',
  'À terminer': 'attention',
  'Reporté': 'attention',
  'Non réalisé': 'danger',
  'Annulé': 'neutre',
  'Prévu': 'neutre',
}

/** La journée telle qu'Electron la voit : cours d'emploi du temps et événements. */
export default function JourneeCard() {
  const { snapshot } = useBridge()
  const journee = snapshot?.journee ?? []

  return (
    <Card titre="Aujourd’hui" padding={false}>
      {journee.length === 0 ? (
        <EmptyState titre="Journée vide" detail="Aucun cours ni événement reçu pour aujourd’hui." />
      ) : (
        journee.map((e) => (
          <ListRow
            key={e.id}
            titre={`${e.debut} · ${e.titre}`}
            sousTitre={[e.lieu, e.fin ? `jusqu’à ${e.fin}` : ''].filter(Boolean).join(' · ')}
            droite={e.statut ? <Badge ton={TON_STATUT[e.statut] ?? 'neutre'}>{e.statut}</Badge> : undefined}
          />
        ))
      )}
    </Card>
  )
}
