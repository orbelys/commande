import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const ONGLETS = [
  { to: '/', icone: '⌂', libelle: 'Accueil', exact: true },
  { to: '/cours', icone: '▶', libelle: 'Cours', exact: false },
  { to: '/classes', icone: '☷', libelle: 'Classes', exact: false },
  { to: '/commandes', icone: '⇄', libelle: 'Commandes', exact: false },
  { to: '/synchronisation', icone: '⟳', libelle: 'Synchro', exact: false },
]

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      <div className={styles.largeur}>
        {ONGLETS.map((o) => (
          <NavLink
            key={o.to}
            to={o.to}
            end={o.exact}
            className={({ isActive }) => `${styles.onglet} ${isActive ? styles.actif : ''}`}
          >
            <span className={styles.icone} aria-hidden="true">{o.icone}</span>
            <span className={styles.libelle}>{o.libelle}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
