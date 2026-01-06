import { getR2Client, R2Config } from '@/lib/r2Client';
import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for file uploads

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const formData = await req.formData();
    const userId = formData.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const fileFields = [
      'mwccpsCertificate',
      'trainingCertificates',
      'employmentLetters',
      'publishedPapers',
      'conferenceCertificates',
      'passportPhotos',
    ];
    const s3 = getR2Client();
    const uploadedUrls = {};
    for (const field of fileFields) {
      const file = formData.get(field);
      if (file && typeof file === 'object' && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const key = `${userId}/registration/fellowship-registration/${field}-${Date.now()}-${file.name}`;
        await s3.send(new PutObjectCommand({
          Bucket: R2Config.CLOUDFLARE_R2_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type || 'application/octet-stream',
        }));
        uploadedUrls[field] = `${R2Config.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
      }
    }
    const response = NextResponse.json({ urls: uploadedUrls });
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    console.error('Fellowship multi-file upload failed:', e);
    return NextResponse.json({ error: 'Upload failed', details: e.message }, { status: 500 });
  }
}

export { POST };
