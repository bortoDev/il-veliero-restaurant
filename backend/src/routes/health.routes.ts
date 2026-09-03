import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/environment';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const dbStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';
  const isHealthy = mongoose.connection.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'il-veliero-backend',
    version: '1.0.0',
    environment: env.nodeEnv,
    database: dbStatus,
  });
});

export default router;
