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
  private authOff: Desabonnement | null = null
  private generation = 0
  private generationEcoute = 0
  private reprise: ReturnType<typeof setTimeout> | null = null
  private echecsEcoute = 0
  private actif = false
  private enLigne = false
  private chargement: Promise<unknown> | null = null
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
    if (this.actif) return
    this.actif = true
    void this.demarrer(++this.generation)
  }

  disconnect(): void {
    this.actif = false
    this.generation++
    this.authOff?.()
    this.authOff = null
    this.nettoyerEcoutes()
    this.emitter.emit({ type: 'status', status: 'offline' })
  }

  private nettoyerEcoutes(): void {
    this.generationEcoute++
    if (this.reprise !== null) clearTimeout(this.reprise)
    this.reprise = null
    this.off.forEach((f) => f())
    this.off = []
    this.enLigne = false
  }

  async seConnecter(email: string, motDePasse: string): Promise<void> {
    this.connect()
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
    this.nettoyerEcoutes()
    this.emitter.emit({ type: 'status', status: 'offline' })
  }

  async send(command: Command): Promise<void> {
    if (!this.compte || !this.enLigne) {
      this.emitter.emit({
        type: 'command',
        id: command.id,
        statut: 'echouee',
        erreur: 'Connexion au serveur indisponible. Réessaie après reconnexion.',
      })
      return
    }
    try {
      const owner = this.compte.uid
      const { db, fs } = await this.charger()
      if (this.compte?.uid !== owner || !this.enLigne) throw new Error('Session interrompue')
      const [c, uid, sous] = CHEMINS.fileCommandes(owner)
      await fs.setDoc(fs.doc(db, c, uid, sous, command.id), {
        ...command,
        statut: 'envoyee' satisfies CommandStatus,
        owner,
        origine: 'telephone',
      })
      // L'abonnement fournit le statut serveur ; une écriture tardive ne doit
      // pas faire régresser une confirmation déjà reçue.
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
    if (!this.chargement) this.chargement = this.chargerUneFois().catch(e => {
      this.chargement = null
      throw e
    })
    await this.chargement
    return this.sdk
  }

  private async chargerUneFois() {
    const config = lireConfigFirebase()
    if (!config) throw new Error('Firebase n’est pas configuré (voir .env.example).')

    const [appMod, authMod, fs] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ])
    const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(config)

    // Le cache conserve les lectures. Une écriture déjà partie peut attendre
    // le réseau : Electron vérifie donc aussi sa date d'expiration.
    let db: unknown
    try {
      db = fs.initializeFirestore(app, {
        localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
      })
    } catch {
      db = fs.getFirestore(app)
    }

    this.sdk = { app, auth: authMod.getAuth(app), authMod, db, fs }
    return this.sdk
  }

  private async demarrer(generation: number): Promise<void> {
    this.emitter.emit({ type: 'status', status: 'connecting' })
    let sdk
    try {
      sdk = await this.charger()
    } catch (e) {
      if (generation !== this.generation) return
      this.actif = false
      this.emitter.emit({ type: 'erreur', message: messageErreur(e) })
      this.emitter.emit({ type: 'status', status: 'offline' })
      return
    }

    const { auth, authMod } = sdk
    if (!this.actif || generation !== this.generation) return
    this.authOff = authMod.onAuthStateChanged(auth, (user: { uid: string; email: string | null } | null) => {
        if (!this.actif || generation !== this.generation) return
        this.nettoyerEcoutes()
        this.echecsEcoute = 0
        if (!user) {
          this.compte = null
          this.emitter.emit({ type: 'status', status: 'offline' })
          return
        }
        this.compte = { uid: user.uid, email: user.email ?? '' }
        // Signale tout de suite la session retrouvée : sans cet événement,
        // l'application resterait sur l'écran de connexion en attendant le
        // premier instantané, qui peut ne jamais venir si le poste est éteint.
        this.emitter.emit({ type: 'status', status: 'connecting' })
        this.ecouter(user.uid, generation)
      })
  }

  /** Abonnements temps réel : instantané du poste + statut des commandes. */
  private ecouter(uid: string, generation: number): void {
    const { db, fs } = this.sdk
    const ecoute = ++this.generationEcoute
    const sessionCourante = () => this.actif && generation === this.generation && this.compte?.uid === uid
    const courant = () => sessionCourante() && ecoute === this.generationEcoute
    const erreur = (e: unknown) => {
      if (!courant()) return
      this.nettoyerEcoutes()
      this.emitter.emit({ type: 'status', status: 'offline' })
      this.emitter.emit({ type: 'erreur', message: messageErreur(e) })
      // Une erreur terminale detache l'ecoute Firebase ; la recreer avec delai borne.
      const delai = Math.min(60_000, 5_000 * 2 ** Math.min(this.echecsEcoute++, 4))
      this.reprise = setTimeout(() => {
        this.reprise = null
        if (sessionCourante()) this.ecouter(uid, generation)
      }, delai)
    }

    const [pc, pid] = CHEMINS.poste(uid)
    this.off.push(
      fs.onSnapshot(
        fs.doc(db, pc, pid),
        { includeMetadataChanges: true },
        (doc: { exists: () => boolean; data: () => Snapshot; metadata: { fromCache: boolean } }) => {
          if (!courant()) return
          this.enLigne = !doc.metadata.fromCache && doc.exists()
          if (this.enLigne) this.echecsEcoute = 0
          this.emitter.emit({ type: 'status', status: this.enLigne ? 'online' : 'offline' })
          if (!doc.exists()) {
            this.emitter.emit({
              type: 'erreur',
              message: 'Connecté, mais aucun poste ne publie encore. Lancez la Suite PSE.',
            })
            return
          }
          this.emitter.emit({ type: 'snapshot', snapshot: doc.data() })
        },
        erreur,
      ),
    )

    const [cc, cid, sous] = CHEMINS.fileCommandes(uid)
    this.off.push(
      fs.onSnapshot(
        fs.query(fs.collection(db, cc, cid, sous), fs.orderBy('creeeA', 'desc'), fs.limit(60)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (snap: any) => {
          if (!courant()) return
          const commandes: Command[] = []
          snap.forEach((d: any) => {
            const c = d.data()
            if (c.id === d.id && typeof c.creeeA === 'string' && typeof c.type === 'string' && c.statut)
              commandes.push(c as Command)
          })
          this.emitter.emit({ type: 'history', commandes })
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
        erreur,
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
