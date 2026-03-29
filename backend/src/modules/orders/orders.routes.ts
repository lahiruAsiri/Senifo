import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validateBody, validateQuery } from '../../middleware/validate';
import { createOrderSchema, updateOrderSchema, stageTransitionSchema, addOrderExpenseSchema as addExpenseSchema, listOrdersQuerySchema } from '../../schemas/order.schema';
import { auditLog } from '../../middleware/audit';

const router = Router();
router.use(authenticate);

router.get('/', validateQuery(listOrdersQuerySchema), ordersController.getAll);
router.post('/', requireRole('CLIENT_COORDINATOR'), validateBody(createOrderSchema), ordersController.create);
router.get('/:id', ordersController.getById);
router.put('/:id', requireRole('CLIENT_COORDINATOR'), validateBody(updateOrderSchema), ordersController.update);
router.delete('/:id', requireRole('SUPER_ADMIN'), auditLog('ORDER_DELETE', 'Order'), ordersController.delete);
router.put('/:id/stage', requireRole('CLIENT_COORDINATOR', 'DESIGNER', 'PRODUCTION', 'PAYMENT_MANAGER'), validateBody(stageTransitionSchema), auditLog('ORDER_STAGE_CHANGE', 'Order'), ordersController.transitionStage);
router.get('/:id/timeline', ordersController.getTimeline);
router.get('/:id/profit', requireRole('PAYMENT_MANAGER', 'SUPER_ADMIN'), ordersController.getProfit);
router.post('/:id/expenses', requireRole('PRODUCTION', 'PAYMENT_MANAGER'), validateBody(addExpenseSchema), ordersController.addExpense);

export default router;
