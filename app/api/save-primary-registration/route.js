import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const data = await req.json();
    const { userId, ...registrationData } = data;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const ref = adminDb.collection('users').doc(userId).collection('membership-registration');
    const docRef = await ref.add({
      ...registrationData,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, docId: docRef.id });
  } catch (e) {
    console.error('Error saving membership registration:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
