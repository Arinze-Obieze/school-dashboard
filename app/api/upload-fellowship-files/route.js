import { getR2Client, R2Config } from '@/lib/r2Client';
import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateFile } from '@/lib/fileValidator';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // 10 requests per minute for file uploads

// File validation config per field
const FIELD_CONFIG = {
  mwccpsCertificate: { category: 'document', maxSize: 10 * 1024 * 1024 },
  trainingCertificates: { category: 'document', maxSize: 10 * 1024 * 1024 },
  employmentLetters: { category: 'document', maxSize: 10 * 1024 * 1024 },
  publishedPapers: { category: 'document', maxSize: 10 * 1024 * 1024 },
  conferenceCertificates: { category: 'document', maxSize: 10 * 1024 * 1024 },
  passportPhotos: { category: 'image', maxSize: 5 * 1024 * 1024 },
};

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
    const fileFields = Object.keys(FIELD_CONFIG);
    const s3 = getR2Client();
    const uploadedUrls = {};
    const validationErrors = [];

    for (const field of fileFields) {
      const file = formData.get(field);
      if (file && typeof file === 'object' && file.size > 0) {
        // Validate file before upload
        const config = FIELD_CONFIG[field];
        const validation = validateFile(file, { category: config.category, maxSize: config.maxSize });
        if (!validation.valid) {
          validationErrors.push(`${field}: ${validation.error}`);
          continue;
        }
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

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json({
        urls: uploadedUrls,
        validationErrors: validationErrors,
        warning: 'Some files failed validation and were not uploaded'
      });
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
