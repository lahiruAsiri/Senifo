import { prisma } from '../config/database';

export class NotificationService {
  /**
   * Creates a notification for a specific user
   */
  async createNotification(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    entityId?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        entityId: data.entityId,
      },
    });
  }

  /**
   * Broadcasts a notification to all users with a specific role
   */
  async notifyRole(role: string, data: { title: string; body: string; type: string; entityId?: string }) {
    const users = await prisma.user.findMany({
      where: { role: role as any, isActive: true },
      select: { id: true },
    });

    if (users.length === 0) return;

    return prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title: data.title,
        body: data.body,
        type: data.type,
        entityId: data.entityId,
      })),
    });
  }

  /**
   * Marks a notification as read
   */
  async markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
