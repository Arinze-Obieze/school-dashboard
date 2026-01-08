import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateFile } from '@/lib/fileValidator';
import { validateUserId } from '@/lib/inputValidator';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for file upload

async function POST(req) {
  // Apply rate limiting
  const rateLimitResult = await checkRateLimit(req, RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult;
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    
    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    // Validate and sanitize userId
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return NextResponse.json({ error: userIdValidation.error }, { status: 400 });
    }

    // Validate file type and size
    const validation = validateFile(file, { category: 'image', maxSize: 5 * 1024 * 1024 });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    // Use correct env variable names from .env.local
    const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET;
    const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) {
      console.error('Cloudflare R2 environment variables are missing:', {
        R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
      });
      return NextResponse.json({ error: 'Cloudflare R2 environment variables are missing.' }, { status: 500 });
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_JURISDICTION_SPECIFIC_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `${userIdValidation.sanitized}/user_photo`;
    const contentType = file.type || 'application/octet-stream';
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    const url = `${R2_PUBLIC_URL}/${userIdValidation.sanitized}/user_photo`;
    const response = NextResponse.json({ url });
    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (e) {
    console.error('Upload failed:', e);
    return NextResponse.json({ error: 'Upload failed', details: e.message }, { status: 500 });
  }
}

export { POST };
