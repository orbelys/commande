import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface Props {
  titre?: string
  action?: ReactNode
  children: ReactNode
  padding?: boolean
  /** Met la carte en avant : bordure teintée et ombre plus marquée. */
  accent?: 'live' | 'attention' | null
}

export default function Card({ titre, action, children, padding = true, accent = null }: Props) {
  const classes = [styles.carte, accent ? styles[accent] : ''].filter(Boolean).join(' ')
  return (
    <section className={classes}>
      {(titre || action) && (
        <header className={styles.entete}>
          {titre && <h2 className={styles.titre}>{titre}</h2>}
          {action}
        </header>
      )}
      <div className={padding ? styles.corps : undefined}>{children}</div>
    </section>
  )
}
