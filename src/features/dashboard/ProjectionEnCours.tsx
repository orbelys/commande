import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useProjection } from '../../hooks/useProjection'
import styles from './ProjectionEnCours.module.css'

/** Résumé du cours projeté, avec les deux commandes les plus utilisées. */
export default function ProjectionEnCours() {
  const { envoyer } = useBridge()
  const { projection, disponible, etapeLabel, progressionPct } = useProjection()

  if (!projection) {
    return (
      <Card titre="Cours en cours">
        <EmptyState
          titre="Aucun cours projeté"
          detail="Lancez une projection depuis la Suite PSE pour piloter le cours d’ici."
        />
      </Card>
    )
  }

  const derniereEtape = projection.etape >= projection.nbEtapes - 1

  return (
    <Card
      titre="Cours en cours"
      action={
        <Badge ton={projection.corrigeVisible ? 'attention' : 'ok'}>
          {projection.corrigeVisible ? 'Corrigé affiché' : 'En cours'}
        </Badge>
      }
    >
      <p className={styles.titre}>{projection.coursTitre}</p>
      <p className={styles.meta}>
        {projection.classeNom || 'Classe non précisée'} · {etapeLabel}
      </p>

      <div className={styles.barre} role="img" aria-label={`${progressionPct} % du cours`}>
        <span className={styles.remplissage} style={{ width: `${progressionPct}%` }} />
      </div>
      <p className={styles.etape}>
        {projection.etape < 0
          ? `Sommaire · ${projection.nbEtapes} étapes`
          : `Étape ${projection.etape + 1} / ${projection.nbEtapes}`}
      </p>

      <div className={styles.actions}>
        <Button
          taille="lg"
          icone="←"
          disabled={!disponible || projection.etape < 0}
          onClick={() => envoyer('projection.etape.precedente')}
        >
          Précédent
        </Button>
        <Button
          taille="lg"
          variante="principal"
          icone="→"
          disabled={!disponible || derniereEtape}
          onClick={() => envoyer('projection.etape.suivante')}
        >
          Suivant
        </Button>
      </div>

      <Link to="/projection" className={styles.pilotage}>
        Ouvrir la télécommande complète →
      </Link>
    </Card>
  )
}
