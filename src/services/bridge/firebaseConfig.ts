/**
 * Configuration Firebase, lue dans les variables d'environnement.
 * Aucune valeur n'est écrite dans le code : elles vivent dans .env.local,
 * qui n'est pas versionné (voir .gitignore et .env.example).
 *
 * Rappel : les clés « Web » de Firebase sont publiques par conception.
 * La sécurité vient des règles Firestore (firestore.rules), pas du secret
 * de ces valeurs.
 */
export interface ConfigFirebase {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
  storageBucket?: string
  messagingSenderId?: string
}

export function lireConfigFirebase(): ConfigFirebase | null {
  const env = import.meta.env
  const apiKey = env.VITE_FIREBASE_API_KEY
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = env.VITE_FIREBASE_PROJECT_ID
  const appId = env.VITE_FIREBASE_APP_ID

  if (!apiKey || !authDomain || !projectId || !appId) return null

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  }
}

/** Emplacements des données, partagés avec le module Electron. */
export const CHEMINS = {
  /** Document unique par poste : l'instantané publié par Electron. */
  poste: (uid: string) => ['postes', uid] as const,
  /** File de commandes du téléphone vers Electron. */
  fileCommandes: (uid: string) => ['commandes', uid, 'file'] as const,
}
