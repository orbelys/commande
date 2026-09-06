import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import ListRow from '../../components/ui/ListRow'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useSeance } from '../../hooks/useSeance'

export default function ClassesPage() {
  const { snapshot, envoyer, status } = useBridge()
  const { seance } = useSeance()
  const horsLigne = status !== 'online'
  const classes = snapshot?.classes ?? []

  return (
    <>
      <PageHeader titre="Classes" detail="Sélectionner la classe active dans Electron" />
      <Card padding={false}>
        {classes.length === 0 ? (
          <EmptyState titre="Aucune classe" detail="Les classes viendront d’Electron." />
        ) : (
          classes.map((c) => (
            <ListRow
              key={c.id}
              titre={c.nom}
              sousTitre={`${c.niveau} · ${c.effectif} élèves`}
              actif={c.id === seance?.classeId}
              droite={c.id === seance?.classeId ? <Badge ton="accent">Active</Badge> : undefined}
              onClick={horsLigne ? undefined : () => envoyer('classe.selectionner', { classeId: c.id })}
            />
          ))
        )}
      </Card>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--c-text-muted)' }}>
        Données de démonstration : aucun élève réel n’est utilisé.
      </p>
    </>
  )
}
