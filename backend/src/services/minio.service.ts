import { minioClient, BUCKETS } from '../config/minio';
import { env } from '../config/env';

export class MinioService {
  /**
   * Generates a presigned URL for uploading a file (PUT)
   * Valid for 15 minutes by default
   */
  async getPresignedPutUrl(bucket: string, objectKey: string, expiry: number = 15 * 60): Promise<string> {
    return minioClient.presignedPutUrl(bucket, objectKey, expiry);
  }

  /**
   * Generates a presigned URL for downloading/viewing a file (GET)
   * Valid for 1 hour by default
   */
  async getPresignedGetUrl(bucket: string, objectKey: string, expiry: number = 1 * 60 * 60): Promise<string> {
    return minioClient.presignedUrl('GET', bucket, objectKey, expiry);
  }

  /**
   * Deletes an object from a bucket
   */
  async deleteObject(bucket: string, objectKey: string): Promise<void> {
    await minioClient.removeObject(bucket, objectKey);
  }

  /**
   * Validates file metadata before presigning
   */
  validateFile(mimeType: string, sizeInBytes: number): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/zip'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(mimeType)) return false;
    if (sizeInBytes > maxSizeBytes) return false;

    return true;
  }
}

export const minioService = new MinioService();
