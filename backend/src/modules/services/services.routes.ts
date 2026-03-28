import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { servicesController } from './services.controller';

const router = Router();

router.use(authenticate);

router.get('/', servicesController.list);
router.get('/:id', servicesController.getById);

// Admin only operations
router.post('/', requireRole('SUPER_ADMIN'), servicesController.create);
router.put('/:id', requireRole('SUPER_ADMIN'), servicesController.update);
router.delete('/:id', requireRole('SUPER_ADMIN'), servicesController.delete);

export default router;
