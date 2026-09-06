import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { dateCourte } from '../../lib/format'

/** Actions ouvertes : une pression sur la ligne la marque faite. */
export default function ActionsCard() {
  const { snapshot, envoyer, status } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.actions ?? false)
  const ouvertes = (snapshot?.actions ?? []).filter((a) => a.statut === 'a_faire')

  return (
    <Card titre={`À faire (${ouvertes.length})`} padding={false}>
      {ouvertes.length === 0 ? (
        <EmptyState titre="Rien en attente" />
      ) : (
        ouvertes.map((a) => (
          <ListRow
            key={a.id}
            titre={a.texte}
            sousTitre={a.echeance ? `Pour le ${dateCourte(a.echeance)}` : 'Sans échéance'}
            droite={a.retard ? <Badge ton="danger">En retard</Badge> : undefined}
            onClick={dispo ? () => envoyer('action.terminer', { actionId: a.id }) : undefined}
          />
        ))
      )}
    </Card>
  )
}
