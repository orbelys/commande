import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useBridge } from '../../hooks/useBridge'
import { depuis } from '../../lib/format'
import styles from './SyncPage.module.css'

export default function SyncPage() {
  const { status, snapshot, transportId, transportLibelle, connecter, deconnecter, commandes } =
    useBridge()

  const enAttente = commandes.filter((c) => c.statut !== 'appliquee' && c.statut !== 'echouee').length

  return (
    <>
      <PageHeader titre="Synchronisation" detail="État du lien avec l’application Electron" />

      <Card titre="Lien Electron">
        <dl className={styles.liste}>
          <div className={styles.ligne}>
            <dt>État</dt>
            <dd>
              <Badge ton={status === 'online' ? 'ok' : status === 'connecting' ? 'attention' : 'neutre'}>
                {status === 'online' ? 'Connecté' : status === 'connecting' ? 'Connexion...' : 'Hors ligne'}
              </Badge>
            </dd>
          </div>
          <div className={styles.ligne}>
            <dt>Transport</dt>
            <dd>{transportLibelle}</dd>
          </div>
          <div className={styles.ligne}>
            <dt>Poste</dt>
            <dd>{snapshot?.appareil ?? '—'}</dd>
          </div>
          <div className={styles.ligne}>
            <dt>Dernier instantané</dt>
            <dd>{depuis(snapshot?.majA ?? null)}</dd>
          </div>
          <div className={styles.ligne}>
            <dt>Commandes en cours</dt>
            <dd>{enAttente}</dd>
          </div>
        </dl>

        <div className={styles.actions}>
          <Button
            variante="principal"
            pleineLargeur
            disabled={status !== 'offline'}
            onClick={connecter}
          >
            Se connecter
          </Button>
          <Button pleineLargeur disabled={status === 'offline'} onClick={deconnecter}>
            Se déconnecter
          </Button>
        </div>
      </Card>

      <Card titre="À savoir">
        <p className={styles.note}>
          {transportId === 'mock'
            ? 'Le lien avec Electron est actuellement simulé : les boutons ci-dessus permettent de tester l’interface hors ligne et connectée. Aucune donnée ne quitte ce navigateur.'
            : 'Transport Firebase sélectionné mais pas encore implémenté.'}
        </p>
        <p className={styles.note}>
          Quand Firebase sera branché, seule la couche <code>services/bridge</code> changera : les
          pages resteront identiques.
        </p>
      </Card>
    </>
  )
}
