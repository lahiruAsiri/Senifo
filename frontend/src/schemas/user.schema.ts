import { z } from 'zod';
import { RoleEnum } from './common.schema';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: RoleEnum,
  phone: z.string().optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export const changeRoleSchema = z.object({
  role: RoleEnum,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
