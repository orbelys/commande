import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useSeance } from '../../hooks/useSeance'
import { useBridge } from '../../hooks/useBridge'
import { heure } from '../../lib/format'
import styles from './SeanceEnCours.module.css'

/** Résumé de la séance projetée, avec les deux commandes les plus utilisées. */
export default function SeanceEnCours() {
  const { seance, cours, classe, progressionPct } = useSeance()
  const { envoyer, status } = useBridge()
  const horsLigne = status !== 'online'

  if (!seance || !cours) {
    return (
      <Card titre="Cours en cours">
        <EmptyState
          titre="Aucune séance en cours"
          detail="Choisissez un cours pour démarrer une séance."
        />
        <Link to="/cours" className={styles.cta}>
          Choisir un cours
        </Link>
      </Card>
    )
  }

  return (
    <Card
      titre="Cours en cours"
      action={<Badge ton={seance.enPause ? 'attention' : 'ok'}>{seance.enPause ? 'En pause' : 'En direct'}</Badge>}
    >
      <p className={styles.titre}>{cours.titre}</p>
      <p className={styles.meta}>
        {classe?.nom ?? 'Classe inconnue'} · {cours.module} · démarrée à {heure(seance.demarreeA)}
      </p>

      <div className={styles.barre} role="img" aria-label={`Étape ${seance.etape} sur ${cours.nbEtapes}`}>
        <span className={styles.remplissage} style={{ width: `${progressionPct}%` }} />
      </div>
      <p className={styles.etape}>
        Étape {seance.etape} / {cours.nbEtapes}
      </p>

      <div className={styles.actions}>
        <Button
          taille="lg"
          icone="←"
          disabled={horsLigne || seance.etape <= 1}
          onClick={() => envoyer('seance.etape.precedente', { coursId: cours.id })}
        >
          Précédent
        </Button>
        <Button
          taille="lg"
          variante="principal"
          icone="→"
          disabled={horsLigne || seance.etape >= cours.nbEtapes}
          onClick={() => envoyer('seance.etape.suivante', { coursId: cours.id })}
        >
          Suivant
        </Button>
      </div>

      <Link to="/cours" className={styles.pilotage}>
        Ouvrir le pilotage complet →
      </Link>
    </Card>
  )
}
