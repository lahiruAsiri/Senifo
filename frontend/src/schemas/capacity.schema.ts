import { z } from 'zod';

export const monthlyCapacitySchema = z.object({
  year: z.number().int().min(2024),
  month: z.number().int().min(1).max(12),
  maxUnits: z.number().int().positive(),
  maxOrders: z.number().int().positive(),
  notes: z.string().optional(),
});

export const updateCapacitySchema = monthlyCapacitySchema.partial();

export const availabilityQuerySchema = z.object({
  year: z.coerce.number().int(),
  month: z.coerce.number().int(),
});

export type MonthlyCapacityInput = z.infer<typeof monthlyCapacitySchema>;
export type UpdateCapacityInput = z.infer<typeof updateCapacitySchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
