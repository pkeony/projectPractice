import { Request, Response } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '../../common/types/auth';
import { validateUpdateUser } from './validators/user.validator';
import { validateSignUp } from '../auth/validators/auth.validator';
import { uploadToS3 } from '../../common/lib/s3';

const userService = new UserService();

export class UserController {
  async signup(req: Request, res: Response) {
    validateSignUp(req.body);

    const result = await userService.signup({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      type: req.body.type,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  async getMe(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    const user = await userService.getMe(userId);

    res.status(200).json(user);
  }

  async updateMe(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    validateUpdateUser(req.body);

    let imageUrl: string | undefined;
    if (req.file) {
      const uploaded = await uploadToS3(req.file.buffer, req.file.originalname);
      imageUrl = uploaded.url;
    } else if (req.body.image !== undefined) {
      imageUrl = req.body.image;
    }

    const updatedUser = await userService.updateMe(userId, {
      name: req.body.name,
      image: imageUrl,
      currentPassword: req.body.currentPassword,
      password: req.body.password,
    });

    res.status(200).json(updatedUser);
  }

  async getMyLikes(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    const likes = await userService.getMyLikes(userId);

    res.status(200).json(likes);
  }

  async deleteAccount(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    await userService.deleteAccount(userId);

    res.clearCookie('refreshToken');
    res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
  }
}
