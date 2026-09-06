/**
 * Source du paquet Firebase embarqué dans la Suite PSE.
 *
 * Les pages de l'application sont chargées en file:// : Chromium refuse alors
 * d'importer un module depuis Internet. On construit donc un fichier unique,
 * autonome, livré avec l'application (voir npm run build:vendor).
 *
 * On n'exporte que ce dont le pont a besoin.
 */
export { initializeApp, getApps, getApp } from 'firebase/app'
export {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
export {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
