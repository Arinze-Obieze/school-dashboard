import { getR2Client, R2Config } from '@/lib/r2Client';
import { NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { checkRateLimit } from '@/lib/rateLimit';
import { requireAuth } from '@/lib/authMiddleware';
import { validateUrl } from '@/lib/inputValidator';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for file deletion

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
  const authenticatedUserId = authResult.uid;

  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // Validate URL
    const urlValidation = validateUrl(url, { 
      allowedProtocols: ['https:'],
      allowedDomains: [new URL(R2Config.CLOUDFLARE_R2_PUBLIC_URL).hostname]
    });
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }
    // Extract key from URL
    const publicPrefix = `${R2Config.CLOUDFLARE_R2_PUBLIC_URL}/`;
    if (!url.startsWith(publicPrefix)) {
      return NextResponse.json({ error: 'Invalid R2 URL' }, { status: 400 });
    }
    const key = url.replace(publicPrefix, '');

    // SECURITY: Verify user owns this file
    const expectedPrefix = `${authenticatedUserId}/`;
    if (!key.startsWith(expectedPrefix)) {
      console.warn(
        `[SECURITY] IDOR attempt: User ${authenticatedUserId} tried to delete ${key}`
      );
      return NextResponse.json(
        { error: 'Unauthorized: Cannot delete files belonging to other users' },
        { status: 403 }
      );
    }

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
