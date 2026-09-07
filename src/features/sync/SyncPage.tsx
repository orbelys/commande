import { useState, type FormEvent } from 'react'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useBridge } from '../../hooks/useBridge'
import { usePoste } from '../../hooks/usePoste'
import { depuis } from '../../lib/format'
import styles from './SyncPage.module.css'

export default function SyncPage() {
  const {
    status,
    snapshot,
    transportId,
    transportLibelle,
    authRequise,
    session,
    erreur,
    connecter,
    deconnecter,
    seDeconnecter,
    commandes,
  } = useBridge()

  const enAttente = commandes.filter(
    (c) => c.statut !== 'appliquee' && c.statut !== 'echouee',
  ).length
  const poste = usePoste()
  const capacites = snapshot?.capacites

  return (
    <>
      <PageHeader titre="Synchronisation" detail="État du lien avec la Suite PSE" />

      {erreur && (
        <Card>
          <p className={styles.erreur}>{erreur}</p>
        </Card>
      )}

      {authRequise && !session && <FormulaireConnexion />}

      <Card titre="Lien Electron">
        <dl className={styles.liste}>
          <Ligne label="Téléphone">
            <Badge ton={status === 'offline' ? 'neutre' : 'ok'}>
              {status === 'offline' ? 'Sans réseau' : 'En ligne'}
            </Badge>
          </Ligne>
          <Ligne label="Ordinateur">
            <Badge ton={poste.etat === 'actif' ? 'ok' : poste.etat === 'en_veille' ? 'attention' : 'neutre'}>
              {poste.libelle}
            </Badge>
          </Ligne>
          <Ligne label="Transport">{transportLibelle}</Ligne>
          {session && <Ligne label="Compte">{session.email}</Ligne>}
          <Ligne label="Poste">{snapshot?.poste ?? '—'}</Ligne>
          <Ligne label="Dernier instantané">{depuis(snapshot?.majA ?? null)}</Ligne>
          <Ligne label="Commandes en cours">{String(enAttente)}</Ligne>
        </dl>

        <div className={styles.actions}>
          {authRequise && session ? (
            <Button pleineLargeur onClick={() => void seDeconnecter()}>
              Se déconnecter du compte
            </Button>
          ) : (
            <>
              <Button
                variante="principal"
                pleineLargeur
                disabled={status !== 'offline'}
                onClick={connecter}
              >
                Se connecter
              </Button>
              <Button pleineLargeur disabled={status === 'offline'} onClick={deconnecter}>
                Se déconnecter
              </Button>
            </>
          )}
        </div>
      </Card>

      {capacites && (
        <Card titre="Ce que ce poste sait faire">
          <dl className={styles.liste}>
            <Ligne label="Projection en classe">
              <Badge ton={capacites.projection ? 'ok' : 'neutre'}>
                {capacites.projection ? 'Disponible' : 'Indisponible'}
              </Badge>
            </Ligne>
            <Ligne label="Progression">
              <Badge ton={capacites.progression ? 'ok' : 'neutre'}>
                {capacites.progression ? 'Disponible' : 'Indisponible'}
              </Badge>
            </Ligne>
            <Ligne label="Agenda du jour">
              <Badge ton={capacites.agenda ? 'ok' : 'neutre'}>
                {capacites.agenda ? 'Disponible' : 'Indisponible'}
              </Badge>
            </Ligne>
            <Ligne label="Actions">
              <Badge ton={capacites.actions ? 'ok' : 'neutre'}>
                {capacites.actions ? 'Disponible' : 'Indisponible'}
              </Badge>
            </Ligne>
          </dl>
          <p className={styles.note}>
            Les boutons du téléphone se désactivent tout seuls quand la fonction correspondante
            n’est pas disponible sur le poste.
          </p>
        </Card>
      )}

      <Card titre="À savoir">
        <p className={styles.note}>
          {transportId === 'mock'
            ? 'Le lien est actuellement simulé : l’interface fonctionne avec des données fictives, aucune donnée ne quitte ce navigateur. Pour passer en réel, renseignez .env.local et mettez VITE_TRANSPORT=firebase.'
            : 'Transport Firebase actif. Le téléphone lit l’instantané publié par le poste et lui envoie des commandes.'}
        </p>
        <p className={styles.note}>
          Aucun nom d’élève, aucune donnée de santé ni aucun aménagement ne transite par le
          téléphone. Les codes du publipostage circulent pour le pointage des absents : ils sont
          pseudonymes.
        </p>
        <p className={styles.note}>
          Le téléphone et l’ordinateur ne se parlent pas directement : ils passent tous les deux par
          Firebase. Ils n’ont donc jamais besoin d’être sur le même réseau. Si l’ordinateur est
          éteint, vos décisions sont mises en file et s’appliquent à son réveil ; si le téléphone
          n’a pas de réseau, elles patientent sur l’appareil, même application fermée.
        </p>
      </Card>
    </>
  )
}

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.ligne}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/** Connexion au compte partagé entre le téléphone et Electron. */
function FormulaireConnexion() {
  const { seConnecter } = useBridge()
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
    <Card titre="Connexion">
      <form onSubmit={envoyer} className={styles.form}>
        <label className={styles.champ}>
          <span>Adresse e-mail</span>
          <input
            type="email"
            autoComplete="username"
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
        {echec && <p className={styles.erreur}>{echec}</p>}
        <Button type="submit" variante="principal" pleineLargeur disabled={enCours}>
          {enCours ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
      <p className={styles.note}>
        Le même compte est utilisé par le téléphone et par la Suite PSE. Il n’est enregistré nulle
        part dans le code.
      </p>
    </Card>
  )
}
