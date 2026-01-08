import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';
import { requireAuth } from '@/lib/authMiddleware';
import { sanitizeObject } from '@/lib/inputValidator';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for registration saving

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  // Require authentication
  const authResult = await requireAuth(req);
  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Use authenticated user ID (trusted source)
  const userId = authResult.uid;
  
  try {
    const data = await req.json();
    
    // Sanitize registration data (remove userId if present in body)
    const registrationData = sanitizeObject(data, { maxDepth: 3 });
    delete registrationData.userId; // Ignore client-provided userId
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