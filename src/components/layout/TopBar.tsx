import StatusPill from './StatusPill'
import styles from './TopBar.module.css'

export default function TopBar() {
  return (
    <header className={styles.barre}>
      <div className={styles.largeur}>
        <span className={styles.marque}>
          <span className={styles.point} aria-hidden="true" />
          Commande
        </span>
        <StatusPill />
      </div>
    </header>
  )
}
