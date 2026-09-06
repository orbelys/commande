import Card from '../../components/ui/Card'
import TileButton from '../../components/ui/TileButton'
import Hero from './Hero'
import MaintenantCard from './MaintenantCard'
import ACloturerCard from './ACloturerCard'
import JourneeCard from './JourneeCard'
import ActionsCard from './ActionsCard'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { situerToutes } from '../../lib/seances'
import { depuis } from '../../lib/format'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const maintenant = useHorloge(60_000)
  const { snapshot, commandes } = useBridge()

  const seances = situerToutes(snapshot?.seances ?? [], maintenant)
  const enAttente = commandes.filter(
    (c) => c.statut === 'en_attente' || c.statut === 'envoyee',
  ).length
  const aCloturer = seances.filter((s) => s.aCloturer).length
  const docsCaches = snapshot?.projection?.documents.filter((d) => !d.visible).length ?? 0

  return (
    <>
      <Hero />
      <MaintenantCard />
      <ACloturerCard />
      <JourneeCard />
      <ActionsCard />

      <Card titre="Tout le reste" padding={false}>
        <div className={styles.grille}>
          <TileButton to="/projection" icone="▶" titre="Projection" detail="Télécommande" />
          <TileButton
            to="/progression"
            icone="◷"
            titre="Progression"
            detail={aCloturer > 0 ? `${aCloturer} à clôturer` : `${seances.length} séances`}
          />
          <TileButton
            to="/classes"
            icone="☷"
            titre="Classes"
            detail={`${snapshot?.classes.length ?? 0} classes`}
          />
          <TileButton
            to="/documents"
            icone="▤"
            titre="Documents"
            detail={
              snapshot?.projection
                ? `${snapshot.projection.documents.length} au cours${docsCaches ? `, ${docsCaches} masqué(s)` : ''}`
                : 'Aucune projection'
            }
          />
          <TileButton
            to="/commandes"
            icone="⇄"
            titre="Commandes"
            detail={enAttente > 0 ? `${enAttente} en cours` : 'Historique'}
          />
          <TileButton
            to="/synchronisation"
            icone="⟳"
            titre="Synchronisation"
            detail={snapshot ? depuis(snapshot.majA) : 'État du lien'}
          />
        </div>
      </Card>
    </>
  )
}
