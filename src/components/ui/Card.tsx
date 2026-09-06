import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface Props {
  titre?: string
  action?: ReactNode
  children: ReactNode
  padding?: boolean
}

export default function Card({ titre, action, children, padding = true }: Props) {
  return (
    <section className={styles.carte}>
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
