import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import LoginScreen from '../../features/auth/LoginScreen'
import { useBridge } from '../../hooks/useBridge'
import styles from './AppShell.module.css'

/** Coque commune : barre haute, contenu de la page, navigation basse. */
export default function AppShell() {
  const { authRequise, session, status } = useBridge()

  // Tant qu'aucun compte n'est connecté, rien d'autre n'a de sens :
  // l'application n'a aucune donnée à montrer.
  if (authRequise && !session) {
    if (status === 'connecting') {
      return (
        <div className={styles.attente}>
          <p>Connexion…</p>
        </div>
      )
    }
    return <LoginScreen />
  }

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
