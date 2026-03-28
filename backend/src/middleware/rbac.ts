import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // SUPER_ADMIN bypasses all role checks
    if (req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
