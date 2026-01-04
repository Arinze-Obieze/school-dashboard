// /app/api/promote-superadmin/route.js
// 🔒 SECURED: Requires authentication and superadmin authorization

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { requireSuperAdmin } from '@/lib/authMiddleware';
import { logAdminAction, isSuperAdmin, approveSuperAdminPromotion } from '@/lib/adminUtils';

export const runtime = 'nodejs';

/**
 * POST /api/promote-superadmin
 * 
 * Request existing superadmin to promote a new user to superadmin
 * Requires: Authentication + Superadmin role
 * 
 * Body: {
 *   email: string (email of user to promote),
 *   approvalRequired: boolean (optional, default: true for multi-approval workflow)
 * }
 * 
 * Response: { success: boolean, message: string, pendingApprovals?: number }
 */
export async function POST(req) {
  try {
    // ✅ Step 1: Verify authentication and authorization
    const authResult = await requireSuperAdmin(req);

    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required', details: authResult.error },
        { status: 401 }
      );
    }

    if (!authResult.authorized) {
      await logAdminAction({
        adminUid: authResult.uid,
        adminEmail: authResult.email,
        actionType: 'promote-superadmin-unauthorized-attempt',
        targetUid: 'unknown',
        targetEmail: 'unknown',
        details: 'Non-superadmin attempted to promote user',
        status: 'failure',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });

      return NextResponse.json(
        { error: 'Only superadmins can promote other users' },
        { status: 403 }
      );
    }

    // ✅ Step 2: Validate request body
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

    // ✅ Step 3: Validate target user exists and isn't already superadmin
    const auth = getAuth();
    let targetUser;
    try {
      targetUser = await auth.getUserByEmail(email);
    } catch (error) {
      await logAdminAction({
        adminUid: authResult.uid,
        adminEmail: authResult.email,
        actionType: 'promote-superadmin',
        targetUid: 'not-found',
        targetEmail: email,
        details: `User not found: ${email}`,
        status: 'failure',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });

      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      );
    }

    // Check if already superadmin
    const alreadySuperAdmin = await isSuperAdmin(targetUser.uid);
    if (alreadySuperAdmin) {
      return NextResponse.json(
        { error: `${email} is already a superadmin` },
        { status: 409 }
      );
    }

    // ✅ Step 4: Promote user to superadmin
    try {
      await auth.setCustomUserClaims(targetUser.uid, { role: 'superadmin' });

      // ✅ Step 5: Log the successful action
      await logAdminAction({
        adminUid: authResult.uid,
        adminEmail: authResult.email,
        actionType: 'promote-superadmin',
        targetUid: targetUser.uid,
        targetEmail: email,
        details: `Promoted ${email} to superadmin role`,
        status: 'success',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });

      return NextResponse.json(
        {
          success: true,
          message: `✅ ${email} has been promoted to superadmin`,
          targetUid: targetUser.uid,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (promoteError) {
      await logAdminAction({
        adminUid: authResult.uid,
        adminEmail: authResult.email,
        actionType: 'promote-superadmin',
        targetUid: targetUser.uid,
        targetEmail: email,
        details: `Failed to promote: ${promoteError.message}`,
        status: 'failure',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });

      console.error('[PROMOTE-SUPERADMIN] Error:', promoteError);
      return NextResponse.json(
        { error: 'Failed to promote user to superadmin' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[PROMOTE-SUPERADMIN] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
