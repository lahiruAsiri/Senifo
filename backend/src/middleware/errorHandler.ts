import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error(`${req.method} ${req.path} — ${err.message}`, { stack: err.stack });

  // Never expose stack traces in production
  const isDev = env.NODE_ENV === 'development';

  if (res.headersSent) return;

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDev ? { message: err.message, stack: err.stack } : {}),
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
}
