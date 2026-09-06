import type { ReactNode } from 'react'
import styles from './ListRow.module.css'

interface Props {
  titre: string
  sousTitre?: string
  droite?: ReactNode
  actif?: boolean
  onClick?: () => void
}

/** Ligne de liste tactile (56 px mini), cliquable ou non. */
export default function ListRow({ titre, sousTitre, droite, actif, onClick }: Props) {
  const contenu = (
    <>
      <span className={styles.texte}>
        <span className={styles.titre}>{titre}</span>
        {sousTitre && <span className={styles.sousTitre}>{sousTitre}</span>}
      </span>
      {droite && <span className={styles.droite}>{droite}</span>}
    </>
  )

  if (!onClick) return <div className={styles.ligne}>{contenu}</div>

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.ligne} ${styles.cliquable} ${actif ? styles.actif : ''}`}
      aria-pressed={actif}
    >
      {contenu}
    </button>
  )
}
