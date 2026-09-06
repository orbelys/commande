import { useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import styles from './LoginScreen.module.css'

/**
 * Écran plein affiché tant qu'aucun compte n'est connecté.
 * Sans lui, le tableau de bord restait vide sans expliquer pourquoi.
 */
export default function LoginScreen() {
  const { seConnecter, erreur } = useBridge()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [echec, setEchec] = useState<string | null>(null)

  async function envoyer(e: FormEvent) {
    e.preventDefault()
    setEnCours(true)
    setEchec(null)
    try {
      await seConnecter(email.trim(), motDePasse)
    } catch (err) {
      setEchec(err instanceof Error ? err.message : String(err))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className={styles.ecran}>
      <form className={styles.carte} onSubmit={envoyer}>
        <div className={styles.marque}>
          <span className={styles.point} aria-hidden="true" />
          Commande
        </div>
        <h1 className={styles.titre}>Télécommande de la Suite PSE</h1>
        <p className={styles.intro}>
          Connectez-vous avec le compte utilisé par votre ordinateur. Vous ne le taperez qu’une
          fois sur cet appareil.
        </p>

        <label className={styles.champ}>
          <span>Adresse e-mail</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className={styles.champ}>
          <span>Mot de passe</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
        </label>

        {(echec ?? erreur) && <p className={styles.erreur}>{echec ?? erreur}</p>}

        <Button type="submit" variante="principal" taille="lg" pleineLargeur disabled={enCours}>
          {enCours ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </div>
  )
}
