import { z } from 'zod';
import { TicketStatusEnum, TicketTypeEnum } from './common.schema';

export const createTicketSchema = z.object({
  orderId: z.string().cuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  type: TicketTypeEnum,
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedToId: z.string().cuid().optional(),
});

export const updateTicketSchema = z.object({
  status: TicketStatusEnum.optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().cuid().optional(),
});

export const addTicketCommentSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().default(false),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AddTicketCommentInput = z.infer<typeof addTicketCommentSchema>;
