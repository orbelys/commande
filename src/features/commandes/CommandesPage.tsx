import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge, { type Ton } from '../../components/ui/Badge'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { heure } from '../../lib/format'
import type { CommandStatus } from '../../services/bridge/types'

const TONS: Record<CommandStatus, Ton> = {
  en_attente: 'attention',
  envoyee: 'accent',
  appliquee: 'ok',
  echouee: 'danger',
}

const MOTS: Record<CommandStatus, string> = {
  en_attente: 'En attente',
  envoyee: 'Envoyée',
  appliquee: 'Appliquée',
  echouee: 'Échec',
}

/** Journal des commandes envoyées vers Electron. */
export default function CommandesPage() {
  const { commandes, viderHistorique } = useBridge()

  return (
    <>
      <PageHeader titre="Commandes" detail="Ce que le téléphone a demandé à Electron" />
      <Card
        padding={false}
        action={
          commandes.length > 0 ? (
            <Button variante="discret" onClick={viderHistorique}>
              Vider
            </Button>
          ) : undefined
        }
        titre={`${commandes.length} commande${commandes.length > 1 ? 's' : ''}`}
      >
        {commandes.length === 0 ? (
          <EmptyState
            titre="Aucune commande envoyée"
            detail="Pilotez un cours ou choisissez une classe pour en générer."
          />
        ) : (
          commandes.map((c) => (
            <ListRow
              key={c.id}
              titre={c.libelle}
              sousTitre={`${heure(c.creeeA)} · ${c.type}${c.erreur ? ` · ${c.erreur}` : ''}`}
              droite={<Badge ton={TONS[c.statut]}>{MOTS[c.statut]}</Badge>}
            />
          ))
        )}
      </Card>
    </>
  )
}
