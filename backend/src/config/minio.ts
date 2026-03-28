import * as Minio from 'minio';
import { env } from './env';

export const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export const BUCKETS = {
  ORDERS: 'senifo-orders',
  INVOICES: 'senifo-invoices',
  RECEIPTS: 'senifo-receipts',
  TICKETS: 'senifo-tickets',
  AVATARS: 'senifo-avatars',
} as const;

export async function ensureBucketsExist(): Promise<void> {
  for (const bucketName of Object.values(BUCKETS)) {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, env.MINIO_REGION);
      console.log(`✅ Created MinIO bucket: ${bucketName}`);
    }
  }
}

export function getPublicUrl(bucket: string, objectKey: string): string {
  const protocol = env.MINIO_USE_SSL ? 'https' : 'http';
  return `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${bucket}/${objectKey}`;
}
