import { useCallback, useEffect, useState } from 'react'

export type Theme = 'auto' | 'clair' | 'sombre'
const CLE = 'commande-theme'

function lire(): Theme {
  try {
    const v = localStorage.getItem(CLE)
    return v === 'clair' || v === 'sombre' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

function appliquer(theme: Theme): void {
  const racine = document.documentElement
  if (theme === 'auto') racine.removeAttribute('data-theme')
  else racine.setAttribute('data-theme', theme === 'sombre' ? 'dark' : 'light')
}

/** Choix clair / sombre / automatique, retenu sur cet appareil. */
export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(lire)

  useEffect(() => {
    appliquer(theme)
  }, [theme])

  const choisir = useCallback((t: Theme) => {
    setTheme(t)
    try {
      localStorage.setItem(CLE, t)
    } catch {
      // Navigation privée : le choix vaut pour cette session seulement.
    }
  }, [])

  return [theme, choisir]
}
