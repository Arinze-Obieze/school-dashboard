import { NextResponse } from 'next/server';
import { adminDb } from '@/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';
import {
  parsePaginationParams,
  formatPaginationResponse,
  formatErrorResponse,
  getTotalCount,
  extractFirestoreData,
} from '@/lib/paginationHelper';

const RATE_LIMIT = 20; // 20 requests per minute for payment fetching

async function GET(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    
    if (!userId) {
      return NextResponse.json(
        formatErrorResponse('User ID required', 400),
        { status: 400 }
      );
    }

    // Parse and validate pagination parameters
    const { page: pageNum, limit: limitNum, skip } = parsePaginationParams(
      page,
      limit,
      'payments'
    );

    // Build base query
    const baseQuery = adminDb
      .collection('payments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    // Get total count
    const total = await getTotalCount(baseQuery);

    // Fetch paginated data
    const paymentsSnapshot = await baseQuery
      .offset(skip)
      .limit(limitNum)
      .get();

    const payments = extractFirestoreData(paymentsSnapshot);

    const responseData = formatPaginationResponse(
      payments,
      pageNum,
      limitNum,
      total,
      { source: 'firestore', endpoint: 'payments/user' }
    );

    const response = NextResponse.json(responseData);
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
    
  } catch (error) {
    console.error('Error fetching user payments:', error);
    const responseData = formatErrorResponse(
      'Failed to fetch payments',
      500
    );
    return NextResponse.json(responseData, { status: 500 });
  }
}

export { GET };