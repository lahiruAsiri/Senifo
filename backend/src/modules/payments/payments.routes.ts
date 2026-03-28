import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { paymentsController } from './payments.controller';

const router = Router();

router.use(authenticate);

router.get('/', paymentsController.list);
router.post('/', requireRole('PAYMENT_MANAGER', 'SUPER_ADMIN'), paymentsController.record);

export default router;
