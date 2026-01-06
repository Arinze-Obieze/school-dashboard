import { checkRateLimit } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

const RATE_LIMIT = 15; // 15 requests per minute for exam fetching

async function GET(request) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(request, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return Response.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const apiUrl = `https://api.waccps.org/quiz?studentId=${studentId}`;

    const res = await fetch(apiUrl, {
      method: 'GET',
    headers: {
  'authentication-key': process.env.WACCPS_API_KEY
} 
   });

    if (!res.ok) {
  const errorText = await res.text();
console.error('External API error', {
  studentId,
  status: res.status,
  errorText,
  apiUrl
})

  return Response.json(
    { error: 'Failed to fetch exams', details: errorText },
    { status: res.status }
  );
}

    const data = await res.json();

    const response = Response.json(data);
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export { GET };
