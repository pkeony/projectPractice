import { Router } from 'express';
import { UserController } from './user.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';

const userRouter = Router();
const userController = new UserController();

userRouter.get('/me', authMiddleware, asyncHandler(userController.getMe));
userRouter.patch('/me', authMiddleware, asyncHandler(userController.updateMe));
userRouter.patch(
  '/me/password',
  authMiddleware,
  asyncHandler(userController.updatePassword)
);

export default userRouter;
