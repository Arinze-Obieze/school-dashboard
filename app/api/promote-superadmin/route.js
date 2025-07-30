// /app/api/promote-superadmin/route.js

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
const serviceAccount = JSON.parse(
  Buffer.from(base64, 'base64').toString('utf-8')
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return new Response('Email is required', { status: 400 });
  }

  try {
    const auth = getAuth();
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { role: 'superadmin' });

    return new Response(`✅ ${email} is now a SuperAdmin`, { status: 200 });
  } catch (error) {
    return new Response(`❌ ${error.message}`, { status: 500 });
  }
}
