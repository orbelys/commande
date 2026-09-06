import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variante = 'principal' | 'secondaire' | 'doux' | 'discret' | 'danger' | 'succes'
type Taille = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  taille?: Taille
  pleineLargeur?: boolean
  icone?: ReactNode
}

export default function Button({
  variante = 'secondaire',
  taille = 'md',
  pleineLargeur = false,
  icone,
  children,
  className,
  ...rest
}: Props) {
  const classes = [
    styles.btn,
    styles[variante],
    styles[taille],
    pleineLargeur ? styles.plein : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} {...rest}>
      {icone && <span className={styles.icone} aria-hidden="true">{icone}</span>}
      <span>{children}</span>
    </button>
  )
}
