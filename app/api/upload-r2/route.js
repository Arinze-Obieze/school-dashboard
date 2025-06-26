import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
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
    const key = `${userId}/user_photo`;
    const contentType = file.type || 'application/octet-stream';
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    const url = `${R2_PUBLIC_URL}/${userId}/user_photo`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error('Upload failed:', e);
    return NextResponse.json({ error: 'Upload failed', details: e.message }, { status: 500 });
  }
}
