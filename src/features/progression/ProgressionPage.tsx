import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import StatutRapide from '../seance/StatutRapide'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { quand, situerToutes, type SeanceSituee } from '../../lib/seances'
import { dateCourte } from '../../lib/format'
import type { Ton } from '../../components/ui/Badge'
import type { StatutSeance } from '../../services/bridge/types'
import styles from './ProgressionPage.module.css'

const TONS: Record<StatutSeance, Ton> = {
  'Prévu': 'neutre',
  'En cours': 'live',
  'Réalisé': 'ok',
  'À terminer': 'attention',
  'Reporté': 'attention',
  'Non réalisé': 'danger',
  'Annulé': 'neutre',
}

const REMISES = [
  { valeur: 'remis', libelle: 'Remis' },
  { valeur: 'partiel', libelle: 'En partie' },
  { valeur: 'a_faire', libelle: 'À remettre' },
] as const

/** Séances de la période : statut, remise du support, mémo de reprise. */
export default function ProgressionPage() {
  const maintenant = useHorloge(30_000)
  const { snapshot } = useBridge()
  const [ouverte, setOuverte] = useState<string | null>(null)

  const groupes = useMemo(() => {
    const toutes = situerToutes(snapshot?.seances ?? [], maintenant)
    const passee = (s: SeanceSituee) => s.moment === 'passee' || s.moment === 'autre_jour'
    const aReprendre = (s: SeanceSituee) =>
      passee(s) && ['À terminer', 'Reporté', 'Non réalisé'].includes(s.statut)

    return {
      aCloturer: toutes.filter((s) => s.aCloturer),
      aReprendre: toutes.filter(aReprendre),
      maintenant: toutes.filter((s) => s.moment === 'en_cours' || s.moment === 'imminente'),
      suite: toutes.filter(
        (s) =>
          !s.aCloturer &&
          !aReprendre(s) &&
          s.moment !== 'en_cours' &&
          s.moment !== 'imminente' &&
          !passee(s),
      ),
      faites: toutes.filter(
        (s) => passee(s) && !s.aCloturer && !aReprendre(s),
      ),
    }
  }, [snapshot, maintenant])

  if (!snapshot?.capacites.progression) {
    return (
      <>
        <PageHeader titre="Progression" detail="Séances de la période" />
        <Card>
          <EmptyState
            titre="Progression indisponible"
            detail="L’ordinateur ne publie pas la progression pour le moment."
          />
        </Card>
      </>
    )
  }

  const total =
    groupes.aCloturer.length +
    groupes.aReprendre.length +
    groupes.maintenant.length +
    groupes.suite.length +
    groupes.faites.length

  return (
    <>
      <PageHeader titre="Progression" detail="Appuyez sur une séance pour la mettre à jour" />

      {total === 0 && (
        <Card>
          <EmptyState titre="Aucune séance" detail="Rien n’est publié pour cette période." />
        </Card>
      )}

      {groupes.aCloturer.length > 0 && (
        <Bloc
          titre="À clôturer"
          accent="attention"
          compte={groupes.aCloturer.length}
          seances={groupes.aCloturer}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.aReprendre.length > 0 && (
        <Bloc
          titre="À reprendre"
          compte={groupes.aReprendre.length}
          seances={groupes.aReprendre}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.maintenant.length > 0 && (
        <Bloc
          titre="Maintenant"
          accent="live"
          compte={groupes.maintenant.length}
          seances={groupes.maintenant}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.suite.length > 0 && (
        <Bloc
          titre="La suite"
          compte={groupes.suite.length}
          seances={groupes.suite}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.faites.length > 0 && (
        <Bloc
          titre="Déjà passées"
          compte={groupes.faites.length}
          seances={groupes.faites}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}
    </>
  )
}

function Bloc({
  titre,
  accent = null,
  compte,
  seances,
  ouverte,
  setOuverte,
}: {
  titre: string
  accent?: 'live' | 'attention' | null
  compte: number
  seances: SeanceSituee[]
  ouverte: string | null
  setOuverte: (id: string | null) => void
}) {
  return (
    <Card
      titre={titre}
      accent={accent}
      padding={false}
      action={<Badge ton={accent ?? 'neutre'}>{compte}</Badge>}
    >
      {seances.map((s) => (
        <div key={s.id}>
          <button
            type="button"
            className={`${styles.ligne} ${ouverte === s.id ? styles.ligneOuverte : ''}`}
            onClick={() => setOuverte(ouverte === s.id ? null : s.id)}
            aria-expanded={ouverte === s.id}
          >
            <span className={styles.gauche}>
              <span className={styles.horaire}>{s.debut || '—'}</span>
              <span className={styles.jour}>{dateCourte(s.date)}</span>
            </span>
            <span className={styles.texte}>
              <span className={styles.classe}>{s.classeNom}</span>
              <span className={styles.detail}>
                {[s.moduleLabel || s.module, s.seance, s.objectif].filter(Boolean).join(' · ') ||
                  'Séance'}
              </span>
              {s.moment !== 'autre_jour' && s.moment !== 'passee' && (
                <span className={styles.quand}>{quand(s)}</span>
              )}
            </span>
            <Badge ton={TONS[s.statut]}>{s.statut}</Badge>
          </button>
          {ouverte === s.id && <Panneau seance={s} />}
        </div>
      ))}
    </Card>
  )
}

function Panneau({ seance }: { seance: SeanceSituee }) {
  const { envoyer, status, snapshot } = useBridge()
  const [memo, setMemo] = useState(seance.memo)
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)

  return (
    <div className={styles.panneau}>
      <p className={styles.section}>Statut</p>
      <StatutRapide seance={seance} />
      <p className={styles.note}>
        « À terminer » et « Reporté » se choisissent sur l’ordinateur : ils ouvrent la fenêtre de
        reprise, qui demande où rattraper. Notez plutôt où vous en êtes ci-dessous.
      </p>

      <p className={styles.section}>Support de cours</p>
      <div className={styles.choix}>
        {REMISES.map((r) => (
          <Button
            key={r.valeur}
            taille="sm"
            variante={seance.remise === r.valeur ? 'principal' : 'doux'}
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

      {seance.salle && <p className={styles.salle}>Salle {seance.salle}</p>}
    </div>
  )
}
