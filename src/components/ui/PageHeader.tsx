import styles from './PageHeader.module.css'

export default function PageHeader({ titre, detail }: { titre: string; detail?: string }) {
  return (
    <header className={styles.entete}>
      <h1 className={styles.titre}>{titre}</h1>
      {detail && <p className={styles.detail}>{detail}</p>}
    </header>
  )
}
