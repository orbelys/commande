import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useProjection } from '../../hooks/useProjection'

/**
 * Documents du cours projeté : les afficher ou les masquer à distance,
 * pour ne montrer aux élèves que ce qui doit l'être.
 */
export default function DocumentsPage() {
  const { envoyer } = useBridge()
  const { projection, disponible } = useProjection()

  if (!projection) {
    return (
      <>
        <PageHeader titre="Documents" detail="Afficher ou masquer les documents projetés" />
        <Card>
          <EmptyState
            titre="Aucun cours projeté"
            detail="Les documents apparaissent dès qu’un cours est projeté depuis la Suite PSE."
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader titre="Documents" detail={projection.coursTitre} />
      <Card padding={false}>
        {projection.documents.length === 0 ? (
          <EmptyState titre="Aucun document" detail="Ce cours ne contient pas de document." />
        ) : (
          projection.documents.map((d) => (
            <ListRow
              key={d.idx}
              titre={d.label}
              sousTitre={d.visible ? 'Visible par les élèves' : 'Masqué'}
              droite={<Badge ton={d.visible ? 'ok' : 'neutre'}>{d.visible ? 'Affiché' : 'Masqué'}</Badge>}
              onClick={
                disponible
                  ? () =>
                      envoyer('projection.document.afficher', { idx: d.idx, visible: !d.visible })
                  : undefined
              }
            />
          ))
        )}
      </Card>
    </>
  )
}
