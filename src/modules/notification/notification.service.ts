import { NotificationRepository } from './notification.repository';
import { NotificationEntity } from './types/notification.types';
import { AppError } from '../../common/types/errors';
import { sseManager } from './sse/see.manager';

const notificationRepository = new NotificationRepository();

export class NotificationService {
  async getMyNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ data: NotificationEntity[]; total: number; unreadCount: number }> {
    const { notifications, total } = await notificationRepository.findByUserId(
      userId,
      page,
      limit
    );

    const unreadCount = await notificationRepository.countUnread(userId);

    return {
      data: notifications,
      total,
      unreadCount,
    };
  }

  async markAsRead(
    userId: string,
    notificationId: string
  ): Promise<NotificationEntity> {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new AppError(404, '알림을 찾을 수 없습니다.', 'Not Found');
    }

    if (notification.userId !== userId) {
      throw new AppError(
        403,
        '본인의 알림만 읽음 처리할 수 있습니다.',
        'Forbidden'
      );
    }

    const updated = await notificationRepository.markAsRead(notificationId);

    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await notificationRepository.markAllAsRead(userId);

    return { message: '모든 알림을 읽음 처리했습니다.' };
  }

  async sendNotification(
    userId: string,
    content: string,
    type: string
  ): Promise<NotificationEntity> {
    const notification = await notificationRepository.create({
      userId,
      content,
      type,
    });

    //SSE로 실시간 전송!
    sseManager.sendToUser(userId, {
      type: 'notification',
      data: notification,
    });

    return notification;
  }
}

//다른 모듈에서 사용할수 있기 싱글톤
export const notificationService = new NotificationService();
