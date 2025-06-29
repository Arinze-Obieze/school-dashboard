import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getR2Client, R2Config } from '@/lib/r2Client';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Collect all files
    const fileFields = [
      'degreeCertificates',
      'trainingCertificate',
      'workExperienceProof',
      'cpdCertificates',
      'passportPhoto',
    ];
    const s3 = getR2Client();
    const uploaded = {};
    for (const field of fileFields) {
      const file = formData.get(field);
      if (!file) continue;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const key = `${userId}/membership-registration/${field}-${Date.now()}-${file.name}`;
      const contentType = file.type || 'application/octet-stream';
      await s3.send(new PutObjectCommand({
        Bucket: R2Config.CLOUDFLARE_R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }));
      const url = `${R2Config.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
      uploaded[field] = url;
    }
    return NextResponse.json({ urls: uploaded });
  } catch (e) {
    console.error('Membership file upload failed:', e);
    return NextResponse.json({ error: 'Upload failed', details: e.message }, { status: 500 });
  }
}
