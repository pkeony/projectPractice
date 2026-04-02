import { Router } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '../../common/middlewares/asyncHandler';

const authRouter = Router();
const authController = new AuthController();

//Auth 라우터 정의
authRouter.post('/signup', asyncHandler(authController.signup));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.post('/refresh', asyncHandler(authController.refresh));

export default authRouter;
