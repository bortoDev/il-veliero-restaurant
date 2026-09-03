import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { jwtService } from '../services/jwt.service';
import { BadRequestError, NotFoundError } from '../utils/errors';

/**
 * List revoked tokens with filtering, search, and pagination.
 * GET /api/v1/admin/blacklist
 */
export const getBlacklistedTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (req.query.activeOnly === 'true') {
      filter.expiresAt = { $gt: new Date() };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
      filter.$or = [{ reason: searchRegex }, { token: searchRegex }];
    }

    const [total, items] = await Promise.all([
      TokenBlacklist.countDocuments(filter),
      TokenBlacklist.find(filter)
        .sort({ revokedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const formattedData = items.map((item) => {
      const now = Date.now();
      const expiresTime = new Date(item.expiresAt).getTime();
      const ttlRemainingSeconds = Math.max(0, Math.floor((expiresTime - now) / 1000));

      return {
        ...item,
        tokenSnippet:
          item.token.length > 20
            ? `${item.token.substring(0, 10)}...${item.token.substring(item.token.length - 6)}`
            : item.token,
        isExpired: expiresTime <= now,
        ttlRemainingSeconds,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedData.length,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manually add a token to the blacklist.
 * POST /api/v1/admin/blacklist
 */
export const blacklistToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, reason, expiresAt: customExpiresAt } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new BadRequestError('Token string is required');
    }

    const cleanToken = token.trim();
    let calculatedExpiresAt: Date;

    if (customExpiresAt) {
      calculatedExpiresAt = new Date(customExpiresAt);
    } else {
      calculatedExpiresAt = jwtService.getTokenExpirationDate(cleanToken);
    }

    const adminId = req.user?._id || req.user?.id || 'admin';

    const entry = await TokenBlacklist.findOneAndUpdate(
      { token: cleanToken },
      {
        token: cleanToken,
        expiresAt: calculatedExpiresAt,
        reason: reason?.trim() || 'admin_revocation',
        revokedAt: new Date(),
        revokedBy: adminId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Token successfully added to blacklist',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a token from the blacklist.
 * DELETE /api/v1/admin/blacklist/:token
 */
export const removeFromBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    if (!token) {
      throw new BadRequestError('Token parameter is required');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(token);
    const deleted = await TokenBlacklist.findOneAndDelete({
      $or: [{ token }, { _id: isObjectId ? token : null }],
    });

    if (!deleted) {
      throw new NotFoundError('Token is not present in the blacklist');
    }

    res.status(200).json({
      success: true,
      message: 'Token removed from blacklist successfully',
      data: {
        token: deleted.token,
        removedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
