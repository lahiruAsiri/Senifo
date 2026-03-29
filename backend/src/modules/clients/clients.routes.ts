import { Router } from 'express';
import { clientsController } from './clients.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validateBody } from '../../middleware/validate';
import { createClientSchema, updateClientSchema } from '../../schemas/client.schema';
import { auditLog } from '../../middleware/audit';

const router = Router();
router.use(authenticate);

router.get('/', requireRole('CLIENT_COORDINATOR', 'SUPER_ADMIN'), clientsController.getAll);
router.post('/', requireRole('CLIENT_COORDINATOR', 'SUPER_ADMIN'), validateBody(createClientSchema), auditLog('CLIENT_CREATE', 'Client'), clientsController.create);
router.get('/:id', requireRole('CLIENT_COORDINATOR', 'SUPER_ADMIN'), clientsController.getById);
router.put('/:id', requireRole('CLIENT_COORDINATOR', 'SUPER_ADMIN'), validateBody(updateClientSchema), auditLog('CLIENT_UPDATE', 'Client'), clientsController.update);
router.get('/:id/orders', requireRole('CLIENT_COORDINATOR', 'SUPER_ADMIN'), clientsController.getOrders);

export default router;
