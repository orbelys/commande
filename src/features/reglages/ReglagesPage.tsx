import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useBridge } from '../../hooks/useBridge'
import { useTheme, type Theme } from '../../hooks/useTheme'
import styles from './ReglagesPage.module.css'

const THEMES: { valeur: Theme; libelle: string }[] = [
  { valeur: 'auto', libelle: 'Automatique' },
  { valeur: 'clair', libelle: 'Clair' },
  { valeur: 'sombre', libelle: 'Sombre' },
]

export default function ReglagesPage() {
  const { session, status, snapshot, authRequise, seDeconnecter } = useBridge()
  const [theme, choisirTheme] = useTheme()
  const surIPhone = /iPhone|iPad/.test(navigator.userAgent)

  return (
    <>
      <PageHeader titre="Réglages" detail="Compte, affichage, installation" />

      <Card titre="Compte">
        {session ? (
          <>
            <p className={styles.valeur}>{session.email}</p>
            <p className={styles.detail}>
              Ce compte est le même que celui de la Suite PSE. Il est retenu sur cet appareil :
              vous n’aurez pas à le retaper à chaque fois.
            </p>
            <Button pleineLargeur className={styles.action} onClick={() => void seDeconnecter()}>
              Se déconnecter
            </Button>
          </>
        ) : (
          <p className={styles.detail}>
            {authRequise
              ? 'Aucun compte connecté. Rendez-vous dans l’onglet Synchro pour vous connecter.'
              : 'Mode simulation : aucun compte n’est nécessaire.'}
          </p>
        )}
      </Card>

      <Card titre="Affichage">
        <div className={styles.choix}>
          {THEMES.map((t) => (
            <Button
              key={t.valeur}
              variante={theme === t.valeur ? 'principal' : 'secondaire'}
              onClick={() => choisirTheme(t.valeur)}
            >
              {t.libelle}
            </Button>
          ))}
        </div>
        <p className={styles.detail}>
          « Automatique » suit le réglage de votre téléphone (clair le jour, sombre le soir).
        </p>
      </Card>

      <Card titre="Installer sur l’écran d’accueil">
        <p className={styles.detail}>
          {surIPhone
            ? 'Touchez le bouton Partager de Safari (le carré avec la flèche), puis « Sur l’écran d’accueil ». La télécommande s’ouvrira alors en plein écran, comme une application, sans la barre d’adresse.'
            : 'Sur iPhone : bouton Partager de Safari, puis « Sur l’écran d’accueil ». La télécommande s’ouvre alors en plein écran, comme une application.'}
        </p>
      </Card>

      <Card titre="État">
        <dl className={styles.liste}>
          <div className={styles.ligne}>
            <dt>Lien</dt>
            <dd>
              <Badge ton={status === 'online' ? 'ok' : status === 'connecting' ? 'attention' : 'neutre'}>
                {status === 'online' ? 'Connecté' : status === 'connecting' ? 'Connexion…' : 'Hors ligne'}
              </Badge>
            </dd>
          </div>
          <div className={styles.ligne}>
            <dt>Poste relié</dt>
            <dd>{snapshot?.poste ?? '—'}</dd>
          </div>
        </dl>
      </Card>
    </>
  )
}
