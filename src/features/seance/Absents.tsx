import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import type { Seance } from '../../services/bridge/types'
import styles from './Absents.module.css'

/**
 * Pointage des absents par code — jamais par nom.
 * Cours co-enseigné : on reçoit plusieurs membres (B1 AGORA 1 + 2). La liste
 * COMPLÈTE des codes des deux classes apparaît ; chaque code est enregistré
 * dans la séance de SA classe (une commande par classe).
 */
export default function Absents({ membres }: { membres: Seance[] }) {
  const { snapshot, envoyer, status } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const multi = membres.length > 1

  // { seanceId → { classeNom, codes[], absentsInitiaux[] } }
  const blocs = useMemo(
    () =>
      membres.map((m) => {
        const classe = snapshot?.classes.find((c) => c.id === m.classeId)
        return { seanceId: m.id, classeNom: m.classeNom, codes: classe?.codes ?? [], initiaux: m.absents }
      }),
    [membres, snapshot],
  )

  // brouillon par séance : null tant qu'on n'a pas touché cette classe
  const [brouillons, setBrouillons] = useState<Record<string, string[] | null>>({})
  const choisisDe = (seanceId: string, initiaux: string[]) => brouillons[seanceId] ?? initiaux

  const modifie = useMemo(
    () => blocs.some((b) => { const br = brouillons[b.seanceId]; return br != null && br.join(',') !== b.initiaux.join(',') }),
    [brouillons, blocs],
  )
  const totalCodes = blocs.reduce((n, b) => n + b.codes.length, 0)

  function basculer(seanceId: string, initiaux: string[], code: string) {
    setBrouillons((prec) => {
      const base = prec[seanceId] ?? initiaux
      const suivant = base.includes(code) ? base.filter((c) => c !== code) : [...base, code]
      return { ...prec, [seanceId]: suivant }
    })
  }

  function enregistrer() {
    blocs.forEach((b) => {
      const br = brouillons[b.seanceId]
      if (br != null && br.join(',') !== b.initiaux.join(',')) {
        envoyer('seance.absents', { seanceId: b.seanceId, codes: br.join(',') })
      }
    })
    setBrouillons({})
  }

  if (totalCodes === 0) {
    return (
      <p className={styles.absent}>
        Aucun code élève publié pour cette classe. Les codes viennent du fichier
        <code> codes_eleves_mapse </code> de la Suite PSE.
      </p>
    )
  }

  const totalAbsents = blocs.reduce((n, b) => n + choisisDe(b.seanceId, b.initiaux).length, 0)

  return (
    <>
      {blocs.map((b) => {
        const choisis = choisisDe(b.seanceId, b.initiaux)
        if (b.codes.length === 0) return null
        return (
          <div key={b.seanceId} className={multi ? styles.blocClasse : undefined}>
            {multi && <p className={styles.classeLabel}>{b.classeNom}</p>}
            <div className={styles.grille}>
              {b.codes.map((code) => {
                const actif = choisis.includes(code)
                return (
                  <button
                    key={code}
                    type="button"
                    className={`${styles.code} ${actif ? styles.absentActif : ''}`}
                    onClick={() => basculer(b.seanceId, b.initiaux, code)}
                    disabled={!dispo}
                    aria-pressed={actif}
                  >
                    {code}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <p className={styles.compte}>
        {totalAbsents === 0
          ? 'Personne de coché — tout le monde a eu son support.'
          : `${totalAbsents} absent${totalAbsents > 1 ? 's' : ''}${multi ? ' (les deux classes)' : ''}.`}
      </p>

      {modifie && (
        <div className={styles.duo}>
          <Button variante="doux" onClick={() => setBrouillons({})}>
            Annuler
          </Button>
          <Button variante="principal" disabled={!dispo} onClick={enregistrer}>
            Enregistrer
          </Button>
        </div>
      )}
    </>
  )
}
