import { Link } from 'react-router-dom'
import { usePoste } from '../../hooks/usePoste'
import styles from './StatusPill.module.css'

/**
 * État du lien, en deux temps : le réseau du téléphone, puis l'ordinateur.
 * Un instantané ancien ne prouve pas que l'ordinateur est en veille.
 */
export default function StatusPill() {
  const poste = usePoste()

  return (
    <Link to="/synchronisation" className={`${styles.pastille} ${styles[poste.etat]}`}>
      <span className={styles.voyant} aria-hidden="true" />
      <span className={styles.texte}>{poste.libelle}</span>
      <span className={styles.court} aria-hidden="true">
        {poste.libelleCourt}
      </span>
    </Link>
  )
}
