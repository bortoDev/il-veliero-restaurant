import rateLimit from 'express-rate-limit';
import { env } from '../config/environment';

/**
 * Strict rate limiter for sensitive authentication endpoints (e.g. POST /api/v1/auth/login).
 * Limits to 10 attempts per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Troppi tentativi di accesso. Riprova tra 15 minuti.',
    },
  },
});

/**
 * Extremely strict rate limiter for emergency recovery endpoint.
 * Limits to 5 attempts per 1 hour window per IP.
 */
export const emergencyRecoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Troppi tentativi di recupero d\'emergenza. Riprova più tardi.',
    },
  },
});

/**
 * General API rate limiter for public routes to protect against DoS.
 * Limits to 300 requests per 15 minutes per IP.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Troppe richieste al server. Riprova tra qualche minuto.',
    },
  },
});
