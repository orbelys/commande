import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import ListRow from '../../components/ui/ListRow'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import styles from './ClassesPage.module.css'

export default function ClassesPage() {
  const { snapshot } = useBridge()
  const classes = snapshot?.classes ?? []
  const seances = snapshot?.seances ?? []

  return (
    <>
      <PageHeader titre="Classes" detail="Vos classes et leurs séances publiées" />

      <Card padding={false}>
        {classes.length === 0 ? (
          <EmptyState titre="Aucune classe" detail="Les classes viennent de la Suite PSE." />
        ) : (
          classes.map((c) => {
            const aVenir = seances.filter((s) => s.classeId === c.id && s.statut === 'Prévu').length
            const aReprendre = seances.filter(
              (s) => s.classeId === c.id && (s.statut === 'À terminer' || s.statut === 'Reporté'),
            ).length
            return (
              <ListRow
                key={c.id}
                titre={c.nom}
                sousTitre={`${c.diplome} · ${c.effectif} élèves · ${aVenir} séance(s) à venir`}
                droite={aReprendre > 0 ? <Badge ton="attention">{aReprendre} à reprendre</Badge> : undefined}
              />
            )
          })
        )}
      </Card>

      <p className={styles.note}>
        Les effectifs et les intitulés viennent de la Suite PSE. Aucun nom d’élève ne circule
        jusqu’au téléphone. Pour agir sur une séance, passez par la{' '}
        <Link to="/progression">progression</Link>.
      </p>
    </>
  )
}
