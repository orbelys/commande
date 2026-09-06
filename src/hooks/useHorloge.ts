import { useEffect, useState } from 'react'

/**
 * Horloge partagée : rend l'heure courante et provoque un rendu à intervalle
 * régulier. C'est elle qui fait vivre les repères « en cours », « terminé »,
 * « dans 10 min » sans que l'on ait à recharger la page.
 */
export function useHorloge(intervalleMs = 30_000): Date {
  const [maintenant, setMaintenant] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setMaintenant(new Date()), intervalleMs)
    // Le téléphone met les minuteurs en sommeil quand l'écran s'éteint :
    // on se resynchronise dès qu'il revient.
    const reveil = () => setMaintenant(new Date())
    document.addEventListener('visibilitychange', reveil)
    window.addEventListener('focus', reveil)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', reveil)
      window.removeEventListener('focus', reveil)
    }
  }, [intervalleMs])

  return maintenant
}
