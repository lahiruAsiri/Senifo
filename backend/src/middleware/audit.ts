import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export function auditLog(action: string, entityType: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // Only audit on successful responses
      if (res.statusCode < 400 && req.user) {
        const entityId =
          req.params.id ||
          (body as Record<string, unknown>)?.data?.id ||
          'unknown';

        prisma.auditLog
          .create({
            data: {
              userId: req.user.id,
              action,
              entityType,
              entityId: String(entityId),
              metadata: {
                method: req.method,
                path: req.path,
                body: req.body,
              },
              ipAddress: req.ip,
            },
          })
          .catch((err: unknown) => logger.error('Audit log error:', err));
      }
      return originalJson(body);
    };

    next();
  };
}
