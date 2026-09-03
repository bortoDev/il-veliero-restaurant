import { Request, Response, NextFunction } from 'express';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { User, IUser } from '../models/User';
import { jwtService, DecodedTokenPayload } from '../services/jwt.service';
import { UnauthorizedError } from '../utils/errors';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Authorization header is required');
    }

    const trimmedHeader = authHeader.trim();
    const parts = trimmedHeader.split(/\s+/);

    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedError("Authorization format must be 'Bearer <token>'");
    }

    const token = parts[1];
    if (!token || token.trim().length === 0) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    // 1. Check stateful blacklist collection
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    // 2. Cryptographic signature and expiration verification
    let decoded: DecodedTokenPayload;
    try {
      decoded = jwtService.verifyToken<DecodedTokenPayload>(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Authentication token has expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    // 3. Database user verification and active status assertion
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new UnauthorizedError('User associated with this token no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account has been deactivated');
    }

    // 4. Session version check for Global Logout / Invalidation
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== (user.tokenVersion || 0)) {
      throw new UnauthorizedError('Session has been revoked due to global logout or password change');
    }

    // 5. Attach authenticated user and raw token to request context
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAuth = authenticate;
export const authMiddleware = authenticate;
export default authenticate;
