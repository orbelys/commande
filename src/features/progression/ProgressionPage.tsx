import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import StatutRapide from '../seance/StatutRapide'
import Absents from '../seance/Absents'
import Besoins from '../seance/Besoins'
import ARattraper from '../seance/ARattraper'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { quand, situerToutes, type SeanceSituee } from '../../lib/seances'
import { grouperSimultanees, type Groupe } from '../../lib/groupes'
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
    // Regroupe les cours simultanés (co-enseignés) en un seul bloc.
    const blocs = grouperSimultanees(toutes)
    const rep = (g: Groupe<SeanceSituee>) => g.vedette
    const passee = (g: Groupe<SeanceSituee>) => rep(g).moment === 'passee' || (rep(g).moment === 'autre_jour' && rep(g).minutesAvant < 0)
    // À clôturer / à reprendre : vrai si l'une des classes du bloc l'est.
    const aCloturer = (g: Groupe<SeanceSituee>) => g.membres.some((s) => s.aCloturer)
    const aReprendre = (g: Groupe<SeanceSituee>) =>
      passee(g) && g.membres.some((s) => ['À terminer', 'Reporté', 'Non réalisé'].includes(s.statut))

    return {
      aCloturer: blocs.filter(aCloturer),
      aReprendre: blocs.filter((g) => !aCloturer(g) && aReprendre(g)),
      maintenant: blocs.filter((g) => rep(g).moment === 'en_cours' || rep(g).moment === 'imminente'),
      suite: blocs.filter(
        (g) =>
          !aCloturer(g) &&
          !aReprendre(g) &&
          rep(g).moment !== 'en_cours' &&
          rep(g).moment !== 'imminente' &&
          !passee(g),
      ),
      faites: blocs.filter((g) => passee(g) && !aCloturer(g) && !aReprendre(g)),
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
          groupes={groupes.aCloturer}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.aReprendre.length > 0 && (
        <Bloc
          titre="À reprendre"
          compte={groupes.aReprendre.length}
          groupes={groupes.aReprendre}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.maintenant.length > 0 && (
        <Bloc
          titre="Maintenant"
          accent="live"
          compte={groupes.maintenant.length}
          groupes={groupes.maintenant}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.suite.length > 0 && (
        <Bloc
          titre="La suite"
          compte={groupes.suite.length}
          groupes={groupes.suite}
          ouverte={ouverte}
          setOuverte={setOuverte}
        />
      )}

      {groupes.faites.length > 0 && (
        <Bloc
          titre="Déjà passées"
          compte={groupes.faites.length}
          groupes={groupes.faites}
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
  groupes,
  ouverte,
  setOuverte,
}: {
  titre: string
  accent?: 'live' | 'attention' | null
  compte: number
  groupes: Groupe<SeanceSituee>[]
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
      {groupes.map((g) => {
        const v = g.vedette
        const absents = g.membres.reduce((n, s) => n + s.absents.length, 0)
        const memeStatut = g.membres.every((s) => s.statut === v.statut)
        return (
          <div key={g.id}>
            <button
              type="button"
              className={`${styles.ligne} ${ouverte === g.id ? styles.ligneOuverte : ''}`}
              onClick={() => setOuverte(ouverte === g.id ? null : g.id)}
              aria-expanded={ouverte === g.id}
            >
              <span className={styles.gauche}>
                <span className={styles.horaire}>{v.debut || '—'}</span>
                <span className={styles.jour}>{dateCourte(v.date)}</span>
              </span>
              <span className={styles.texte}>
                <span className={styles.classe}>{g.classesLabel}</span>
                <span className={styles.detail}>
                  {[v.moduleLabel || v.module, v.seance, v.sequenceLabel, v.objectif]
                    .filter(Boolean)
                    .join(' · ') || 'Séance'}
                </span>
                {v.moment !== 'autre_jour' && v.moment !== 'passee' && (
                  <span className={styles.quand}>{quand(v)}</span>
                )}
              </span>
              <span className={styles.badges}>
                {absents > 0 && <Badge ton="danger">{absents} abs.</Badge>}
                <Badge ton={TONS[v.statut]}>{memeStatut ? v.statut : 'Statuts mixtes'}</Badge>
              </span>
            </button>
            {ouverte === g.id && <Panneau groupe={g} />}
          </div>
        )
      })}
    </Card>
  )
}

function Panneau({ groupe }: { groupe: Groupe<SeanceSituee> }) {
  const { envoyer, status, snapshot, commandes } = useBridge()
  const membres = groupe.membres
  const vedette = groupe.vedette
  const [memo, setMemo] = useState(vedette.memo)
  const [memoCommandes, setMemoCommandes] = useState<string[]>([])
  const resultats = memoCommandes.map(id => commandes.find(c => c.id === id))
  const envoiMemo = resultats.some(c => !c || ['en_attente', 'envoyee', 'en_cours'].includes(c.statut))
  const echecsMemo = resultats.filter(c => c && ['echouee', 'sans_confirmation'].includes(c.statut))
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)

  const memoModifie = membres.some(m => memo !== m.memo)
  const memoEnregistre = !memoModifie && memo.trim() !== ''
  const remiseCommune = membres.every((m) => m.remise === vedette.remise) ? vedette.remise : ''

  return (
    <div className={styles.panneau}>
      {membres.length > 1 && (
        <p className={styles.note}>
          🧩 Cours co-enseigné — un seul geste s’applique aux {membres.length} classes : {groupe.classesLabel}.
        </p>
      )}

      <p className={styles.section}>Statut</p>
      <StatutRapide membres={membres} />
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
            variante={remiseCommune === r.valeur ? 'principal' : 'doux'}
            disabled={!dispo}
            onClick={() => membres.forEach((m) => envoyer('seance.remise', { seanceId: m.id, remise: r.valeur }))}
          >
            {r.libelle}
          </Button>
        ))}
      </div>

      <p className={styles.section}>Absents (codes)</p>
      <Absents membres={membres} />

      <p className={styles.section}>Besoins &amp; aménagements</p>
      <Besoins membres={membres} />

      <p className={styles.section}>À rattraper dans la classe</p>
      {membres.map((m) => (
        <div key={m.id}>
          {membres.length > 1 && <p className={styles.note}>{m.classeNom}</p>}
          <ARattraper classeId={m.classeId} />
        </div>
      ))}

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
          const ids = membres.map((m) => envoyer('seance.memo', { seanceId: m.id, memo }).id)
          setMemoCommandes(ids)
        }}
      >
        {envoiMemo
          ? 'Enregistrement…'
          : memoEnregistre
            ? '✓ Mémo enregistré'
            : 'Enregistrer le mémo'}
      </Button>

      {echecsMemo.map(c => c && <p key={c.id} role="alert">{membres.find(m => m.id === c.payload.seanceId)?.classeNom} : {c.erreur || 'Enregistrement non confirmé. Ton texte reste dans le champ.'}</p>)}

      {vedette.salle && <p className={styles.salle}>Salle {vedette.salle}</p>}
    </div>
  )
}
