import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import ListRow from '../../components/ui/ListRow'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { dateCourte } from '../../lib/format'

const TYPES = {
  cours: 'Cours',
  evaluation: 'Évaluation',
  fiche: 'Fiche',
  ressource: 'Ressource',
} as const

export default function DocumentsPage() {
  const { snapshot, envoyer, status } = useBridge()
  const horsLigne = status !== 'online'
  const docs = snapshot?.documents ?? []

  return (
    <>
      <PageHeader titre="Documents" detail="Demander à Electron d’ouvrir un document" />
      <Card padding={false}>
        {docs.length === 0 ? (
          <EmptyState titre="Aucun document" />
        ) : (
          docs.map((d) => {
            const classe = snapshot?.classes.find((c) => c.id === d.classeId)
            return (
              <ListRow
                key={d.id}
                titre={d.titre}
                sousTitre={`${classe?.nom ?? 'Toutes classes'} · maj ${dateCourte(d.maj)}`}
                droite={<Badge>{TYPES[d.type]}</Badge>}
                onClick={horsLigne ? undefined : () => envoyer('document.ouvrir', { documentId: d.id })}
              />
            )
          })
        )}
      </Card>
    </>
  )
}
