import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notifications.service';

export class NotificationsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.findAll(req.user!.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
