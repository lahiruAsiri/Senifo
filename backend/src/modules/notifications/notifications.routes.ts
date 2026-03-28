import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { notificationsController } from './notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', notificationsController.list);
router.put('/:id/read', notificationsController.markRead);
router.put('/read-all', notificationsController.markAllRead);

export default router;
