import { z } from 'zod';

export const RoleEnum = z.enum(['SUPER_ADMIN', 'CLIENT_COORDINATOR', 'DESIGNER', 'PRODUCTION', 'PAYMENT_MANAGER']);
export type Role = z.infer<typeof RoleEnum>;

export const OrderStatusEnum = z.enum([
  'PENDING', 'DESIGN_QUEUE', 'DESIGNING', 'DESIGN_REVIEW', 'DESIGN_APPROVED',
  'PRODUCTION_QUEUE', 'IN_PRODUCTION', 'PRODUCTION_REVIEW', 'QUALITY_CHECK',
  'PAYMENT_PENDING', 'PAYMENT_CLEARED', 'COMPLETED', 'CANCELLED'
]);
export type OrderStatus = z.infer<typeof OrderStatusEnum>;

export const TicketStatusEnum = z.enum(['OPEN', 'AWAITING_CLIENT', 'CLIENT_RESPONDED', 'RESOLVED', 'CLOSED']);
export type TicketStatus = z.infer<typeof TicketStatusEnum>;

export const TicketTypeEnum = z.enum(['DESIGN_APPROVAL', 'DESIGN_CHANGE', 'PRODUCTION_ISSUE', 'PAYMENT_QUERY', 'GENERAL']);
export type TicketType = z.infer<typeof TicketTypeEnum>;

export const PrintTypeEnum = z.enum(['SCREEN_PRINT', 'DTG', 'EMBROIDERY', 'VINYL', 'SUBLIMATION', 'HEAT_TRANSFER']);
export type PrintType = z.infer<typeof PrintTypeEnum>;

export const PaymentTypeEnum = z.enum(['INCOME', 'EXPENSE']);
export type PaymentType = z.infer<typeof PaymentTypeEnum>;
