import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from './firebase-applet-config.json';

// ==========================================
// FIREBASE CONFIGURER
// Uses empty firebase-applet-config.json by default.
// Fill in firebase-applet-config.json with credentials from Firebase Console.
// ==========================================
const firebaseConfig = {
  apiKey: appletConfig.apiKey || "AIzaSyDummyKeyForSandboxSimulation_GenFlow",
  authDomain: appletConfig.authDomain || "genflow-sandbox-sim.firebaseapp.com",
  projectId: appletConfig.projectId || "genflow-sandbox-sim",
  storageBucket: appletConfig.storageBucket || "genflow-sandbox-sim.appspot.com",
  messagingSenderId: appletConfig.messagingSenderId || "123456789012",
  appId: appletConfig.appId || "1:123456789012:web:1234567890abcdef123456",
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || "(default)"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: Must specify database ID */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
};
export type { User };

// Test connection on boot as requested by Firebase guidelines
async function testConnection() {
  if (!appletConfig.apiKey) {
    console.warn("Firebase API Key is missing. Fill in /src/firebase-applet-config.json to connect your real database.");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration: Firebase client appears to be offline.");
    }
  }
}
testConnection().catch(() => {});

// ==========================================
// MANDATED SECURITY RULE ERROR HANDLER
// ==========================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Raised: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
