import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import LoginScreen from '../../features/auth/LoginScreen'
import { useBridge } from '../../hooks/useBridge'
import styles from './AppShell.module.css'

/** Coque commune : barre haute, contenu de la page, navigation basse. */
export default function AppShell() {
  const { authRequise, session, status, commandes } = useBridge()
  const derniere = commandes[0]
  const alerte = derniere && ['echouee', 'sans_confirmation'].includes(derniere.statut) && Date.now() - Date.parse(derniere.creeeA) < 600_000
  const { pathname } = useLocation()

  /* Le navigateur restitue la position de défilement d'une page à l'autre :
     on ouvrait « Progression » au milieu de la liste. Chaque page commence
     en haut. */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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
          {alerte && <p role="alert" style={{ borderLeft: '3px solid #b42318', padding: '10px 12px', margin: '0 0 12px', overflowWrap: 'anywhere' }}>
            <strong>{derniere.libelle} : </strong>{derniere.erreur || 'Action non confirmée. Vérifie l’ordinateur.'}
          </p>}
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
