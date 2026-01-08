import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Centralized Firebase Admin initialization
// This module should be imported by all other modules that need Firebase Admin services
// to ensure single initialization across the application

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
if (!base64) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set');
}

const serviceAccount = JSON.parse(
  Buffer.from(base64, 'base64').toString('utf-8')
);

// Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// Export initialized services
export const adminDb = getFirestore();
export const adminAuth = getAuth();
