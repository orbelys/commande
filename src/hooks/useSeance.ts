import { useMemo } from 'react'
import { useBridge } from './useBridge'
import type { Classe, Cours, Seance } from '../services/bridge/types'

export interface SeanceCourante {
  seance: Seance | null
  cours: Cours | null
  classe: Classe | null
  progressionPct: number
}

/** Recompose la seance en cours a partir de l'instantané. */
export function useSeance(): SeanceCourante {
  const { snapshot } = useBridge()

  return useMemo(() => {
    const seance = snapshot?.seance ?? null
    if (!snapshot || !seance) {
      return { seance: null, cours: null, classe: null, progressionPct: 0 }
    }
    const cours = snapshot.cours.find((c) => c.id === seance.coursId) ?? null
    const classe = snapshot.classes.find((c) => c.id === seance.classeId) ?? null
    const pct = cours ? Math.round((seance.etape / cours.nbEtapes) * 100) : 0
    return { seance, cours, classe, progressionPct: pct }
  }, [snapshot])
}
