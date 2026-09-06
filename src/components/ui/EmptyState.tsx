import styles from './EmptyState.module.css'

export default function EmptyState({ titre, detail }: { titre: string; detail?: string }) {
  return (
    <div className={styles.vide}>
      <p className={styles.titre}>{titre}</p>
      {detail && <p className={styles.detail}>{detail}</p>}
    </div>
  )
}
