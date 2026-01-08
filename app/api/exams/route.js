import { checkRateLimit } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';
import {
  parsePaginationParams,
  handleExternalPagination,
  buildExternalPaginationParams,
  formatErrorResponse,
} from '@/lib/paginationHelper';

const RATE_LIMIT = 15; // 15 requests per minute for exam fetching

export async function GET(request) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(request, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (!studentId) {
      return NextResponse.json(
        formatErrorResponse('studentId is required', 400),
        { status: 400 }
      );
    }

    // Parse pagination parameters
    const { page: pageNum, limit: limitNum } = parsePaginationParams(
      page,
      limit,
      'exams'
    );

    // Build external API params (adapt to API's pagination style)
    const paginationParams = buildExternalPaginationParams(
      pageNum,
      limitNum,
      'offset' // Adjust based on actual API pagination style
    );

    // Build API URL with pagination
    const params = new URLSearchParams({
      studentId,
      ...paginationParams,
    });
    const apiUrl = `https://api.waccps.org/quiz?${params.toString()}`;

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'authentication-key': process.env.WACCPS_API_KEY,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('External API error', {
        studentId,
        status: res.status,
        errorText,
        apiUrl,
      });

      const errorResponse = formatErrorResponse(
        'Failed to fetch exams',
        res.status
      );
      return NextResponse.json(errorResponse, { status: res.status });
    }

    const data = await res.json();

    // Adapt response to standardized format
    // Assuming API returns { quizzes: [...], total?: number }
    const exams = Array.isArray(data) ? data : data.quizzes || [];
    const total = data.total || data.totalCount || exams.length;

    const responseData = handleExternalPagination(
      exams,
      pageNum,
      limitNum,
      total
    );
    responseData.meta.apiUrl = apiUrl;

    const response = NextResponse.json(responseData);
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;

  } catch (error) {
    console.error('Error fetching exams:', error);
    const errorResponse = formatErrorResponse(
      error.message || 'Failed to fetch exams',
      500
    );
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
