import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';

export const uploadMediaFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded. Please attach an image in the "image" form field.');
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};
