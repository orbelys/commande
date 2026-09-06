import { NavLink } from 'react-router-dom'
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
        <span className={styles.droite}>
          <StatusPill />
          <NavLink
            to="/reglages"
            className={({ isActive }) => `${styles.reglages} ${isActive ? styles.actif : ''}`}
            aria-label="Réglages"
            title="Réglages"
          >
            <span aria-hidden="true">⚙</span>
          </NavLink>
        </span>
      </div>
    </header>
  )
}
