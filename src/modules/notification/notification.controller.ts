import { Response } from 'express';
import { notificationService } from './notification.service';
import { AuthRequest } from '../../common/types/auth';
import { sseManager } from './sse/see.manager';

export class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await notificationService.getMyNotifications(
      userId,
      page,
      limit
    );

    res.status(200).json({
      list: result.data,
      totalCount: result.total,
    });
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const alarmId = req.params.alarmId as string;

    const notification = await notificationService.markAsRead(
      userId,
      alarmId
    );

    res.status(200).json(notification);
  }

  async stream(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;

    //SSE 헤더 설정
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    //연결 성공 메시지
    res.write(
      `data: ${JSON.stringify({ type: 'connected', message: '알림 연결 성공!' })}\n\n`
    );

    //SSE 매니저에 등록
    sseManager.addClient(userId, res);

    //클라이언트가 연결 끊으면 정리
    req.on('close', () => {
      sseManager.removeClient(userId, res);
    });
  }
}
