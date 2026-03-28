import { z } from 'zod';
import { PrintTypeEnum } from './common.schema';

export const pricingTierSchema = z.object({
  id: z.string().cuid().optional(),
  minQuantity: z.number().int().positive(),
  maxQuantity: z.number().int().positive().nullable().optional(),
  pricePerUnit: z.number().positive(),
  actualCostPerUnit: z.number().positive(),
  deliveryCostFlat: z.number().nonnegative().default(0),
});

export const createServiceSchema = z.object({
  name: z.string().min(2),
  printType: PrintTypeEnum,
  description: z.string().optional(),
  pricingTiers: z.array(pricingTierSchema).min(1),
});

export const updateServiceSchema = createServiceSchema.partial();

export type PricingTierInput = z.infer<typeof pricingTierSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
