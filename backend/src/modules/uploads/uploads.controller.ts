import { Request, Response, NextFunction } from 'express';
import { minioService } from '../../services/minio.service';
import { BUCKETS } from '../../config/minio';
import { prisma } from '../../config/database';

export class UploadsController {
  async getPresignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, fileType, category, entityId } = req.body;
      
      if (!fileName || !fileType || !category) {
        throw new Error('Missing required fields: fileName, fileType, category');
      }

      if (!minioService.validateFile(fileType, 0)) { // Size validation happens on client or after upload
        throw new Error('Invalid file type');
      }

      const bucketMap: Record<string, string> = {
        'ORDER': BUCKETS.ORDERS,
        'INVOICE': BUCKETS.INVOICES,
        'RECEIPT': BUCKETS.RECEIPTS,
        'TICKET': BUCKETS.TICKETS,
        'AVATAR': BUCKETS.AVATARS,
      };

      const bucket = bucketMap[category] || BUCKETS.ORDERS;
      const objectKey = `${Date.now()}-${fileName}`;
      
      const uploadUrl = await minioService.getPresignedPutUrl(bucket, objectKey);
      const downloadUrl = await minioService.getPresignedGetUrl(bucket, objectKey);

      res.json({
        success: true,
        data: {
          uploadUrl,
          downloadUrl,
          bucket,
          objectKey,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, url, bucket, objectKey, fileName, fileSize, mimeType, category } = req.body;
      
      const image = await prisma.orderImage.create({
        data: {
          orderId,
          url,
          bucket,
          objectKey,
          fileName,
          fileSize,
          mimeType,
          category,
          uploadedBy: req.user!.id,
        }
      });

      res.json({ success: true, data: image });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { bucket, objectKey } = req.body;
      await minioService.deleteObject(bucket, objectKey);
      res.json({ success: true, message: 'File deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadsController = new UploadsController();
