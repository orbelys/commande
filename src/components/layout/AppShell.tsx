import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import styles from './AppShell.module.css'

/** Coque commune : barre haute, contenu de la page, navigation basse. */
export default function AppShell() {
  return (
    <div className={styles.coque}>
      <TopBar />
      <main className={styles.contenu}>
        <div className={styles.largeur}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
