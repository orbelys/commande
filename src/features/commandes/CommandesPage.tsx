import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge, { type Ton } from '../../components/ui/Badge'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { usePoste } from '../../hooks/usePoste'
import { heure } from '../../lib/format'
import type { CommandStatus } from '../../services/bridge/types'
import styles from './CommandesPage.module.css'

const TONS: Record<CommandStatus, Ton> = {
  en_attente: 'attention',
  envoyee: 'accent',
  appliquee: 'ok',
  echouee: 'danger',
}

const MOTS: Record<CommandStatus, string> = {
  en_attente: 'En file',
  envoyee: 'Envoyée',
  appliquee: 'Appliquée',
  echouee: 'Échec',
}

/** Journal des commandes envoyées vers Electron. */
export default function CommandesPage() {
  const { commandes, viderHistorique } = useBridge()
  const poste = usePoste()
  const enFile = commandes.filter(
    (c) => c.statut === 'en_attente' || c.statut === 'envoyee',
  ).length

  return (
    <>
      <PageHeader titre="Commandes" detail="Ce que le téléphone a demandé à l’ordinateur" />

      {enFile > 0 && (
        <Card accent="attention">
          <p className={styles.file}>
            <strong>
              {enFile} commande{enFile > 1 ? 's' : ''} en attente.
            </strong>{' '}
            {poste.etat === 'hors_ligne'
              ? 'Votre téléphone n’a pas de réseau : elles partiront dès qu’il en retrouvera, même si vous fermez l’application.'
              : 'Votre ordinateur ne répond pas pour le moment. Elles s’appliqueront à son réveil, dans l’ordre.'}
          </p>
        </Card>
      )}
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
