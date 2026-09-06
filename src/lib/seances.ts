import type { Seance, StatutSeance } from '../services/bridge/types'

/** Où en est une séance par rapport à l'heure qu'il est. */
export type Moment = 'passee' | 'en_cours' | 'imminente' | 'a_venir' | 'autre_jour'

export interface SeanceSituee extends Seance {
  moment: Moment
  /** Minutes avant le début (négatif si commencé). */
  minutesAvant: number
  /** L'heure est passée mais rien n'a été acté : elle attend une décision. */
  aCloturer: boolean
}

function jourIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function minutes(heure: string): number | null {
  const m = /^(\d{1,2})[:h.](\d{2})?/.exec(String(heure || '').trim())
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2] ?? 0)
}

/** Statuts qui signifient « la question est réglée ». */
const REGLES: StatutSeance[] = ['Réalisé', 'Annulé', 'À terminer', 'Reporté', 'Non réalisé']

/**
 * Situe une séance dans le temps. « Imminente » couvre les 20 minutes qui
 * précèdent : c'est le moment où l'on sort son téléphone en salle des profs.
 */
export function situer(seance: Seance, maintenant: Date): SeanceSituee {
  const aujourdhui = jourIso(maintenant)
  const debut = minutes(seance.debut)
  const fin = minutes(seance.fin) ?? (debut === null ? null : debut + 55)
  const nowMin = maintenant.getHours() * 60 + maintenant.getMinutes()

  if (seance.date !== aujourdhui) {
    const passe = seance.date < aujourdhui
    return {
      ...seance,
      moment: 'autre_jour',
      minutesAvant: passe ? -1 : 1,
      aCloturer: passe && !REGLES.includes(seance.statut),
    }
  }

  if (debut === null) {
    return { ...seance, moment: 'a_venir', minutesAvant: 0, aCloturer: false }
  }

  const minutesAvant = debut - nowMin
  let moment: Moment
  if (fin !== null && nowMin >= fin) moment = 'passee'
  else if (nowMin >= debut) moment = 'en_cours'
  else if (minutesAvant <= 20) moment = 'imminente'
  else moment = 'a_venir'

  return {
    ...seance,
    moment,
    minutesAvant,
    aCloturer: moment === 'passee' && !REGLES.includes(seance.statut),
  }
}

export function situerToutes(seances: Seance[], maintenant: Date): SeanceSituee[] {
  return seances
    .map((s) => situer(s, maintenant))
    .sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut))
}

/** Formule courte : « dans 12 min », « commencé il y a 5 min », « terminé ». */
export function quand(s: SeanceSituee): string {
  if (s.moment === 'autre_jour') return ''
  if (s.moment === 'passee') return 'terminé'
  if (s.moment === 'en_cours') {
    const depuis = -s.minutesAvant
    return depuis < 1 ? 'commence maintenant' : `commencé il y a ${depuis} min`
  }
  if (s.minutesAvant <= 1) return 'commence maintenant'
  if (s.minutesAvant < 60) return `dans ${s.minutesAvant} min`
  const h = Math.floor(s.minutesAvant / 60)
  const m = s.minutesAvant % 60
  return m ? `dans ${h} h ${String(m).padStart(2, '0')}` : `dans ${h} h`
}

/** Salut du moment de la journée. */
export function salutation(d: Date): string {
  const h = d.getHours()
  if (h < 5) return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonne soirée'
}

export function dateLongue(d: Date): string {
  const s = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function mmss(secondes: number): string {
  const s = Math.max(0, Math.round(secondes))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
