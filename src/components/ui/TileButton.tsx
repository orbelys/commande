import { Link } from 'react-router-dom'
import styles from './TileButton.module.css'

interface Props {
  to: string
  icone: string
  titre: string
  detail?: string
}

/** Grosse tuile tactile du tableau de bord. */
export default function TileButton({ to, icone, titre, detail }: Props) {
  return (
    <Link to={to} className={styles.tuile}>
      <span className={styles.icone} aria-hidden="true">{icone}</span>
      <span className={styles.texte}>
        <span className={styles.titre}>{titre}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </span>
    </Link>
  )
}
