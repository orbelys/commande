import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import type { Seance } from '../../services/bridge/types'
import styles from './Absents.module.css'

/**
 * Pointage des absents par code — jamais par nom.
 * Ce sont les mêmes codes que sur les documents distribués : il reste deux
 * copies dans la main, on touche les deux codes, c'est réglé.
 *
 * Un absent entre dans la dette de sa classe : la prochaine séance rappellera
 * qu'il n'a pas eu son support.
 */
export default function Absents({ seance }: { seance: Seance }) {
  const { snapshot, envoyer, status } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const classe = snapshot?.classes.find((c) => c.id === seance.classeId)
  const [brouillon, setBrouillon] = useState<string[] | null>(null)

  const codes = classe?.codes ?? []
  const choisis = brouillon ?? seance.absents
  const modifie = useMemo(
    () => brouillon !== null && brouillon.join(',') !== seance.absents.join(','),
    [brouillon, seance.absents],
  )

  if (codes.length === 0) {
    return (
      <p className={styles.absent}>
        Aucun code élève publié pour cette classe. Les codes viennent du fichier
        <code> codes_eleves_mapse </code> de la Suite PSE.
      </p>
    )
  }

  /* Mise à jour fonctionnelle : deux touches rapprochées sont regroupées par
     React, et un calcul fait sur une copie périmée perdait la première. */
  function basculer(code: string) {
    setBrouillon((precedent) => {
      const base = precedent ?? seance.absents
      return base.includes(code) ? base.filter((c) => c !== code) : [...base, code]
    })
  }

  return (
    <>
      <div className={styles.grille}>
        {codes.map((code) => {
          const actif = choisis.includes(code)
          return (
            <button
              key={code}
              type="button"
              className={`${styles.code} ${actif ? styles.absentActif : ''}`}
              onClick={() => basculer(code)}
              disabled={!dispo}
              aria-pressed={actif}
            >
              {code}
            </button>
          )
        })}
      </div>

      <p className={styles.compte}>
        {choisis.length === 0
          ? 'Personne de coché — tout le monde a eu son support.'
          : `${choisis.length} absent${choisis.length > 1 ? 's' : ''} : ${choisis.join(', ')}`}
      </p>

      {modifie && (
        <div className={styles.duo}>
          <Button variante="doux" onClick={() => setBrouillon(null)}>
            Annuler
          </Button>
          <Button
            variante="principal"
            disabled={!dispo}
            onClick={() => {
              envoyer('seance.absents', { seanceId: seance.id, codes: choisis.join(',') })
              setBrouillon(null)
            }}
          >
            Enregistrer
          </Button>
        </div>
      )}
    </>
  )
}
