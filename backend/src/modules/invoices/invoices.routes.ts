import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { invoiceService } from '../../services/invoice.service';
import { prisma } from '../../config/database';

const router = Router();
router.use(authenticate);

router.post('/generate/:orderId', requireRole('CLIENT_COORDINATOR', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const invoiceUrl = await invoiceService.generate(req.params.orderId);
    res.json({ success: true, data: { invoiceUrl } });
  } catch (e: unknown) {
    res.status(400).json({ success: false, error: (e as Error).message });
  }
});

router.get('/:orderId', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.orderId },
    select: { invoiceUrl: true, invoiceNumber: true },
  });
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

export default router;
