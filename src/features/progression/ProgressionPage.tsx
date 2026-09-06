import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ListRow from '../../components/ui/ListRow'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { dateCourte } from '../../lib/format'
import type { Ton } from '../../components/ui/Badge'
import type { Seance, StatutSeance } from '../../services/bridge/types'
import styles from './ProgressionPage.module.css'

/**
 * Seuls ces quatre statuts s'appliquent en silence dans la Suite PSE.
 * « À terminer », « Reporté » et « Non réalisé » ouvrent une fenêtre de reprise
 * sur l'ordinateur (où placer le rattrapage) : les envoyer depuis le téléphone
 * ferait surgir une boîte de dialogue en pleine classe. On les laisse à
 * l'ordinateur, et le mémo de reprise suffit à noter où l'on s'est arrêté.
 */
const STATUTS: StatutSeance[] = ['Prévu', 'En cours', 'Fait', 'Annulé']

const TONS: Record<StatutSeance, Ton> = {
  'Prévu': 'neutre',
  'En cours': 'accent',
  'Fait': 'ok',
  'À terminer': 'attention',
  'Reporté': 'attention',
  'Non réalisé': 'danger',
  'Annulé': 'neutre',
}

const REMISES = [
  { valeur: 'fait', libelle: 'Support remis' },
  { valeur: 'a_faire', libelle: 'À remettre' },
  { valeur: 'sans_objet', libelle: 'Sans objet' },
] as const

/** Séances de progression : changer le statut, la remise, le mémo de reprise. */
export default function ProgressionPage() {
  const { snapshot, envoyer, status } = useBridge()
  const [ouverte, setOuverte] = useState<string | null>(null)
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)

  const seances = useMemo(() => {
    const liste = [...(snapshot?.seances ?? [])]
    liste.sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut))
    return liste
  }, [snapshot])

  if (!snapshot?.capacites.progression) {
    return (
      <>
        <PageHeader titre="Progression" detail="Séances de la semaine" />
        <Card>
          <EmptyState
            titre="Progression indisponible"
            detail="Le poste Electron ne publie pas la progression pour le moment."
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader titre="Progression" detail="Appuyez sur une séance pour la mettre à jour" />

      <Card padding={false}>
        {seances.length === 0 ? (
          <EmptyState titre="Aucune séance" detail="Rien n’est publié pour cette période." />
        ) : (
          seances.map((s) => (
            <div key={s.id}>
              <ListRow
                titre={`${dateCourte(s.date)} · ${s.debut} — ${s.classeNom}`}
                sousTitre={[s.moduleLabel, s.seance, s.objectif].filter(Boolean).join(' · ')}
                actif={ouverte === s.id}
                droite={<Badge ton={TONS[s.statut]}>{s.statut}</Badge>}
                onClick={() => setOuverte(ouverte === s.id ? null : s.id)}
              />
              {ouverte === s.id && <PanneauSeance seance={s} dispo={dispo} envoyer={envoyer} />}
            </div>
          ))
        )}
      </Card>
    </>
  )
}

function PanneauSeance({
  seance,
  dispo,
  envoyer,
}: {
  seance: Seance
  dispo: boolean
  envoyer: ReturnType<typeof useBridge>['envoyer']
}) {
  const [memo, setMemo] = useState(seance.memo)

  return (
    <div className={styles.panneau}>
      <p className={styles.section}>Statut</p>
      <div className={styles.choix}>
        {STATUTS.map((st) => (
          <Button
            key={st}
            variante={seance.statut === st ? 'principal' : 'secondaire'}
            disabled={!dispo}
            onClick={() => envoyer('seance.statut', { seanceId: seance.id, statut: st })}
          >
            {st}
          </Button>
        ))}
      </div>

      <p className={styles.note}>
        « À terminer » et « Reporté » se choisissent sur l’ordinateur : ils ouvrent la fenêtre
        de reprise. Notez plutôt où vous en êtes dans le mémo ci-dessous.
      </p>

      <p className={styles.section}>Support de cours</p>
      <div className={styles.choix}>
        {REMISES.map((r) => (
          <Button
            key={r.valeur}
            variante={seance.remise === r.valeur ? 'principal' : 'secondaire'}
            disabled={!dispo}
            onClick={() => envoyer('seance.remise', { seanceId: seance.id, remise: r.valeur })}
          >
            {r.libelle}
          </Button>
        ))}
      </div>

      <p className={styles.section}>Mémo de reprise</p>
      <textarea
        className={styles.memo}
        rows={3}
        value={memo}
        disabled={!dispo}
        placeholder="Ex. : arrêté question 4, document 3 non fini…"
        onChange={(e) => setMemo(e.target.value)}
      />
      <Button
        pleineLargeur
        variante="principal"
        disabled={!dispo || memo === seance.memo}
        onClick={() => envoyer('seance.memo', { seanceId: seance.id, memo })}
      >
        Enregistrer le mémo
      </Button>

      {seance.salle && <p className={styles.detail}>Salle {seance.salle}</p>}
    </div>
  )
}
