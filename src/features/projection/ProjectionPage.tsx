import { useState } from 'react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useProjection } from '../../hooks/useProjection'
import Minuteur from './Minuteur'
import Accessibilite from './Accessibilite'
import styles from './ProjectionPage.module.css'

/** Libellé lisible du type d'une ressource projetée. */
function typeRessource(type: string): string {
  switch (type) {
    case 'youtube':
      return 'Vidéo YouTube'
    case 'video':
      return 'Vidéo'
    case 'audio':
      return 'Audio'
    case 'image':
      return 'Image'
    case 'pdf':
      return 'Document PDF'
    default:
      return 'Ressource'
  }
}

/** Télécommande du cours projeté en classe. */
export default function ProjectionPage() {
  const { envoyer, snapshot } = useBridge()
  const { projection, disponible, raisonIndisponible, messageCommande, etapeLabel, progressionPct } = useProjection()
  const [sommaireOuvert, setSommaireOuvert] = useState(false)

  if (!snapshot?.capacites.projection || !projection) {
    return (
      <>
        <PageHeader titre="Projection" detail="Piloter le cours projeté en classe" />
        <Card>
          <EmptyState
            titre="Aucun cours projeté"
            detail="Ouvrez un cours dans la Suite PSE et cliquez sur « Projeter » : la télécommande apparaîtra ici."
          />
        </Card>
      </>
    )
  }

  const derniereEtape = projection.etape >= projection.nbEtapes - 1

  return (
    <>
      <PageHeader titre="Projection" detail="Piloter le cours projeté en classe" />

      <Card
        titre="Télécommande"
        action={
          <Badge ton={projection.fenetreOuverte ? 'ok' : 'attention'}>
            {projection.fenetreOuverte ? 'Fenêtre élèves ouverte' : 'Fenêtre fermée'}
          </Badge>
        }
      >
        <p className={styles.titre}>{projection.coursTitre}</p>
        <p className={styles.meta}>
          {projection.classeNom || 'Classe non précisée'} · {etapeLabel}
        </p>
        {(raisonIndisponible || messageCommande) && (
          <p role="status" className={styles.note}>
            {raisonIndisponible || messageCommande}
          </p>
        )}

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

        <Button
          pleineLargeur
          variante={projection.corrigeVisible ? 'principal' : 'secondaire'}
          icone="◐"
          className={styles.corrige}
          disabled={!disponible || !projection.corrigeDisponible}
          onClick={() => envoyer('projection.corrige.basculer')}
        >
          {projection.corrigeVisible ? 'Masquer le corrigé' : 'Afficher le corrigé'}
        </Button>
        {!projection.corrigeDisponible && (
          <p className={styles.note}>Cette étape n’a pas de corrigé.</p>
        )}

        <div className={styles.duo}>
          <Button
            icone="⛶"
            disabled={!disponible}
            onClick={() => envoyer('projection.focus.basculer')}
          >
            {projection.focus ? 'Quitter le focus' : 'Mode focus'}
          </Button>
          <Button
            icone="🖥"
            disabled={!disponible || projection.fenetreOuverte}
            onClick={() => envoyer('projection.ouvrir')}
          >
            Fenêtre élèves
          </Button>
        </div>
        <Accessibilite projection={projection} disponible={disponible} />
      </Card>

      <Minuteur etat={projection.minuteur} dispo={disponible} />

      {projection.roue?.configuree && (
        <Card
          titre="Roue de tirage"
          action={<Badge ton="accent">{projection.roue.classe || 'Classe'}</Badge>}
        >
          <p className={styles.meta}>
            Dans la roue : {projection.roue.dansLaRoue}
            {projection.roue.total ? ` / ${projection.roue.total}` : ''} · déjà tirés :{' '}
            {projection.roue.dejaTires}
          </p>
          {projection.roue.dernier && (
            <p className={styles.titre}>🎯 {projection.roue.dernier}</p>
          )}
          <div className={styles.duo}>
            <Button
              taille="lg"
              variante="principal"
              icone="🎡"
              disabled={!disponible}
              onClick={() => envoyer('projection.roue.tourner')}
            >
              Tirer
            </Button>
            <Button
              icone="↺"
              disabled={!disponible}
              onClick={() => envoyer('projection.roue.reinitialiser')}
            >
              Réinitialiser
            </Button>
          </div>
          <Button
            pleineLargeur
            variante="secondaire"
            icone="✕"
            className={styles.corrige}
            disabled={!disponible}
            onClick={() => envoyer('projection.roue.cacher')}
          >
            Cacher la roue
          </Button>
        </Card>
      )}

      {projection.ressources && projection.ressources.length > 0 && (
        <Card
          titre="Ressources"
          action={
            (projection.ressourceActive ?? -1) >= 0 ? (
              <Button
                variante="discret"
                disabled={!disponible}
                onClick={() => envoyer('projection.ressource.fermer')}
              >
                ✕ Fermer
              </Button>
            ) : undefined
          }
        >
          <p className={styles.note}>
            Projette une vidéo ou un document préparé sur l’écran des élèves.
          </p>
          {projection.ressources.map((r) => {
            const active = (projection.ressourceActive ?? -1) === r.idx
            return (
              <ListRow
                key={r.idx}
                titre={r.titre}
                sousTitre={typeRessource(r.type)}
                actif={active}
                droite={
                  active ? (
                    <Badge ton="accent">À l’écran</Badge>
                  ) : (
                    <Button
                      taille="sm"
                      variante="principal"
                      icone="▶"
                      disabled={!disponible || !projection.fenetreOuverte}
                      onClick={() => envoyer('projection.ressource.afficher', { index: r.idx })}
                    >
                      Projeter
                    </Button>
                  )
                }
              />
            )
          })}
          {!projection.fenetreOuverte && (
            <p className={styles.note}>
              Ouvre d’abord la fenêtre élèves pour projeter une ressource.
            </p>
          )}
        </Card>
      )}

      <Card
        titre="Sommaire"
        padding={false}
        action={
          <Button variante="discret" onClick={() => setSommaireOuvert((v) => !v)}>
            {sommaireOuvert ? 'Réduire' : 'Déplier'}
          </Button>
        }
      >
        {sommaireOuvert ? (
          projection.sommaire.map((e) => (
            <ListRow
              key={e.idx}
              titre={e.label}
              sousTitre={e.corrigeDisponible ? 'Corrigé disponible' : 'Sans corrigé'}
              actif={e.idx === projection.etape}
              droite={e.idx === projection.etape ? <Badge ton="accent">En cours</Badge> : undefined}
              onClick={
                disponible ? () => envoyer('projection.etape.aller', { etape: e.idx }) : undefined
              }
            />
          ))
        ) : (
          <ListRow
            titre={etapeLabel}
            sousTitre={`${projection.nbEtapes} étapes au total`}
            droite={<Badge ton="accent">En cours</Badge>}
          />
        )}
      </Card>
    </>
  )
}
