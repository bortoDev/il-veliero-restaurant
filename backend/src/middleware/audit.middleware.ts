import { Request, Response, NextFunction } from 'express';
import { AuditLog, AuditStatus } from '../models/AuditLog';

// Keys to recursively redact from audit details
const REDACTED_KEYS = new Set([
  'password',
  'newpassword',
  'oldpassword',
  'confirmpassword',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'secret',
  'apikey',
  'creditcard',
  'cvv',
]);

/**
 * Recursively clone and sanitize object data to redact sensitive credentials.
 */
export function sanitizePayload(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizePayload(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

/**
 * Safely extracts client IP address across reverse proxies.
 */
export function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Infers target resource and action from request URL and HTTP method.
 */
export function inferActionAndResource(req: Request): {
  action: string;
  resource: string;
  resourceId?: string;
} {
  const pathParts = req.originalUrl.split('?')[0].split('/').filter(Boolean);
  const apiIndex = pathParts.indexOf('v1');
  const relevantParts = apiIndex !== -1 ? pathParts.slice(apiIndex + 1) : pathParts;

  let resource = relevantParts[0] || 'system';
  if (resource === 'admin' && relevantParts.length > 1) {
    resource = relevantParts[1];
  }

  let resourceId: string | undefined = req.params?.id || req.params?.token;
  if (!resourceId && relevantParts.length >= 2) {
    const lastPart = relevantParts[relevantParts.length - 1];
    if (lastPart !== resource && !['role', 'status', 'active', 'upcoming', 'me', 'login', 'logout', 'register'].includes(lastPart)) {
      resourceId = lastPart;
    }
  }

  // Action mapping
  let action = `${req.method}_${resource.toUpperCase()}`;
  if (resource === 'auth') {
    if (req.originalUrl.includes('/login')) action = 'AUTH_LOGIN';
    else if (req.originalUrl.includes('/logout-all')) action = 'GLOBAL_LOGOUT';
    else if (req.originalUrl.includes('/logout')) action = 'AUTH_LOGOUT';
    else if (req.originalUrl.includes('/emergency-recovery')) action = 'EMERGENCY_RECOVERY';
    else if (req.originalUrl.includes('/register')) action = 'AUTH_REGISTER';
  } else if (resource === 'users') {
    if (req.method === 'POST') action = 'CREATE_USER';
    else if ((req.method === 'PATCH' || req.method === 'PUT') && req.originalUrl.includes('/role')) action = 'UPDATE_USER_ROLE';
    else if ((req.method === 'PATCH' || req.method === 'PUT') && req.originalUrl.includes('/status')) action = 'UPDATE_USER_STATUS';
    else if (req.method === 'DELETE') action = 'DELETE_USER';
  } else if (resource === 'blacklist') {
    if (req.method === 'POST') action = 'REVOKE_TOKEN';
    else if (req.method === 'DELETE') action = 'REMOVE_FROM_BLACKLIST';
  } else if (resource === 'menu') {
    if (req.method === 'POST') action = 'CREATE_MENU_ITEM';
    else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE_MENU_ITEM';
    else if (req.method === 'DELETE') action = 'DELETE_MENU_ITEM';
  } else if (resource === 'info' || resource === 'info-locale') {
    if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE_INFO_LOCALE';
  } else if (resource === 'uploads') {
    if (req.method === 'POST') action = 'UPLOAD_MEDIA';
  }

  return { action, resource, resourceId };
}

/**
 * Express Middleware to automatically log state mutations and auth events to AuditLog collection.
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isLoginAttempt = req.originalUrl.includes('/api/v1/auth/login');

  // Only audit mutations or login attempts
  if (!isMutation && !isLoginAttempt) {
    return next();
  }

  // Ignore health checks
  if (req.originalUrl.includes('/api/v1/health')) {
    return next();
  }

  const startTime = Date.now();
  const rawBody = req.body ? sanitizePayload(req.body) : {};

  // Intercept response completion
  res.on('finish', async () => {
    try {
      const statusCode = res.statusCode;
      const status: AuditStatus = statusCode < 400 ? 'SUCCESS' : 'FAILURE';
      const { action: inferredAction, resource, resourceId: inferredResourceId } = inferActionAndResource(req);

      const action = (res.locals.auditAction as string) || inferredAction;
      const finalResource = (res.locals.auditResource as string) || resource;
      const finalResourceId =
        (res.locals.auditResourceId as string) || inferredResourceId || (req.params as any)?.id;

      // Extract User Context
      const user =
        res.locals.auditUser || req.user?._id || req.user?.id || undefined;
      const userEmail =
        res.locals.auditEmail ||
        req.user?.email ||
        (req.body?.email ? String(req.body.email).toLowerCase().trim() : undefined);
      const username =
        res.locals.auditUsername ||
        req.user?.username ||
        (req.body?.username ? String(req.body.username).toLowerCase().trim() : undefined);
      const identifier =
        req.body?.identifier || req.body?.targetIdentifier
          ? String(req.body.identifier || req.body.targetIdentifier).toLowerCase().trim()
          : undefined;
      const operator =
        res.locals.auditOperator ||
        res.locals.auditUsername ||
        res.locals.auditEmail ||
        req.user?.username ||
        req.user?.email ||
        username ||
        userEmail ||
        identifier ||
        'anonymous';
      const role = res.locals.auditRole || req.user?.role || 'anonymous';

      const ipAddress = extractClientIp(req);
      const userAgent = (req.headers['user-agent'] as string) || 'unknown';

      const details: Record<string, any> = {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        durationMs: Date.now() - startTime,
        params: req.params,
        query: req.query,
        body: rawBody,
      };

      if (res.locals.auditDetails) {
        Object.assign(details, sanitizePayload(res.locals.auditDetails));
      }

      await AuditLog.create({
        user,
        userEmail,
        username,
        operator,
        role,
        action,
        resource: finalResource,
        resourceId: finalResourceId,
        ipAddress,
        userAgent,
        details,
        status,
        timestamp: new Date(),
      });
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[AuditLog Error]: Failed to persist audit record:', err?.message || err);
      }
    }
  });

  next();
};

export default auditMiddleware;
