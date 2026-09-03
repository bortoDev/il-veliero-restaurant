import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuditLog, IAuditLog } from '../models/AuditLog';
import { BadRequestError, NotFoundError } from '../utils/errors';

/**
 * List and filter audit logs with pagination and multi-criteria queries.
 * GET /api/v1/admin/audit-logs
 */
export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      action,
      user,
      userEmail,
      username,
      operator,
      role,
      status,
      resource,
      startDate,
      endDate,
      page = '1',
      limit = '50',
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query;

    const filter: Record<string, any> = {};

    if (action) {
      filter.action = { $regex: String(action), $options: 'i' };
    }

    if (operator) {
      const opRegex = { $regex: String(operator), $options: 'i' };
      filter.$or = [{ operator: opRegex }, { userEmail: opRegex }, { username: opRegex }];
    }

    if (username) {
      filter.username = { $regex: String(username), $options: 'i' };
    }

    if (user) {
      const userStr = String(user).trim();
      if (mongoose.Types.ObjectId.isValid(userStr) && userStr.length === 24) {
        filter.user = new mongoose.Types.ObjectId(userStr);
      } else {
        const userRegex = { $regex: userStr, $options: 'i' };
        filter.$or = [{ userEmail: userRegex }, { username: userRegex }, { operator: userRegex }];
      }
    }

    if (userEmail) {
      filter.userEmail = { $regex: String(userEmail), $options: 'i' };
    }

    if (role) {
      filter.role = String(role).toLowerCase();
    }

    if (status) {
      const upperStatus = String(status).toUpperCase();
      if (['SUCCESS', 'FAILURE'].includes(upperStatus)) {
        filter.status = upperStatus;
      }
    }

    if (resource) {
      filter.resource = String(resource).toLowerCase();
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        const start = new Date(String(startDate));
        if (isNaN(start.getTime())) throw new BadRequestError('Invalid startDate format');
        filter.timestamp.$gte = start;
      }
      if (endDate) {
        const end = new Date(String(endDate));
        if (isNaN(end.getTime())) throw new BadRequestError('Invalid endDate format');
        filter.timestamp.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [String(sortBy)]: sortDirection };

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      totalPages,
      data: logs.map((doc) => ({
        id: doc._id.toString(),
        user: doc.user?.toString(),
        userEmail: doc.userEmail,
        username: doc.username,
        operator: doc.operator || doc.userEmail || doc.username || 'anonymous',
        role: doc.role,
        action: doc.action,
        resource: doc.resource,
        resourceId: doc.resourceId,
        ipAddress: doc.ipAddress,
        userAgent: doc.userAgent,
        details: doc.details,
        status: doc.status,
        timestamp: doc.timestamp,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve single audit log entry by ID.
 * GET /api/v1/admin/audit-logs/:id
 */
export const getAuditLogById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid AuditLog ID format: '${id}'`);
    }

    const log = await AuditLog.findById(id).lean();
    if (!log) {
      throw new NotFoundError(`Audit log entry with ID '${id}' not found`);
    }

    res.status(200).json({
      success: true,
      data: {
        id: log._id.toString(),
        user: log.user?.toString(),
        userEmail: log.userEmail,
        username: log.username,
        operator: log.operator || log.userEmail || log.username || 'anonymous',
        role: log.role,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        details: log.details,
        status: log.status,
        timestamp: log.timestamp,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
