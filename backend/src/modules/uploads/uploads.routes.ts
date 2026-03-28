import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { uploadsController } from './uploads.controller';

const router = Router();

router.use(authenticate);

router.post('/presigned-url', uploadsController.getPresignedUrl);
router.post('/confirm', uploadsController.confirmUpload);
router.delete('/', uploadsController.delete);

export default router;
