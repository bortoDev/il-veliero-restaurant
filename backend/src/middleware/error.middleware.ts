import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected internal error occurred';
  let details = err.details || [];

  // Handle Multer Errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      code = 'FILE_TOO_LARGE';
      message = 'File size exceeds maximum allowed limit (5MB)';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      code = 'UNEXPECTED_FIELD';
      message = `Unexpected upload field name: ${err.field}. Use 'image'.`;
    } else {
      code = 'UPLOAD_ERROR';
      message = `Upload error: ${err.message}`;
    }
  }

  // Handle Mongoose Validation Errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ID format for field '${err.path}'`;
    details = [{ field: err.path, value: err.value }];
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000 && err.keyPattern) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const fields = Object.keys(err.keyPattern).join(', ');
    message = `A resource with the specified ${fields} already exists`;
    details = [{ duplicateFields: fields }];
  }

  // Handle JSON Syntax Error in body
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Malformed JSON body';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Log unhandled server errors in non-test environment
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

export default errorHandler;
