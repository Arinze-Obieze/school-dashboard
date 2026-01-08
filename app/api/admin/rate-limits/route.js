import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/authMiddleware';
import { adminResetRateLimit, adminClearAllRateLimits } from '@/lib/rateLimit';
import { adminDb } from '@/firebaseAdmin';

export const runtime = 'nodejs';

/**
 * GET /api/admin/rate-limits
 * Get rate limit violations and statistics
 */
async function GET(req) {
  // Require superadmin authentication
  const authResult = await requireSuperAdmin(req);
  if (!authResult.authenticated || !authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 100;

    // Get recent violations
    const violationsSnapshot = await adminDb
      .collection('rate-limit-violations')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const violations = [];
    violationsSnapshot.forEach(doc => {
      violations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Get statistics
    const stats = {
      totalViolations: violations.length,
      uniqueIdentifiers: new Set(violations.map(v => v.identifier)).size,
      violationsByEndpoint: {},
      violationsByReason: {}
    };

    violations.forEach(v => {
      stats.violationsByEndpoint[v.endpoint] = (stats.violationsByEndpoint[v.endpoint] || 0) + 1;
      stats.violationsByReason[v.reason] = (stats.violationsByReason[v.reason] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      violations,
      stats
    });

  } catch (error) {
    console.error('[ADMIN-RATE-LIMITS] Error fetching violations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate limit data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rate-limits
 * Manage rate limits (reset specific user/IP or clear all)
 */
async function POST(req) {
  // Require superadmin authentication
  const authResult = await requireSuperAdmin(req);
  if (!authResult.authenticated || !authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    const { action, identifier, endpoint } = await req.json();

    if (action === 'reset') {
      // Reset rate limit for specific identifier/endpoint
      if (!identifier) {
        return NextResponse.json(
          { error: 'Identifier required for reset action' },
          { status: 400 }
        );
      }

      await adminResetRateLimit(identifier, endpoint);

      return NextResponse.json({
        success: true,
        message: `Rate limit reset for ${identifier}${endpoint ? ` on ${endpoint}` : ''}`
      });

    } else if (action === 'clearAll') {
      // Clear all rate limits (use with caution)
      adminClearAllRateLimits();

      return NextResponse.json({
        success: true,
        message: 'All rate limits cleared'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "reset" or "clearAll"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('[ADMIN-RATE-LIMITS] Error managing rate limits:', error);
    return NextResponse.json(
      { error: 'Failed to manage rate limits' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/rate-limits
 * Delete old violation logs (cleanup)
 */
async function DELETE(req) {
  // Require superadmin authentication
  const authResult = await requireSuperAdmin(req);
  if (!authResult.authenticated || !authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const daysOld = parseInt(searchParams.get('daysOld')) || 30;

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    // Delete old violations
    const batch = adminDb.batch();
    const violationsSnapshot = await adminDb
      .collection('rate-limit-violations')
      .where('timestamp', '<', cutoffTime)
      .limit(500) // Batch delete limit
      .get();

    let deleteCount = 0;
    violationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleteCount} violation records older than ${daysOld} days`
    });

  } catch (error) {
    console.error('[ADMIN-RATE-LIMITS] Error deleting violations:', error);
    return NextResponse.json(
      { error: 'Failed to delete violation records' },
      { status: 500 }
    );
  }
}

export { GET, POST, DELETE };
