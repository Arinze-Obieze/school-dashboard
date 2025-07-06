import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const ref = adminDb.collection('users').doc(userId).collection('membership-registration');
    const snapshot = await ref.limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json({ exists: false });
    }
    const doc = snapshot.docs[0];
    return NextResponse.json({ exists: true, data: doc.data() });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
