import { z } from 'zod';
import { OrderStatusEnum } from './common.schema';

export const createOrderSchema = z.object({
  clientId: z.string().cuid(),
  serviceId: z.string().cuid(),
  designerId: z.string().cuid().optional(),
  quantity: z.number().int().positive(),
  tshirtType: z.string().min(1),
  sizes: z.record(z.string(), z.number()),
  colors: z.array(z.string()),
  description: z.string().optional(),
  specialNotes: z.string().optional(),
  whatsappMsgId: z.string().optional(),
  sourceChannel: z.string().default('WHATSAPP'),
  unitPrice: z.number().positive(),
  totalAmount: z.number().positive(),
  discountAmount: z.number().min(0).default(0),
  expectedDelivery: z.string().datetime().optional(),
  estimatedDays: z.number().int().optional(),
});

export const updateOrderSchema = createOrderSchema.partial();

export const stageTransitionSchema = z.object({
  toStatus: OrderStatusEnum,
  notes: z.string().optional(),
  designerId: z.string().cuid().optional(),
  productionUserId: z.string().cuid().optional(),
});

export const addOrderExpenseSchema = z.object({
  stage: OrderStatusEnum,
  description: z.string().min(1),
  amount: z.number().positive(),
  receiptUrl: z.string().optional(),
});

export const listOrdersQuerySchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().default(20),
  status: z.preprocess(
    (val) => typeof val === 'string' ? val.split(',') : val,
    z.union([z.array(OrderStatusEnum), OrderStatusEnum]).optional()
  ),
  coordinatorId: z.string().optional(),
  designerId: z.string().optional(),
  clientId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type StageTransitionInput = z.infer<typeof stageTransitionSchema>;
export type AddOrderExpenseInput = z.infer<typeof addOrderExpenseSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
