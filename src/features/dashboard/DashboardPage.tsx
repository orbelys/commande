import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import TileButton from '../../components/ui/TileButton'
import Badge from '../../components/ui/Badge'
import SeanceEnCours from './SeanceEnCours'
import { useBridge } from '../../hooks/useBridge'
import { depuis } from '../../lib/format'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { snapshot, commandes, status } = useBridge()
  const enAttente = commandes.filter((c) => c.statut === 'en_attente' || c.statut === 'envoyee').length
  const aVenir = snapshot?.progression.filter((p) => p.statut !== 'fait').length ?? 0

  return (
    <>
      <PageHeader
        titre="Tableau de bord"
        detail={
          status === 'online'
            ? `Instantané reçu ${depuis(snapshot?.majA ?? null)}`
            : 'En attente de l’application Electron'
        }
      />

      <SeanceEnCours />

      <Card titre="Accès rapide" padding={false}>
        <div className={styles.grille}>
          <TileButton to="/cours" icone="▶" titre="Cours en cours" detail="Piloter la séance" />
          <TileButton
            to="/classes"
            icone="☷"
            titre="Classes"
            detail={`${snapshot?.classes.length ?? 0} classes`}
          />
          <TileButton
            to="/commandes"
            icone="⇄"
            titre="Commandes"
            detail={enAttente > 0 ? `${enAttente} en cours` : 'Historique'}
          />
          <TileButton
            to="/progression"
            icone="◷"
            titre="Progression"
            detail={`${aVenir} séances à venir`}
          />
          <TileButton
            to="/documents"
            icone="▤"
            titre="Documents"
            detail={`${snapshot?.documents.length ?? 0} fichiers`}
          />
          <TileButton to="/synchronisation" icone="⟳" titre="Synchronisation" detail="Etat du lien" />
        </div>
      </Card>

      <Card titre="Poste relié">
        <div className={styles.poste}>
          <div>
            <p className={styles.posteNom}>{snapshot?.appareil ?? 'Aucun poste'}</p>
            <p className={styles.posteDetail}>
              {snapshot ? `Mise à jour ${depuis(snapshot.majA)}` : 'Aucun instantané reçu'}
            </p>
          </div>
          <Badge ton={status === 'online' ? 'ok' : status === 'connecting' ? 'attention' : 'neutre'}>
            {status === 'online' ? 'Connecté' : status === 'connecting' ? 'Connexion' : 'Hors ligne'}
          </Badge>
        </div>
      </Card>
    </>
  )
}
