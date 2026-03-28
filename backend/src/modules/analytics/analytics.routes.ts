import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { analyticsController } from './analytics.controller';

const router = Router();

router.use(authenticate, requireRole('SUPER_ADMIN'));

router.get('/overview', analyticsController.getOverview);
router.get('/revenue', analyticsController.getRevenueStats);
router.get('/orders', analyticsController.getOrderDistribution);
router.get('/capacity', analyticsController.getCapacityUtilization);
router.get('/performance', analyticsController.getDesignerPerformance);

export default router;
