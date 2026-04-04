import prisma from '../../common/database/prisma';
import { NotificationEntity } from './types/notification.types';

export class NotificationRepository {
  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: NotificationEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return { notifications: notifications as NotificationEntity[], total };
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isChecked: false },
    });
  }

  async create(data: {
    userId: string;
    content: string;
    type: string;
  }): Promise<NotificationEntity> {
    return prisma.notification.create({
      data: data as any,
    }) as Promise<NotificationEntity>;
  }

  async markAsRead(notificationId: string): Promise<NotificationEntity> {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isChecked: true },
    }) as Promise<NotificationEntity>;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isChecked: false },
      data: { isChecked: true },
    });
  }

  async findById(notificationId: string): Promise<NotificationEntity | null> {
    return prisma.notification.findUnique({
      where: { id: notificationId },
    }) as Promise<NotificationEntity | null>;
  }
}
