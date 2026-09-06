import { useState } from 'react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useSeance } from '../../hooks/useSeance'
import { duree, heure } from '../../lib/format'
import styles from './CoursPage.module.css'

/** Télécommande de la seance + choix du cours a projeter. */
export default function CoursPage() {
  const { snapshot, envoyer, status } = useBridge()
  const { seance, cours, classe, progressionPct } = useSeance()
  const [message, setMessage] = useState<string | null>(null)
  const horsLigne = status !== 'online'

  const liste = snapshot?.cours ?? []

  function commander(type: Parameters<typeof envoyer>[0], payload = {}, retour?: string) {
    envoyer(type, payload)
    if (retour) {
      setMessage(retour)
      window.setTimeout(() => setMessage(null), 2500)
    }
  }

  return (
    <>
      <PageHeader titre="Cours" detail="Piloter la séance projetée dans Electron" />

      {cours && seance ? (
        <Card
          titre="Télécommande"
          action={<Badge ton={seance.enPause ? 'attention' : 'ok'}>{seance.enPause ? 'En pause' : 'En direct'}</Badge>}
        >
          <p className={styles.titre}>{cours.titre}</p>
          <p className={styles.meta}>
            {classe?.nom ?? '—'} · étape {seance.etape}/{cours.nbEtapes} ({progressionPct} %) ·{' '}
            {duree(cours.duree)} · démarrée à {heure(seance.demarreeA)}
          </p>

          <div className={styles.duo}>
            <Button
              taille="lg"
              icone="←"
              disabled={horsLigne || seance.etape <= 1}
              onClick={() => commander('seance.etape.precedente', { coursId: cours.id })}
            >
              Précédent
            </Button>
            <Button
              taille="lg"
              variante="principal"
              icone="→"
              disabled={horsLigne || seance.etape >= cours.nbEtapes}
              onClick={() => commander('seance.etape.suivante', { coursId: cours.id })}
            >
              Suivant
            </Button>
          </div>

          <div className={styles.trio}>
            <Button
              disabled={horsLigne}
              icone={seance.enPause ? '▶' : '❚❚'}
              onClick={() => commander('seance.pause.basculer', {})}
            >
              {seance.enPause ? 'Reprendre' : 'Pause'}
            </Button>
            <Button
              disabled={horsLigne}
              icone="◐"
              onClick={() => commander('seance.corrige.basculer', {})}
            >
              {seance.corrigeVisible ? 'Masquer corrigé' : 'Corrigé'}
            </Button>
            <Button
              disabled={horsLigne || seance.demarreeA !== null}
              icone="⏻"
              onClick={() => commander('seance.demarrer', { coursId: cours.id }, 'Séance démarrée')}
            >
              Démarrer
            </Button>
          </div>

          <div className={styles.duo}>
            <Button
              variante="principal"
              disabled={horsLigne}
              icone="✓"
              onClick={() => commander('seance.valider', { coursId: cours.id, etape: seance.etape }, 'Étape validée')}
            >
              Valider l’étape
            </Button>
            <Button
              disabled={horsLigne}
              icone="⤓"
              onClick={() =>
                commander(
                  'seance.enregistrer',
                  { coursId: cours.id, classeId: seance.classeId, etape: seance.etape },
                  'État de la séance enregistré',
                )
              }
            >
              Enregistrer
            </Button>
          </div>

          <p className={styles.retour} role="status">
            {message ?? (horsLigne ? 'Electron est hors ligne : commandes désactivées.' : ' ')}
          </p>
        </Card>
      ) : (
        <Card titre="Télécommande">
          <EmptyState titre="Aucune séance active" detail="Choisissez un cours ci-dessous." />
        </Card>
      )}

      <Card titre="Bibliothèque de cours" padding={false}>
        {liste.length === 0 ? (
          <EmptyState titre="Aucun cours reçu" detail="Electron n’a pas encore publié sa bibliothèque." />
        ) : (
          liste.map((c) => {
            const cl = snapshot?.classes.find((x) => x.id === c.classeId)
            return (
              <ListRow
                key={c.id}
                titre={c.titre}
                sousTitre={`${c.module} · ${cl?.nom ?? 'toutes classes'} · ${c.nbEtapes} étapes`}
                actif={c.id === seance?.coursId}
                droite={c.id === seance?.coursId ? <Badge ton="accent">Projeté</Badge> : undefined}
                onClick={
                  horsLigne
                    ? undefined
                    : () => commander('cours.selectionner', { coursId: c.id }, `Cours envoyé : ${c.titre}`)
                }
              />
            )
          })
        )}
      </Card>
    </>
  )
}
