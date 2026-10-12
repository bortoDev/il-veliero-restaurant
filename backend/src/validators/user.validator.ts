import { z } from 'zod';
import { USER_ROLES } from '../models/User';
import { passwordPolicy } from './auth.validator';

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, 'User name is required').max(100),
    email: z.string().trim().email('Invalid email address').toLowerCase().optional(),
    username: z.string().trim().min(3, 'Username must be at least 3 characters long').max(30).toLowerCase().optional(),
    password: passwordPolicy,
    role: z.enum(USER_ROLES).optional().default('gestore'),
    isActive: z.boolean().optional().default(true),
    isMasterAdmin: z.boolean().optional().default(false),
  })
  .refine((data) => Boolean(data.email || data.username), {
    message: 'Either email or username is required',
    path: ['email'],
  });

export const updateRoleSchema = z.object({
  role: z.enum(USER_ROLES, {
    message: `Invalid role. Allowed: ${USER_ROLES.join(', ')}`,
  }),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({
    message: 'Field isActive is required and must be a boolean',
  }),
});

export const resetPasswordSchema = z.object({
  newPassword: passwordPolicy,
});
