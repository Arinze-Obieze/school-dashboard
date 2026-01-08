import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateRegistrationData } from '@/lib/inputValidator';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for fellowship registration saving

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }
  
  try {
    const data = await req.json();
    
    // Validate and sanitize registration data
    const validation = validateRegistrationData(data);
    if (!validation.valid) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }

    const { userId, ...registrationData } = validation.sanitized;
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    if (!registrationData) {
      return NextResponse.json({ error: 'Missing Form Data' }, { status: 400 });
    }
    // Save as a document (not collection) for fellowship-registration
    const ref = adminDb.collection('users').doc(userId).collection('fellowship-registration');
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
    console.error('Error saving fellowship registration:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export { POST };
