import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import { env } from './config/environment';
import { UPLOAD_DIR } from './middleware/upload.middleware';
import { errorHandler } from './middleware/error.middleware';
import { auditMiddleware } from './middleware/audit.middleware';
import { NotFoundError } from './utils/errors';
import apiRouter from './routes';

export const createApp = (): Express => {
  const app = express();

  // Ensure upload directory exists synchronously on app creation
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Security Headers: allow cross-origin image loads for Angular client
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS Configuration
  const clientOrigin = env.clientOrigin;
  const allowedOrigins = [
    clientOrigin,
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Supertest)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev/local
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logger (disabled during automated tests)
  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Serve static media uploads from /uploads
  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1d' }));

  // Audit Logging Middleware (records mutations & auth attempts)
  app.use(auditMiddleware);

  // API v1 Routers
  app.use('/api/v1', apiRouter);

  // 404 Handler for undefined routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
