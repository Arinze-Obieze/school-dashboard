import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const RATE_LIMIT = 20; // 20 requests per minute for fetching registrations

async function GET(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

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
    const response = NextResponse.json({ exists: true, data: doc.data() });
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export { GET };
