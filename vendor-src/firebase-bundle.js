/** Paquet autonome pour les pages Electron en file://. */
export { initializeApp, getApps, getApp } from 'firebase/app'
export { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
export { getFirestore, doc, setDoc, updateDoc, collection, query, where, onSnapshot, runTransaction } from 'firebase/firestore'
