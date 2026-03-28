import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { capacityController } from './capacity.controller';

const router = Router();

router.use(authenticate);

router.get('/availability', capacityController.getAvailability);
router.get('/year', capacityController.list);
router.get('/:year/:month', capacityController.getMonthly);
router.post('/', requireRole('SUPER_ADMIN'), capacityController.upsert);

export default router;
