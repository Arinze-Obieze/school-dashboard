import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for registration saving

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }
  try {
    const data = await req.json();
    const { userId, ...registrationData } = data;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const ref = adminDb.collection('users').doc(userId).collection('primary-registration');
    const docRef = await ref.add({
      ...registrationData,
      createdAt: new Date().toISOString(),
    });
    const response = NextResponse.json({ success: true, docId: docRef.id });
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    console.error('Error saving primary registration:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export { POST };