import { adminAuth } from '@/firebaseAdmin';

/**
 * Extracts and verifies Firebase ID token from request
 * Supports: Authorization: Bearer <token> header
 * @param {Request} req - Next.js request object
 * @returns {Promise<Object>} { decodedToken, uid } or throws error if invalid
 */
export async function verifyAuthToken(req) {
  try {
    // Get token from Authorization header only (standard OAuth 2.0 approach)
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authentication token provided. Include: Authorization: Bearer <token>');
    }

    const idToken = authHeader.substring(7);

    if (!idToken) {
      throw new Error('Authentication token is empty');
    }

    // Verify token with Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    return {
      decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email,
      customClaims: decodedToken,
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export async function requireAuth(req) {
  try {
    const authData = await verifyAuthToken(req);
    return { authenticated: true, ...authData };
  } catch (error) {
    return {
      authenticated: false,
      error: error.message,
      statusCode: 401,
    };
  }
}

/**
 * Middleware to require superadmin role
 */
export async function requireSuperAdmin(req) {
  const authResult = await requireAuth(req);

  if (!authResult.authenticated) {
    return {
      authenticated: false,
      authorized: false,
      error: authResult.error,
      statusCode: 401,
    };
  }

  const isSuperAdmin = authResult.customClaims?.role === 'superadmin';

  if (!isSuperAdmin) {
    return {
      authenticated: true,
      authorized: false,
      error: 'Only superadmins can perform this action',
      statusCode: 403,
      uid: authResult.uid,
    };
  }

  return {
    authenticated: true,
    authorized: true,
    ...authResult,
  };
}

/**
 * Extracts userId from request (either from body or query params)
 */
export function extractUserIdFromRequest(req, body) {
  const urlParams = new URL(req.url).searchParams;
  return body?.userId || urlParams.get('userId');
}
