import { z } from 'zod';
import { PaymentTypeEnum } from './common.schema';

export const recordPaymentSchema = z.object({
  orderId: z.string().cuid(),
  amount: z.number().positive(),
  method: z.string().min(1),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
