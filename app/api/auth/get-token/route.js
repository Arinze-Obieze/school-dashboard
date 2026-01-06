import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

// Initialize Firebase Admin if not already initialized
const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
if (!base64) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set');
}

const serviceAccount = JSON.parse(
  Buffer.from(base64, 'base64').toString('utf-8')
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const RATE_LIMIT = 10; // 10 requests per minute for token generation

/**
 * POST /api/auth/get-token
 * 
 * Generates a Firebase custom token for testing API endpoints
 * 
 * Request body:
 * {
 *   email: string (required - user's email to generate token for)
 * }
 * 
 * Response:
 * {
 *   token: string (custom token to use as Bearer token),
 *   uid: string,
 *   expiresIn: number (seconds),
 *   usage: string (how to use the token)
 * }
 */
async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const auth = getAuth();
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch (error) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      );
    }

    // Generate custom token (valid for 1 hour)
    const customToken = await auth.createCustomToken(user.uid, {
      role: user.customClaims?.role || 'user',
    });

    const response = NextResponse.json(
      {
        success: true,
        token: customToken,
        uid: user.uid,
        email: user.email,
        role: user.customClaims?.role || 'user',
        expiresIn: 3600,
        usage: `Add to API requests as: Authorization: Bearer ${customToken}`,
        example: `curl -H "Authorization: Bearer ${customToken}" http://localhost:3000/api/promote-superadmin`,
      },
      { status: 200 }
    );
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('[GET-TOKEN] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/get-token?email=user@example.com
 * 
 * Alternative GET method for token generation
 */
async function GET(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email query parameter is required: ?email=user@example.com' },
        { status: 400 }
      );
    }

    // Get user by email
    const auth = getAuth();
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch (error) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      );
    }

    // Generate custom token
    const customToken = await auth.createCustomToken(user.uid, {
      role: user.customClaims?.role || 'user',
    });

    const response = NextResponse.json(
      {
        success: true,
        token: customToken,
        uid: user.uid,
        email: user.email,
        role: user.customClaims?.role || 'user',
        expiresIn: 3600,
        usage: `Add to API requests as: Authorization: Bearer ${customToken}`,
      },
      { status: 200 }
    );
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (error) {
    console.error('[GET-TOKEN] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

export { POST, GET };
