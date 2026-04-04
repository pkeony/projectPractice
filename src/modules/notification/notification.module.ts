import { Router, Request, Response } from 'express';
import { NotificationController } from './notification.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';
import jwt from 'jsonwebtoken';

const notificationRouter = Router();
const notificationController = new NotificationController();

//SSE 전용 인증(쿼리 파라미터 토큰)
const sseAuthMiddleware = (req: Request, res: Response, next: Function) => {
  const token =
    (req.query.token as string) || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: '인증이 필요합니다.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).user = { userId: decoded.userId, type: decoded.type };
    next();
  } catch {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

//SSE 스트림 (asyncHandler 안 씀 ! 응답이 끊기질 않음)
notificationRouter.get('/stream', sseAuthMiddleware, (req, res) => {
  notificationController.stream(req as any, res);
});

notificationRouter.get(
  '/',
  authMiddleware,
  asyncHandler(notificationController.getMyNotifications)
);

notificationRouter.patch(
  '/:notificationId/read',
  authMiddleware,
  asyncHandler(notificationController.markAsRead)
);

notificationRouter.patch(
  '/read-all',
  authMiddleware,
  asyncHandler(notificationController.markAllAsRead)
);

export default notificationRouter;
