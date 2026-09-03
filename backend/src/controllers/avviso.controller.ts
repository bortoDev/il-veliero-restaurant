import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Avviso, IAvviso, AVVISO_SEVERITY, AvvisoSeverity } from '../models/Avviso';
import { BadRequestError, NotFoundError } from '../utils/errors';

/**
 * List active notices for the public banner.
 * GET /api/v1/avvisi/active
 */
export const getActiveAvvisi = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();

    const activeNotices = await Avviso.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
    })
      .sort({ severity: -1, startDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: activeNotices.length,
      data: activeNotices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all notices with filtering, search, and pagination.
 * GET /api/v1/avvisi
 */
export const getAllAvvisi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { severity, isActive, search, page, limit } = req.query;

    const filter: Record<string, any> = {};

    if (severity) {
      const cleanSev = String(severity).toLowerCase().trim();
      if (AVVISO_SEVERITY.includes(cleanSev as AvvisoSeverity)) {
        filter.severity = cleanSev;
      }
    }

    if (isActive !== undefined && isActive !== '') {
      filter.isActive = String(isActive) === 'true';
    }

    if (search) {
      const searchRegex = { $regex: String(search).trim(), $options: 'i' };
      filter.$or = [{ title: searchRegex }, { message: searchRegex }];
    }

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [total, items] = await Promise.all([
        Avviso.countDocuments(filter),
        Avviso.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
      ]);

      res.status(200).json({
        success: true,
        count: items.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: items,
      });
    } else {
      const items = await Avviso.find(filter).sort({ createdAt: -1 }).lean();

      res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve single notice by ID.
 * GET /api/v1/avvisi/:id
 */
export const getAvvisoById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Avviso ID: '${id}'`);
    }

    const item = await Avviso.findById(id).lean();
    if (!item) {
      throw new NotFoundError(`Notice with ID '${id}' not found`);
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new announcement notice / banner.
 * POST /api/v1/avvisi
 */
export const createAvviso = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, message, severity = 'info', startDate, endDate, isActive = true } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new BadRequestError('Notice title is required');
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new BadRequestError('Notice message is required');
    }

    const cleanSeverity = String(severity).toLowerCase().trim();
    if (!AVVISO_SEVERITY.includes(cleanSeverity as AvvisoSeverity)) {
      throw new BadRequestError(
        `Invalid severity: '${severity}'. Allowed values: ${AVVISO_SEVERITY.join(', ')}`
      );
    }

    let parsedStartDate = new Date();
    if (startDate) {
      const d = new Date(startDate);
      if (isNaN(d.getTime())) throw new BadRequestError('Invalid startDate format');
      parsedStartDate = d;
    }

    let parsedEndDate: Date | undefined;
    if (endDate) {
      const d = new Date(endDate);
      if (isNaN(d.getTime())) throw new BadRequestError('Invalid endDate format');
      if (d <= parsedStartDate) {
        throw new BadRequestError('endDate must be later than startDate');
      }
      parsedEndDate = d;
    }

    const notice = new Avviso({
      title: title.trim(),
      message: message.trim(),
      severity: cleanSeverity,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      isActive: Boolean(isActive),
    });

    await notice.save();

    res.locals.auditDetails = {
      avvisoId: notice._id.toString(),
      title: notice.title,
      severity: notice.severity,
      isActive: notice.isActive,
    };

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing notice.
 * PUT /api/v1/avvisi/:id or PATCH /api/v1/avvisi/:id
 */
export const updateAvviso = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Avviso ID: '${id}'`);
    }

    const notice = await Avviso.findById(id);
    if (!notice) {
      throw new NotFoundError(`Notice with ID '${id}' not found`);
    }

    const { title, message, severity, startDate, endDate, isActive } = req.body;

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        throw new BadRequestError('Notice title cannot be empty');
      }
      notice.title = title.trim();
    }

    if (message !== undefined) {
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new BadRequestError('Notice message cannot be empty');
      }
      notice.message = message.trim();
    }

    if (severity !== undefined) {
      const cleanSev = String(severity).toLowerCase().trim();
      if (!AVVISO_SEVERITY.includes(cleanSev as AvvisoSeverity)) {
        throw new BadRequestError(
          `Invalid severity: '${severity}'. Allowed values: ${AVVISO_SEVERITY.join(', ')}`
        );
      }
      notice.severity = cleanSev as AvvisoSeverity;
    }

    if (startDate !== undefined) {
      const d = new Date(startDate);
      if (isNaN(d.getTime())) throw new BadRequestError('Invalid startDate format');
      notice.startDate = d;
    }

    if (endDate !== undefined) {
      if (endDate === null || endDate === '') {
        notice.endDate = undefined;
      } else {
        const d = new Date(endDate);
        if (isNaN(d.getTime())) throw new BadRequestError('Invalid endDate format');
        if (d <= notice.startDate) {
          throw new BadRequestError('endDate must be later than startDate');
        }
        notice.endDate = d;
      }
    }

    if (isActive !== undefined) {
      notice.isActive = Boolean(isActive);
    }

    await notice.save();

    res.locals.auditDetails = {
      avvisoId: notice._id.toString(),
      title: notice.title,
      updatedFields: Object.keys(req.body),
    };

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notice.
 * DELETE /api/v1/avvisi/:id
 */
export const deleteAvviso = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError(`Invalid Avviso ID: '${id}'`);
    }

    const notice = await Avviso.findByIdAndDelete(id);
    if (!notice) {
      throw new NotFoundError(`Notice with ID '${id}' not found`);
    }

    res.locals.auditDetails = {
      deletedAvvisoId: id,
      deletedTitle: notice.title,
    };

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
      data: {
        id: notice._id.toString(),
        title: notice.title,
      },
    });
  } catch (error) {
    next(error);
  }
};
