import { Emitter } from './emitter'
import { CHEMINS, lireConfigFirebase } from './firebaseConfig'
import type { Command, CommandStatus, Session, Snapshot, Transport, TransportEvent } from './types'

type Desabonnement = () => void

/**
 * Transport réel : Firebase Authentication + Firestore.
 *
 * Modèle d'échange :
 *   Electron  ──écrit──▶  postes/{uid}                   (instantané)
 *   téléphone ──écrit──▶  commandes/{uid}/file/{cmdId}   (commande)
 *   Electron  ──écrit──▶  la même commande, statut = appliquée
 *
 * L'identifiant de la commande fait office de clé d'idempotence :
 * Electron peut la recevoir deux fois sans l'appliquer deux fois.
 *
 * Le SDK est chargé dynamiquement : tant qu'on reste en simulation,
 * il n'est jamais téléchargé par le navigateur.
 */
export class FirebaseTransport implements Transport {
  readonly id = 'firebase'
  readonly libelle = 'Firebase'
  readonly authRequise = true

  private emitter = new Emitter()
  private off: Desabonnement[] = []
  private compte: Session | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sdk: any = null

  subscribe(listener: (event: TransportEvent) => void): () => void {
    return this.emitter.subscribe(listener)
  }

  session(): Session | null {
    return this.compte
  }

  connect(): void {
    void this.demarrer()
  }

  disconnect(): void {
    this.off.forEach((f) => f())
    this.off = []
    this.emitter.emit({ type: 'status', status: 'offline' })
  }

  async seConnecter(email: string, motDePasse: string): Promise<void> {
    const { auth, authMod } = await this.charger()
    try {
      await authMod.signInWithEmailAndPassword(auth, email, motDePasse)
    } catch (e) {
      throw new Error(messageErreur(e))
    }
  }

  async seDeconnecter(): Promise<void> {
    const { auth, authMod } = await this.charger()
    await authMod.signOut(auth)
    this.compte = null
    this.disconnect()
  }

  async send(command: Command): Promise<void> {
    if (!this.compte) {
      this.emitter.emit({
        type: 'command',
        id: command.id,
        statut: 'echouee',
        erreur: 'Non connecté',
      })
      return
    }
    try {
      const { db, fs } = await this.charger()
      const [c, uid, sous] = CHEMINS.fileCommandes(this.compte.uid)
      await fs.setDoc(fs.doc(db, c, uid, sous, command.id), {
        ...command,
        statut: 'envoyee' satisfies CommandStatus,
        owner: this.compte.uid,
        origine: 'telephone',
      })
      this.emitter.emit({ type: 'command', id: command.id, statut: 'envoyee' })
    } catch (e) {
      this.emitter.emit({
        type: 'command',
        id: command.id,
        statut: 'echouee',
        erreur: messageErreur(e),
      })
    }
  }

  /** Charge le SDK une seule fois et rend les objets utiles. */
  private async charger() {
    if (this.sdk) return this.sdk
    const config = lireConfigFirebase()
    if (!config) throw new Error('Firebase n’est pas configuré (voir .env.example).')

    const [appMod, authMod, fs] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ])
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(config)
    this.sdk = { app, auth: authMod.getAuth(app), authMod, db: fs.getFirestore(app), fs }
    return this.sdk
  }

  private async demarrer(): Promise<void> {
    this.emitter.emit({ type: 'status', status: 'connecting' })
    let sdk
    try {
      sdk = await this.charger()
    } catch (e) {
      this.emitter.emit({ type: 'erreur', message: messageErreur(e) })
      this.emitter.emit({ type: 'status', status: 'offline' })
      return
    }

    const { auth, authMod } = sdk
    this.off.push(
      authMod.onAuthStateChanged(auth, (user: { uid: string; email: string | null } | null) => {
        if (!user) {
          this.compte = null
          this.emitter.emit({ type: 'status', status: 'offline' })
          return
        }
        this.compte = { uid: user.uid, email: user.email ?? '' }
        this.ecouter(user.uid)
      }),
    )
  }

  /** Abonnements temps réel : instantané du poste + statut des commandes. */
  private async ecouter(uid: string): Promise<void> {
    const { db, fs } = await this.charger()

    const [pc, pid] = CHEMINS.poste(uid)
    this.off.push(
      fs.onSnapshot(
        fs.doc(db, pc, pid),
        (doc: { exists: () => boolean; data: () => Snapshot }) => {
          if (!doc.exists()) {
            this.emitter.emit({
              type: 'erreur',
              message: 'Connecté, mais aucun poste ne publie encore. Lancez la Suite PSE.',
            })
            return
          }
          this.emitter.emit({ type: 'snapshot', snapshot: doc.data() })
          this.emitter.emit({ type: 'status', status: 'online' })
        },
        (e: unknown) => this.emitter.emit({ type: 'erreur', message: messageErreur(e) }),
      ),
    )

    const [cc, cid, sous] = CHEMINS.fileCommandes(uid)
    this.off.push(
      fs.onSnapshot(
        fs.query(fs.collection(db, cc, cid, sous), fs.orderBy('creeeA', 'desc'), fs.limit(60)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (snap: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          snap.docChanges().forEach((ch: any) => {
            const d = ch.doc.data() as Command
            this.emitter.emit({
              type: 'command',
              id: d.id,
              statut: d.statut,
              erreur: d.erreur,
            })
          })
        },
      ),
    )
  }
}

function messageErreur(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password')
    return 'Adresse e-mail ou mot de passe incorrect.'
  if (code === 'auth/user-not-found') return 'Aucun compte pour cette adresse.'
  if (code === 'auth/network-request-failed') return 'Pas de réseau.'
  if (code === 'permission-denied') return 'Accès refusé par les règles Firestore.'
  return e instanceof Error ? e.message : String(e)
}
