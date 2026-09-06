import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { dateLongue, salutation } from '../../lib/seances'
import styles from './Hero.module.css'

/** En-tête du tableau de bord : l'heure, le jour, l'état du poste. */
export default function Hero() {
  const maintenant = useHorloge(30_000)
  const { snapshot, status } = useBridge()

  const heure = maintenant.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className={styles.hero}>
      <p className={styles.salut}>{salutation(maintenant)}</p>
      <p className={styles.date}>
        {dateLongue(maintenant)} · <span className={styles.heure}>{heure}</span>
      </p>
      <p className={styles.poste}>
        {status === 'online'
          ? `${snapshot?.poste ?? 'Poste'} · en ligne`
          : 'Ordinateur non connecté'}
      </p>
    </header>
  )
}
