import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import StatutRapide from '../seance/StatutRapide'
import Absents from '../seance/Absents'
import ARattraper from '../seance/ARattraper'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { quand, situerToutes, type SeanceSituee } from '../../lib/seances'
import { dateCourte } from '../../lib/format'
import { decalerJour, jourLocal } from '../../lib/jours'
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
  const [jourChoisi, setJourChoisi] = useState<string | null>(null)
  const reference = snapshot?.date || jourLocal(maintenant)
  // Le pont publie actuellement J-1 à J+6, même les jours sans séance.
  const premierJour = decalerJour(reference, -1)
  const dernierJour = decalerJour(reference, 6)
  const date = jourChoisi && jourChoisi >= premierJour && jourChoisi <= dernierJour ? jourChoisi : reference
  function choisirJour(jour: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(jour) || jour < premierJour || jour > dernierJour) return
    setJourChoisi(jour)
    setOuverte(null)
  }

  const groupes = useMemo(() => {
    const toutes = situerToutes((snapshot?.seances ?? []).filter(s => s.date === date), maintenant)
    const passee = (s: SeanceSituee) => s.moment === 'passee' || (s.moment === 'autre_jour' && s.minutesAvant < 0)
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
  }, [snapshot, maintenant, date])

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
      <nav className={styles.navigationJour} aria-label="Jours de progression">
        <Button className={styles.fleche} icone="←" aria-label="Jour précédent" title="Jour précédent" disabled={date <= premierJour} onClick={() => choisirJour(decalerJour(date, -1))} />
        <input className={styles.date} type="date" aria-label="Date des séances" min={premierJour} max={dernierJour} value={date} onChange={e => choisirJour(e.target.value)} />
        <Button className={styles.fleche} icone="→" aria-label="Jour suivant" title="Jour suivant" disabled={date >= dernierJour} onClick={() => choisirJour(decalerJour(date, 1))} />
        <Button className={styles.aujourdhui} taille="sm" disabled={date === jourLocal(maintenant) || jourLocal(maintenant) < premierJour || jourLocal(maintenant) > dernierJour} onClick={() => choisirJour(jourLocal(maintenant))}>Aujourd’hui</Button>
      </nav>
      <p className={styles.periode}>Séances disponibles du {dateCourte(premierJour)} au {dateCourte(dernierJour)}</p>

      {total === 0 && (
        <Card>
          <EmptyState titre="Aucune séance ce jour" detail={`Aucune séance reçue pour le ${dateCourte(date)}.`} />
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
                {[s.moduleLabel || s.module, s.seance, s.sequenceLabel, s.objectif]
                  .filter(Boolean)
                  .join(' · ') || 'Séance'}
              </span>
              {s.moment !== 'autre_jour' && s.moment !== 'passee' && (
                <span className={styles.quand}>{quand(s)}</span>
              )}
            </span>
            <span className={styles.badges}>
              {s.absents.length > 0 && (
                <Badge ton="danger">{s.absents.length} abs.</Badge>
              )}
              <Badge ton={TONS[s.statut]}>{s.statut}</Badge>
            </span>
          </button>
          {ouverte === s.id && <Panneau seance={s} />}
        </div>
      ))}
    </Card>
  )
}

function Panneau({ seance }: { seance: SeanceSituee }) {
  const { envoyer, status, snapshot, commandes } = useBridge()
  const [memo, setMemo] = useState(seance.memo)
  const [envoiMemo, setEnvoiMemo] = useState(false)
  const [memoCommande, setMemoCommande] = useState<string | null>(null)
  const resultat = commandes.find(c => c.id === memoCommande)
  useEffect(() => {
    if (resultat && ['echouee', 'appliquee', 'sans_confirmation'].includes(resultat.statut)) setEnvoiMemo(false)
  }, [resultat])
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)

  // Le mémo enregistré revient par l'instantané republié : quand seance.memo
  // rattrape la valeur tapée, on lève l'état « en cours d'envoi ».
  useEffect(() => {
    if (memo === seance.memo) setEnvoiMemo(false)
  }, [seance.memo, memo])

  const memoModifie = memo !== seance.memo
  const memoEnregistre = !memoModifie && memo.trim() !== ''

  return (
    <div className={styles.panneau}>
      <p className={styles.section}>Statut</p>
      <StatutRapide seance={seance} />
      <p className={styles.note}>
        « À terminer », « Reporté » et « Non réalisé » enregistrent le statut ; le placement du
        rattrapage se règle ensuite sur l’ordinateur. Pour une séance qui se poursuit, notez où
        vous en êtes dans le mémo de reprise ci-dessous.
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

      <p className={styles.section}>Absents (codes)</p>
      <Absents seance={seance} />

      <p className={styles.section}>À rattraper dans la classe</p>
      <ARattraper classeId={seance.classeId} />

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
        variante={memoEnregistre ? 'succes' : 'principal'}
        disabled={!dispo || !memoModifie || envoiMemo}
        onClick={() => {
          setEnvoiMemo(true)
          setMemoCommande(envoyer('seance.memo', { seanceId: seance.id, memo }).id)
        }}
      >
        {envoiMemo
          ? 'Enregistrement…'
          : memoEnregistre
            ? '✓ Mémo enregistré'
            : 'Enregistrer le mémo'}
      </Button>

      {resultat && ['echouee', 'sans_confirmation'].includes(resultat.statut) && <p role="alert">{resultat.erreur || 'Enregistrement non confirmé. Ton texte reste dans le champ.'}</p>}

      {seance.salle && <p className={styles.salle}>Salle {seance.salle}</p>}
    </div>
  )
}
