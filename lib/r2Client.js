// lib/r2Client.js
import { S3Client } from '@aws-sdk/client-s3';

const requiredVars = [
  'CLOUDFLARE_R2_ACCOUNT_ID',
  'CLOUDFLARE_R2_ACCESS_KEY_ID',
  'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
  'CLOUDFLARE_R2_BUCKET',
  'CLOUDFLARE_R2_PUBLIC_URL',
  'CLOUDFLARE_R2_JURISDICTION_SPECIFIC_ENDPOINT'
];

function getValidatedEnv() {
  const env = {};
  for (const v of requiredVars) {
    if (!process.env[v]) throw new Error(`Missing env var: ${v}`);
    env[v] = process.env[v];
  }
  return env;
}

const env = getValidatedEnv();

export function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: env.CLOUDFLARE_R2_JURISDICTION_SPECIFIC_ENDPOINT,
    credentials: {
      accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });
}

// Export validated env for use elsewhere (e.g., bucket name, public URL)
export const R2Config = env;
