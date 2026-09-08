import type { Seance } from '../services/bridge/types'

/**
 * Regroupe les séances SIMULTANÉES (même date + même créneau horaire) en un
 * seul bloc. Pour une seule enseignante, deux cours à la même heure sont
 * forcément co-enseignés (B1 AGORA 1 + 2, BT AGORA 1 + 2, B2 GATL 1 + 2…) :
 * on ne peut pas être à deux endroits. Un geste sur le bloc s'applique alors à
 * toutes ses classes membres.
 */
export type Groupe<T extends Seance = Seance> = {
  /** Identité stable du bloc : les ids des membres joints. */
  id: string
  membres: T[]
  /** Représentant (1er membre) pour l'affichage et le tri. */
  vedette: T
  /** « B1 AGORA 1 + 2 » ou le nom seul si une seule classe. */
  classesLabel: string
}

/** Libellé compact : préfixe commun + suffixes joints (« B1 AGORA 1 + 2 »). */
export function libelleClasses(membres: Seance[]): string {
  const noms = [...new Set(membres.map((m) => m.classeNom).filter(Boolean))]
  if (noms.length <= 1) return noms[0] ?? ''
  let p = noms[0]
  for (const n of noms) {
    let i = 0
    while (i < p.length && i < n.length && p[i] === n[i]) i++
    p = p.slice(0, i)
  }
  p = p.replace(/[\s·\-]+$/, '')
  if (p.length >= 2) {
    const tails = noms.map((n) => n.slice(p.length).replace(/^[\s·\-]+/, '')).filter(Boolean)
    if (tails.every(Boolean) && tails.length === noms.length) return `${p} ${tails.join(' + ')}`
  }
  return noms.join(' + ')
}

export function grouperSimultanees<T extends Seance>(seances: T[]): Groupe<T>[] {
  const parCreneau = new Map<string, T[]>()
  for (const s of seances) {
    const k = `${s.date}|${s.debut}|${s.fin}`
    const a = parCreneau.get(k)
    if (a) a.push(s)
    else parCreneau.set(k, [s])
  }
  return [...parCreneau.values()].map((membres) => ({
    id: membres.map((s) => s.id).join('~'),
    membres,
    vedette: membres[0],
    classesLabel: libelleClasses(membres),
  }))
}
