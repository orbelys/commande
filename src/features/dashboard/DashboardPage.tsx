import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import TileButton from '../../components/ui/TileButton'
import Badge from '../../components/ui/Badge'
import ProjectionEnCours from './ProjectionEnCours'
import JourneeCard from './JourneeCard'
import ActionsCard from './ActionsCard'
import { useBridge } from '../../hooks/useBridge'
import { depuis } from '../../lib/format'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const { snapshot, commandes, status } = useBridge()

  const enAttente = commandes.filter(
    (c) => c.statut === 'en_attente' || c.statut === 'envoyee',
  ).length
  const aTraiter = snapshot?.seances.filter((s) => s.statut === 'À terminer' || s.statut === 'Reporté').length ?? 0
  const docsCaches = snapshot?.projection?.documents.filter((d) => !d.visible).length ?? 0

  return (
    <>
      <PageHeader
        titre="Tableau de bord"
        detail={
          status === 'online'
            ? `${snapshot?.poste ?? 'Poste'} · instantané reçu ${depuis(snapshot?.majA ?? null)}`
            : 'En attente de la Suite PSE'
        }
      />

      <ProjectionEnCours />
      <JourneeCard />
      <ActionsCard />

      <Card titre="Accès rapide" padding={false}>
        <div className={styles.grille}>
          <TileButton to="/projection" icone="▶" titre="Cours en cours" detail="Télécommande" />
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
            detail={aTraiter > 0 ? `${aTraiter} séance(s) à reprendre` : 'Séances'}
          />
          <TileButton
            to="/documents"
            icone="▤"
            titre="Documents"
            detail={
              snapshot?.projection
                ? `${snapshot.projection.documents.length} document(s)${docsCaches ? `, ${docsCaches} masqué(s)` : ''}`
                : 'Aucune projection'
            }
          />
          <TileButton to="/synchronisation" icone="⟳" titre="Synchronisation" detail="État du lien" />
        </div>
      </Card>

      <Card titre="Poste relié">
        <div className={styles.poste}>
          <div>
            <p className={styles.posteNom}>{snapshot?.poste ?? 'Aucun poste'}</p>
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
