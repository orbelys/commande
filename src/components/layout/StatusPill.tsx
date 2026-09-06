import { Link } from 'react-router-dom'
import { useBridge } from '../../hooks/useBridge'
import styles from './StatusPill.module.css'

const LIBELLES = {
  offline: 'Electron : hors ligne',
  connecting: 'Electron : connexion...',
  online: 'Electron : connecté',
} as const

/** Indicateur d’état du lien avec Electron (simulé tant que le pont n’existe pas). */
export default function StatusPill() {
  const { status } = useBridge()

  return (
    <Link to="/synchronisation" className={`${styles.pastille} ${styles[status]}`}>
      <span className={styles.voyant} aria-hidden="true" />
      <span className={styles.texte}>{LIBELLES[status]}</span>
      <span className={styles.court} aria-hidden="true">
        {status === 'online' ? 'Connecté' : status === 'connecting' ? '…' : 'Hors ligne'}
      </span>
    </Link>
  )
}
