import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getR2Client, R2Config } from '@/lib/r2Client';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    const s3 = getR2Client();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `${userId}/user_photo`;
    const contentType = file.type || 'application/octet-stream';
    await s3.send(new PutObjectCommand({
      Bucket: R2Config.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    const url = `${R2Config.CLOUDFLARE_R2_PUBLIC_URL}/${userId}/user_photo`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error('Upload failed:', e);
    return NextResponse.json({ error: 'Upload failed', details: e.message }, { status: 500 });
  }
}
