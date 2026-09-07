import { useState } from 'react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { classeDepuisTitre, couleurDe } from '../../lib/couleurs'
import { lireHoraires, etatHoraire } from '../../lib/horaires'
import { decalerJour, jourLocal } from '../../lib/jours'
import { dateCourte, depuis } from '../../lib/format'
import { bornesAgenda, dateDansPeriode, datesAffichees, evenementsDuJour, lundiDe } from '../../lib/agenda'
import type { Ton } from '../../components/ui/Badge'
import type { EvenementJournee } from '../../services/bridge/types'
import styles from './JourneeCard.module.css'

const TON_STATUT: Record<string, Ton> = {
  'Réalisé': 'ok', 'En cours': 'live', 'À terminer': 'attention',
  'Reporté': 'attention', 'Non réalisé': 'danger', 'Annulé': 'neutre', 'Prévu': 'neutre',
}

function libelleJour(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function JourneeCard() {
  const maintenant = useHorloge(10_000)
  const { snapshot, status } = useBridge()
  const [mode, setMode] = useState<'jour' | 'semaine'>('jour')
  // null suit le présent, une date explicite reste stable pendant la consultation.
  const [dateChoisie, setDateChoisie] = useState<string | null>(null)
  const aujourdHui = jourLocal(maintenant)
  const date = dateChoisie ?? aujourdHui
  const bornes = bornesAgenda(snapshot)
  const jours = datesAffichees(date, mode)
  const suivre = dateChoisie === null
  const ancien = !snapshot || status !== 'online' || maintenant.getTime() - Date.parse(snapshot.majA) > 90_000

  function choisir(jour: string) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(jour) && dateDansPeriode(jour, bornes)) setDateChoisie(jour === aujourdHui ? null : jour)
  }
  function deplacer(sens: number) {
    if (!bornes) return
    const cible = decalerJour(mode === 'semaine' ? lundiDe(date) : date, sens * (mode === 'semaine' ? 7 : 1))
    choisir(cible < bornes.debut ? bornes.debut : cible > bornes.fin ? bornes.fin : cible)
  }

  return (
    <Card titre="Emploi du temps" padding={false}>
      <div className={styles.outils}>
        <div className={styles.modes} role="group" aria-label="Vue de l’emploi du temps">
          <button type="button" aria-pressed={mode === 'jour'} onClick={() => setMode('jour')}>Jour</button>
          <button type="button" aria-pressed={mode === 'semaine'} onClick={() => setMode('semaine')}>Semaine</button>
        </div>
        <div className={styles.navigation}>
          <Button className={styles.fleche} taille="sm" icone="←" title={mode === 'jour' ? 'Jour précédent' : 'Semaine précédente'} aria-label={mode === 'jour' ? 'Jour précédent' : 'Semaine précédente'} disabled={!bornes || jours[0] <= bornes.debut} onClick={() => deplacer(-1)} />
          <input type="date" className={styles.date} aria-label="Date de l’emploi du temps" value={date} min={bornes?.debut} max={bornes?.fin} disabled={!bornes} onChange={e => choisir(e.target.value)} />
          <Button className={styles.fleche} taille="sm" icone="→" title={mode === 'jour' ? 'Jour suivant' : 'Semaine suivante'} aria-label={mode === 'jour' ? 'Jour suivant' : 'Semaine suivante'} disabled={!bornes || jours[jours.length - 1] >= bornes.fin} onClick={() => deplacer(1)} />
        </div>
        <div className={styles.present}>
          <Button taille="sm" variante="doux" onClick={() => { setDateChoisie(null); setMode('jour') }} disabled={suivre && mode === 'jour'}>Aujourd’hui</Button>
          <span className={suivre ? styles.suivi : styles.consultation}>{suivre ? 'Suivi horaire' : 'Consultation'} · <time>{maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time></span>
        </div>
        {bornes && <p className={styles.periode}>Du {dateCourte(bornes.debut)} au {dateCourte(bornes.fin)}</p>}
        {ancien && snapshot && <p className={styles.avertissement}>Données reçues {depuis(snapshot.majA)} · actualisation en attente</p>}
        {snapshot && !snapshot.agenda && <p className={styles.avertissement}>Autres journées non reçues · mise à jour d’Electron nécessaire</p>}
        {snapshot?.agenda?.incomplet && <p className={styles.avertissement}>Période reçue partiellement</p>}
      </div>
      {jours.map(jour => {
        const evenements = evenementsDuJour(snapshot, jour)
        const passes = mode === 'jour' && suivre && jour === aujourdHui ? (evenements ?? []).filter(e => {
          const h = lireHoraires(e.debut, e.fin)
          return etatHoraire(jour, h.debut, h.fin, maintenant).passe
        }) : []
        const visibles = (evenements ?? []).filter(e => !passes.includes(e))
        return (
          <section key={jour} className={styles.jour} aria-label={libelleJour(jour)}>
            <h3 className={styles.enteteJour}>
              {mode === 'semaine' ? <button type="button" disabled={!dateDansPeriode(jour, bornes)} onClick={() => { choisir(jour); setMode('jour') }}>{libelleJour(jour)}{jour === aujourdHui ? ' · Aujourd’hui' : ''}</button> : libelleJour(jour)}
            </h3>
            {evenements === null ? <EmptyState titre="Journée non reçue" detail="Les données de cette date ne sont pas disponibles sur ce téléphone." /> : evenements.length === 0 ? <p className={styles.vide}>Aucun cours ni rendez-vous reçu.</p> : <>
              {passes.length > 0 && <details className={styles.passes}><summary>{passes.length} créneau{passes.length > 1 ? 'x' : ''} passé{passes.length > 1 ? 's' : ''}</summary><Frise date={jour} evenements={passes} maintenant={maintenant} /></details>}
              {visibles.length > 0 ? <Frise date={jour} evenements={visibles} maintenant={maintenant} /> : <p className={styles.vide}>Aucun autre événement reçu pour aujourd’hui.</p>}
            </>}
          </section>
        )
      })}
    </Card>
  )
}

function Frise({ date, evenements, maintenant }: { date: string; evenements: EvenementJournee[]; maintenant: Date }) {
  return (
    <ol className={styles.frise}>
      {[...evenements].sort((a, b) => lireHoraires(a.debut, a.fin).debut.localeCompare(lireHoraires(b.debut, b.fin).debut)).map((e, i) => {
        const { debut, fin } = lireHoraires(e.debut, e.fin)
        const phase = etatHoraire(date, debut, fin, maintenant)
        const actif = phase.actif && e.statut !== 'Annulé' && e.statut !== 'Reporté'
        const couleur = couleurDe(e.classeNom || classeDepuisTitre(e.titre))
        return (
          <li key={`${e.id}:${i}`} className={[styles.item, phase.passe ? styles.passe : '', actif ? styles.actif : ''].filter(Boolean).join(' ')} aria-current={actif ? 'time' : undefined}>
            <span className={styles.heure}>{debut || '—'}</span>
            <span className={styles.trait} aria-hidden="true"><span className={styles.point} style={actif || !phase.passe ? { background: couleur.vif } : undefined} /></span>
            <span className={styles.corps} style={{ borderLeftColor: couleur.vif }}>
              <span className={styles.titre}>{e.titre}</span>
              <span className={styles.detail}>{[actif ? 'En ce moment' : '', e.lieu, fin ? `jusqu’à ${fin}` : debut ? 'Fin non précisée' : 'Toute la journée'].filter(Boolean).join(' · ')}</span>
              {e.statut && <span className={styles.statut}><Badge ton={TON_STATUT[e.statut] ?? 'neutre'}>{e.statut}</Badge></span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
