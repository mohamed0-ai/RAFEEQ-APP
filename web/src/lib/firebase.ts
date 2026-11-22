import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_MOCK_KEY_FOR_LOCAL_DEV",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rafeeq-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rafeeq-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rafeeq-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Offline persistence (Firestore Spark friendly)
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    console.warn("Firestore offline persistence fallback:", e);
    db = initializeFirestore(app, {});
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = initializeFirestore(app, {});
}

export const googleProvider = new GoogleAuthProvider();
export { app, auth, db };
