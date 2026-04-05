import { Router } from 'express';
import { UserController } from './user.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';
import { authMiddleware } from '../../common/middlewares/auth';
import { upload } from '../../common/lib/multer';

const userRouter = Router();
const userController = new UserController();

userRouter.post('/', asyncHandler(userController.signup));
userRouter.get('/me', authMiddleware, asyncHandler(userController.getMe));
userRouter.patch(
  '/me',
  authMiddleware,
  upload.single('image'),
  asyncHandler(userController.updateMe)
);
userRouter.get(
  '/me/likes',
  authMiddleware,
  asyncHandler(userController.getMyLikes)
);
userRouter.delete(
  '/delete',
  authMiddleware,
  asyncHandler(userController.deleteAccount)
);

export default userRouter;
