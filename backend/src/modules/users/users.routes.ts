import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validateBody } from '../../middleware/validate';
import { createUserSchema, updateUserSchema, changeRoleSchema } from '../../../../shared/schemas/user.schema';
import { auditLog } from '../../middleware/audit';

const router = Router();
router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/', usersController.getAll);
router.post('/', validateBody(createUserSchema), auditLog('USER_CREATE', 'User'), usersController.create);
router.get('/:id', usersController.getById);
router.put('/:id', validateBody(updateUserSchema), usersController.update);
router.delete('/:id', auditLog('USER_DELETE', 'User'), usersController.delete);
router.put('/:id/role', validateBody(changeRoleSchema), auditLog('ROLE_CHANGE', 'User'), usersController.changeRole);
router.put('/:id/activate', auditLog('USER_ACTIVATE', 'User'), usersController.activate);
router.put('/:id/deactivate', auditLog('USER_DEACTIVATE', 'User'), usersController.deactivate);

export default router;
