import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { jwtService } from '../services/jwt.service';
import { env } from '../config/environment';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';

// Dummy bcrypt hash at cost 12 to guarantee constant-time execution on non-existent users
const DUMMY_PASSWORD_HASH = '$2a$12$e8vE5dJz2VqWqUv7IqGkQe9yF5vK7f9L1d2m3n4o5p6q7r8s9t0u1';

/**
 * Register a new client user.
 * POST /api/v1/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestError('User name is required');
    }
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new BadRequestError('Please provide a valid email address');
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'client',
      isActive: true,
      tokenVersion: 0,
    });

    await user.save();

    const token = jwtService.generateToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
      isMasterAdmin: user.isMasterAdmin,
      tokenVersion: user.tokenVersion || 0,
    });

    const refreshToken = jwtService.generateRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
    });

    res.locals.auditAction = 'AUTH_REGISTER';
    res.locals.auditRole = user.role;
    res.locals.auditUser = user._id.toString();
    res.locals.auditEmail = user.email;
    res.locals.auditUsername = user.username;
    res.locals.auditOperator = user.username || user.email || user.name;
    res.locals.auditResourceId = user._id.toString();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isMasterAdmin: Boolean(user.isMasterAdmin),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate user credentials (via Email or Username) and issue JWT token.
 * POST /api/v1/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, identifier, password } = req.body;
    const search = (identifier || email || username || '').toLowerCase().trim();

    if (!search || !password || typeof password !== 'string') {
      throw new BadRequestError('Email or username and password are required');
    }

    const user = await User.findOne({
      $or: [{ email: search }, { username: search }],
    }).select('+password');

    if (!user) {
      // Execute dummy bcrypt compare to ensure constant response time and prevent timing attacks
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated. Please contact an administrator.');
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedError(
        `Account temporaneamente bloccato per troppi tentativi falliti. Riprova tra ${minutesLeft} minuti.`
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts and trigger lockout if >= 5 attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }
      await user.save({ validateBeforeSave: false });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset failed login counter on success
    if (user.failedLoginAttempts && user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
    }

    // Update lastLogin without triggering validation hooks
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = jwtService.generateToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
      isMasterAdmin: user.isMasterAdmin,
      tokenVersion: user.tokenVersion || 0,
    });

    const refreshToken = jwtService.generateRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
    });

    res.locals.auditAction = 'AUTH_LOGIN';
    res.locals.auditRole = user.role;
    res.locals.auditUser = user._id.toString();
    res.locals.auditEmail = user.email;
    res.locals.auditUsername = user.username;
    res.locals.auditOperator = user.username || user.email || user.name;
    res.locals.auditResourceId = user._id.toString();

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        isMasterAdmin: Boolean(user.isMasterAdmin),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Invalidate current JWT session by adding to TokenBlacklist.
 * POST /api/v1/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.token || req.headers.authorization?.split(/\s+/)[1];

    if (!token) {
      throw new UnauthorizedError('Authorization token is required to logout');
    }

    const expiresAt = jwtService.getTokenExpirationDate(token);
    const userId = req.user?._id || req.user?.id || 'unknown';

    await TokenBlacklist.findOneAndUpdate(
      { token },
      {
        token,
        expiresAt,
        reason: 'user_logout',
        revokedAt: new Date(),
        revokedBy: userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.locals.auditAction = 'AUTH_LOGOUT';
    if (req.user) {
      res.locals.auditRole = req.user.role;
      res.locals.auditUser = req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : undefined);
      res.locals.auditEmail = req.user.email;
      res.locals.auditUsername = req.user.username;
      res.locals.auditOperator = req.user.username || req.user.email || req.user.name;
      res.locals.auditResourceId = res.locals.auditUser;
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Global Logout: invalidate all active JWT tokens across all devices for the current user.
 * POST /api/v1/auth/logout-all
 */
export const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentToken = req.token || req.headers.authorization?.split(/\s+/)[1];
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    // Blacklist the current token
    if (currentToken) {
      const expiresAt = jwtService.getTokenExpirationDate(currentToken);
      await TokenBlacklist.findOneAndUpdate(
        { token: currentToken },
        {
          token: currentToken,
          expiresAt,
          reason: 'global_logout',
          revokedAt: new Date(),
          revokedBy: userId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Atomically increment tokenVersion to invalidate all tokens issued before
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User associated with this session no longer exists');
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });

    res.locals.auditAction = 'GLOBAL_LOGOUT';
    res.locals.auditRole = user.role;
    res.locals.auditUser = user._id.toString();
    res.locals.auditEmail = user.email;
    res.locals.auditUsername = user.username;
    res.locals.auditOperator = user.username || user.email || user.name;
    res.locals.auditResourceId = user._id.toString();

    res.status(200).json({
      success: true,
      message: 'Tutte le sessioni attive sono state revocate con successo',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Master Emergency Recovery: force password reset and global session invalidation using secret key.
 * POST /api/v1/auth/emergency-recovery
 */
export const emergencyRecovery = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recoveryKey, emergencyKey, targetIdentifier, identifier, email, username, newPassword } =
      req.body;

    const key = (recoveryKey || emergencyKey || '').trim();
    if (!key || key !== env.masterEmergencyKey) {
      throw new UnauthorizedError('Chiave di recupero d\'emergenza non valida o non autorizzata');
    }

    const target = (targetIdentifier || identifier || email || username || '').toLowerCase().trim();
    if (!target) {
      throw new BadRequestError('È necessario specificare l\'email o lo username dell\'utente da recuperare');
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new BadRequestError('La nuova password deve essere lunga almeno 6 caratteri');
    }

    const user = await User.findOne({
      $or: [{ email: target }, { username: target }],
    }).select('+password');

    if (!user) {
      throw new NotFoundError('Utente specificato per il recupero non trovato');
    }

    // Reset password, increment tokenVersion (global logout), ensure active
    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.isActive = true;
    await user.save();

    res.locals.auditAction = 'EMERGENCY_RECOVERY';
    res.locals.auditRole = user.role;
    res.locals.auditUser = user._id.toString();
    res.locals.auditEmail = user.email;
    res.locals.auditUsername = user.username;
    res.locals.auditOperator = user.username || user.email || user.name;
    res.locals.auditResourceId = user._id.toString();
    res.locals.auditDetails = {
      target,
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion,
    };

    res.status(200).json({
      success: true,
      message: "Password reimpostata con successo d'emergenza",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current authenticated user profile.
 * GET /api/v1/auth/me
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const user = await User.findById(userId).select('-password');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        isMasterAdmin: Boolean(user.isMasterAdmin),
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password for currently authenticated user.
 * POST /api/v1/auth/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new UnauthorizedError('Utente non autenticato');
    }
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Password attuale e nuova password sono obbligatorie');
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new BadRequestError('La nuova password deve essere lunga almeno 6 caratteri');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('Utente non trovato');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError('La password attuale inserita non è corretta');
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    const token = jwtService.generateToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
      isMasterAdmin: user.isMasterAdmin,
      tokenVersion: user.tokenVersion || 0,
    });

    const refreshToken = jwtService.generateRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
    });

    res.locals.auditAction = 'PASSWORD_CHANGE';
    res.locals.auditRole = user.role;
    res.locals.auditUser = user._id.toString();
    res.locals.auditEmail = user.email;
    res.locals.auditUsername = user.username;
    res.locals.auditOperator = user.username || user.email || user.name;
    res.locals.auditResourceId = user._id.toString();

    res.status(200).json({
      success: true,
      message: 'Password modificata con successo',
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using a valid refresh token.
 * POST /api/v1/auth/refresh
 */
export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    let payload;
    try {
      payload = jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(payload.id);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or inactive');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    const newAccessToken = jwtService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
      isMasterAdmin: user.isMasterAdmin,
      tokenVersion: user.tokenVersion || 0,
    });

    const newRefreshToken = jwtService.generateRefreshToken({
      id: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
    });

    res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        isMasterAdmin: user.isMasterAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

