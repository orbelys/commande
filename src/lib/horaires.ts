import { jourLocal } from './jours'

function heureValide(texte: string): string {
  const m = /^(\d{1,2})[:h.](\d{2})?$/.exec(texte.trim())
  if (!m || Number(m[1]) > 23 || Number(m[2] || 0) > 59) return ''
  return `${m[1].padStart(2, '0')}:${m[2] || '00'}`
}

/** Compatible aussi avec un ancien instantane encore dans le cache du mobile. */
export function lireHoraires(debut: string, fin: string) {
  const plage = String(debut || '').trim().split(/\s*(?:[-–—]|à)\s*/)
  return {
    debut: heureValide(plage[0]),
    fin: heureValide(fin || (plage.length === 2 ? plage[1] : '')),
  }
}

export function etatHoraire(date: string, debut: string, fin: string, maintenant: Date) {
  const aujourdHui = jourLocal(maintenant)
  const heure = String(maintenant.getHours()).padStart(2, '0') + ':' + String(maintenant.getMinutes()).padStart(2, '0')
  const plageValide = !!debut && !!fin && fin > debut
  return {
    passe: date < aujourdHui || (date === aujourdHui && plageValide && heure >= fin),
    actif: date === aujourdHui && plageValide && heure >= debut && heure < fin,
  }
}
