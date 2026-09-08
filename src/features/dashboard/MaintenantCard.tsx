import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import StatutRapide from '../seance/StatutRapide'
import ARattraper from '../seance/ARattraper'
import Besoins from '../seance/Besoins'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { useProjection } from '../../hooks/useProjection'
import { quand, situerToutes } from '../../lib/seances'
import styles from './MaintenantCard.module.css'

/**
 * La carte qui répond à « qu'est-ce que je fais là, tout de suite ».
 * Elle suit l'heure : séance en cours, séance imminente, ou séance passée
 * qui attend encore une décision.
 */
export default function MaintenantCard() {
  const maintenant = useHorloge(30_000)
  const { snapshot, envoyer } = useBridge()
  const { projection, disponible, etapeLabel, progressionPct } = useProjection()

  const seances = situerToutes(snapshot?.seances ?? [], maintenant)
  const enCours = seances.find((s) => s.moment === 'en_cours')
  const imminente = seances.find((s) => s.moment === 'imminente')
  const vedette = enCours ?? imminente ?? null

  // Un cours est projeté : la télécommande passe devant tout le reste.
  if (projection) {
    const derniere = projection.etape >= projection.nbEtapes - 1
    return (
      <Card titre="En classe" accent="live" action={<Badge ton="live">En direct</Badge>}>
        <p className={styles.titre}>{projection.coursTitre}</p>
        <p className={styles.meta}>
          {projection.classeNom || vedette?.classeNom || 'Projection'} · {etapeLabel}
        </p>

        <div className={styles.barre} role="img" aria-label={`${progressionPct} % du cours`}>
          <span className={styles.remplissage} style={{ width: `${progressionPct}%` }} />
        </div>
        <p className={styles.etape}>
          {projection.etape < 0
            ? `Sommaire · ${projection.nbEtapes} étapes`
            : `Étape ${projection.etape + 1} / ${projection.nbEtapes}`}
        </p>

        <div className={styles.duo}>
          <Button
            taille="lg"
            variante="doux"
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
            disabled={!disponible || derniere}
            onClick={() => envoyer('projection.etape.suivante')}
          >
            Suivant
          </Button>
        </div>

        <Link to="/projection" className={styles.lien}>
          Télécommande complète →
        </Link>
      </Card>
    )
  }

  if (!vedette) {
    return (
      <Card titre="Maintenant">
        <p className={styles.repos}>Aucun cours en ce moment.</p>
        <p className={styles.reposDetail}>
          Lancez une projection depuis l’ordinateur pour piloter le cours d’ici.
        </p>
      </Card>
    )
  }

  const direct = vedette.moment === 'en_cours'
  return (
    <Card
      titre={direct ? 'En cours' : 'Prochain cours'}
      accent={direct ? 'live' : null}
      action={
        direct ? <Badge ton="live">En cours</Badge> : <Badge ton="accent">{quand(vedette)}</Badge>
      }
    >
      <p className={styles.horaire}>
        {vedette.debut}
        {vedette.fin ? ` – ${vedette.fin}` : ''}
      </p>
      <p className={styles.titre}>{vedette.classeNom}</p>
      <p className={styles.meta}>
        {[vedette.moduleLabel || vedette.module, vedette.seance, vedette.salle && `salle ${vedette.salle}`]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {vedette.objectif && <p className={styles.objectif}>{vedette.objectif}</p>}
      {vedette.memo && <p className={styles.memo}>Reprise : {vedette.memo}</p>}

      <div className={styles.actions}>
        <StatutRapide seance={vedette} compact />
      </div>

      <ARattraper classeId={vedette.classeId} />

      <p className={styles.section}>Besoins &amp; aménagements</p>
      <Besoins seance={vedette} />

      <Link to="/progression" className={styles.lien}>
        Pointer les absents →
      </Link>
    </Card>
  )
}
