import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User, IUser, USER_ROLES, UserRole } from '../models/User';
import { env } from '../config/environment';
import { BadRequestError, NotFoundError, ConflictError, ForbiddenError } from '../utils/errors';

/**
 * Checks if a user is a protected Master Admin account (Federico Bortolato & Sabina Mazzeracca).
 */
export function isMasterAdminUser(user: any): boolean {
  if (!user) return false;
  if (user.isMasterAdmin === true) return true;
  const normalizedEmail = user.email ? String(user.email).toLowerCase().trim() : '';
  if (normalizedEmail && env.masterAdminEmails.includes(normalizedEmail)) {
    return true;
  }
  return false;
}

/**
 * List users with filtering, search, and pagination.
 * GET /api/v1/admin/users
 */
export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, isActive, search, page = '1', limit = '50' } = req.query;

    const filter: Record<string, any> = {};

    if (role && USER_ROLES.includes(role as UserRole)) {
      filter.role = role;
    }

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = String(isActive) === 'true';
    }

    if (search) {
      const searchRegex = { $regex: String(search), $options: 'i' };
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { username: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-password')
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNum,
      totalPages,
      data: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        username: u.username,
        role: u.role,
        isMasterAdmin: Boolean(u.isMasterAdmin || (u.email && env.masterAdminEmails.includes(u.email.toLowerCase()))),
        isActive: u.isActive,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user account (client, gestore, admin).
 * POST /api/v1/admin/users
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, username, password, role = 'gestore', isActive = true, isMasterAdmin = false } =
      req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestError('User name is required');
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters long');
    }
    if (!USER_ROLES.includes(role as UserRole)) {
      throw new BadRequestError(`Invalid role: '${role}'. Allowed roles: ${USER_ROLES.join(', ')}`);
    }

    if (!email && !username) {
      throw new BadRequestError('A valid email address or username is required');
    }

    let normalizedEmail: string | undefined;
    if (email) {
      if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new BadRequestError('A valid email address is required');
      }
      normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        throw new ConflictError(`User with email '${normalizedEmail}' already exists`);
      }
    }

    let normalizedUsername: string | undefined;
    if (username) {
      if (typeof username !== 'string' || username.trim().length < 3) {
        throw new BadRequestError('Username must be at least 3 characters long');
      }
      normalizedUsername = username.toLowerCase().trim();
      const existingUsername = await User.findOne({ username: normalizedUsername });
      if (existingUsername) {
        throw new ConflictError(`User with username '${normalizedUsername}' already exists`);
      }
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password,
      role,
      isMasterAdmin: Boolean(isMasterAdmin),
      isActive: Boolean(isActive),
      tokenVersion: 0,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isMasterAdmin: Boolean(user.isMasterAdmin),
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve single user by ID.
 * GET /api/v1/admin/users/:id
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid User ID format: '${id}'`);
    }

    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isMasterAdmin: Boolean(user.isMasterAdmin || (user.email && env.masterAdminEmails.includes(user.email.toLowerCase()))),
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
 * Promote or demote user role.
 * PATCH /api/v1/admin/users/:id/role
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentAdminId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid User ID format: '${id}'`);
    }
    if (!role || !USER_ROLES.includes(role as UserRole)) {
      throw new BadRequestError(`Invalid role: '${role}'. Allowed roles: ${USER_ROLES.join(', ')}`);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    // Master Admin Immutability Protection
    if (isMasterAdminUser(user)) {
      throw new ForbiddenError('Non è consentito modificare o eliminare un Master Admin');
    }

    // Prevent self-demotion
    if (currentAdminId && currentAdminId.toString() === id.toString() && role !== 'admin') {
      throw new BadRequestError('Cannot demote your own administrator account');
    }

    const oldRole = user.role;
    user.role = role as UserRole;
    await user.save();

    res.locals.auditDetails = {
      userId: user._id.toString(),
      userEmail: user.email,
      username: user.username,
      oldRole,
      newRole: role,
    };

    res.status(200).json({
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isMasterAdmin: Boolean(user.isMasterAdmin),
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate or deactivate user account.
 * PATCH /api/v1/admin/users/:id/status
 */
export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const currentAdminId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid User ID format: '${id}'`);
    }
    if (typeof isActive !== 'boolean') {
      throw new BadRequestError('Field isActive must be a boolean (true or false)');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    // Master Admin Immutability Protection
    if (isMasterAdminUser(user)) {
      throw new ForbiddenError('Non è consentito modificare o eliminare un Master Admin');
    }

    // Prevent self-deactivation
    if (currentAdminId && currentAdminId.toString() === id.toString() && !isActive) {
      throw new BadRequestError('Cannot deactivate your own administrator account');
    }

    const oldStatus = user.isActive;
    user.isActive = isActive;
    await user.save();

    res.locals.auditDetails = {
      userId: user._id.toString(),
      userEmail: user.email,
      username: user.username,
      oldStatus,
      newStatus: isActive,
    };

    res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? 'activated' : 'deactivated'}`,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isMasterAdmin: Boolean(user.isMasterAdmin),
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user account.
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid User ID format: '${id}'`);
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    // Master Admin Immutability Protection
    if (isMasterAdminUser(user)) {
      throw new ForbiddenError('Non è consentito modificare o eliminare un Master Admin');
    }

    if (currentAdminId && currentAdminId.toString() === id.toString()) {
      throw new BadRequestError('Cannot delete your own administrator account');
    }

    await User.findByIdAndDelete(id);

    res.locals.auditDetails = {
      deletedUserId: id,
      deletedUserEmail: user.email,
      deletedUsername: user.username,
      deletedUserRole: user.role,
    };

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Reset Password for any user.
 * POST /api/v1/admin/users/:id/reset-password
 */
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const currentAdmin = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid User ID format: '${id}'`);
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new BadRequestError('La nuova password deve contenere almeno 6 caratteri');
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
      throw new NotFoundError(`Utente con ID '${id}' non trovato`);
    }

    // Only Master Admin can reset another Master Admin's password
    if (isMasterAdminUser(user) && !isMasterAdminUser(currentAdmin)) {
      throw new ForbiddenError('Solo un Master Admin può reimpostare la password di un account Master Admin');
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.locals.auditAction = 'ADMIN_RESET_PASSWORD';
    res.locals.auditResourceId = user._id.toString();
    res.locals.auditDetails = {
      targetUser: user.email || user.username,
      targetRole: user.role,
    };

    res.status(200).json({
      success: true,
      message: `Password reimpostata con successo per ${user.name || user.username}`,
    });
  } catch (error) {
    next(error);
  }
};

