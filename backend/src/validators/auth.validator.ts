import { z } from 'zod';

export const passwordPolicy = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const loginSchema = z
  .object({
    email: z.string().trim().optional(),
    username: z.string().trim().optional(),
    identifier: z.string().trim().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => Boolean(data.email || data.username || data.identifier), {
    message: 'Email, username, or identifier is required',
    path: ['identifier'],
  });

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  username: z.string().trim().min(3, 'Username must be at least 3 characters long').max(30).toLowerCase().optional(),
  password: passwordPolicy,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordPolicy,
});

export const emergencyRecoverySchema = z
  .object({
    recoveryKey: z.string().trim().optional(),
    emergencyKey: z.string().trim().optional(),
    targetIdentifier: z.string().trim().optional(),
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
    username: z.string().trim().optional(),
    newPassword: passwordPolicy,
  })
  .refine((data) => Boolean(data.recoveryKey || data.emergencyKey), {
    message: 'Emergency recovery key is required',
    path: ['recoveryKey'],
  })
  .refine((data) => Boolean(data.targetIdentifier || data.identifier || data.email || data.username), {
    message: 'Target user identifier is required',
    path: ['targetIdentifier'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token is required'),
});
