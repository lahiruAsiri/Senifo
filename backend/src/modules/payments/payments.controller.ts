import { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service';
import { recordPaymentSchema } from '../../../../shared/schemas/payment.schema';

export class PaymentsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.query;
      const payments = await paymentsService.findAll(orderId as string);
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }

  async record(req: Request, res: Response, next: NextFunction) {
    try {
      const input = recordPaymentSchema.parse(req.body);
      const payment = await paymentsService.create(input, req.user!.id);
      res.json({ success: true, data: payment, message: 'Payment recorded successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentsController = new PaymentsController();
