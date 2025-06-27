// firebaseAdmin.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';


const base64= process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
if (!base64) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set');
}
const serviceAccount = JSON.parse(
 Buffer.from(base64, 'base64').toString('utf-8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore();
