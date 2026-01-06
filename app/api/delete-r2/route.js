import { getR2Client, R2Config } from '@/lib/r2Client';
import { NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for file deletion

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const { url, userId } = await req.json();
    if (!url || !userId) {
      return NextResponse.json({ error: 'Missing url or userId' }, { status: 400 });
    }
    // Extract key from URL
    const publicPrefix = `${R2Config.CLOUDFLARE_R2_PUBLIC_URL}/`;
    if (!url.startsWith(publicPrefix)) {
      return NextResponse.json({ error: 'Invalid R2 URL' }, { status: 400 });
    }
    const key = url.replace(publicPrefix, '');
    const s3 = getR2Client();
    await s3.send(new DeleteObjectCommand({
      Bucket: R2Config.CLOUDFLARE_R2_BUCKET,
      Key: key,
    }));
    const response = NextResponse.json({ success: true });
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    console.error('Delete failed:', e);
    return NextResponse.json({ error: 'Delete failed', details: e.message }, { status: 500 });
  }
}

export { POST };
