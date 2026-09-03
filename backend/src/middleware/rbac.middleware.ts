import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * RBAC Gatekeeper Middleware factory.
 * Enforces that req.user possesses at least one of the specified allowed roles.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required before role verification'));
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Forbidden: User role '${userRole}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireGestore = requireRole('gestore', 'admin');
export const requireClient = requireRole('client', 'gestore', 'admin');

export default requireRole;
