import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type Ton = 'neutre' | 'accent' | 'ok' | 'attention' | 'danger' | 'live'

export default function Badge({ ton = 'neutre', children }: { ton?: Ton; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[ton]}`}>{children}</span>
}
