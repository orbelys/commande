import type { Snapshot } from '../services/bridge/types'
import { decalerJour } from './jours'

export function lundiDe(iso: string): string {
  return decalerJour(iso, -((new Date(iso + 'T12:00:00').getDay() + 6) % 7))
}

export function datesAffichees(date: string, mode: 'jour' | 'semaine'): string[] {
  return mode === 'jour' ? [date] : Array.from({ length: 7 }, (_, i) => decalerJour(lundiDe(date), i))
}

/** Une journée non reçue ne doit pas être confondue avec une journée vide. */
export function evenementsDuJour(snapshot: Snapshot | null, date: string) {
  const lot = snapshot?.agenda?.jours.find(j => j.date === date)
  if (lot) return lot.evenements
  if (snapshot?.date === date) return snapshot.journee
  return null
}

export function bornesAgenda(snapshot: Snapshot | null) {
  if (!snapshot) return null
  return snapshot.agenda ? { debut: snapshot.agenda.debut, fin: snapshot.agenda.fin } : { debut: snapshot.date, fin: snapshot.date }
}

export function dateDansPeriode(date: string, bornes: ReturnType<typeof bornesAgenda>): boolean {
  return !!bornes && date >= bornes.debut && date <= bornes.fin
}
