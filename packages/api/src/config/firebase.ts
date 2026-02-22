import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const app = serviceAccount
  ? initializeApp({ credential: cert(serviceAccount as ServiceAccount) })
  : initializeApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
