import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import ListRow from '../../components/ui/ListRow'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { dateCourte } from '../../lib/format'

const TONS = { fait: 'ok', en_cours: 'accent', a_venir: 'neutre' } as const
const MOTS = { fait: 'Fait', en_cours: 'En cours', a_venir: 'À venir' } as const
const SUIVANT = { a_venir: 'en_cours', en_cours: 'fait', fait: 'a_venir' } as const

export default function ProgressionPage() {
  const { snapshot, envoyer, status } = useBridge()
  const horsLigne = status !== 'online'
  const lignes = snapshot?.progression ?? []

  return (
    <>
      <PageHeader titre="Progression" detail="Appuyer sur une ligne pour changer son statut" />
      <Card padding={false}>
        {lignes.length === 0 ? (
          <EmptyState titre="Progression vide" />
        ) : (
          lignes.map((p) => {
            const classe = snapshot?.classes.find((c) => c.id === p.classeId)
            return (
              <ListRow
                key={p.id}
                titre={p.intitule}
                sousTitre={`${classe?.nom ?? '—'} · ${dateCourte(p.date)}`}
                droite={<Badge ton={TONS[p.statut]}>{MOTS[p.statut]}</Badge>}
                onClick={
                  horsLigne
                    ? undefined
                    : () => envoyer('progression.marquer', { itemId: p.id, statut: SUIVANT[p.statut] })
                }
              />
            )
          })
        )}
      </Card>
    </>
  )
}
