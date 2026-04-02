import { Response } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '../../common/types/auth';
import {
  validateUpdateUser,
  validateUpdatePassword,
} from './validators/user.validator';

const userService = new UserService();

export class UserController {
  async getMe(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    const user = await userService.getMe(userId);

    res.status(200).json(user);
  }

  async updateMe(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    validateUpdateUser(req.body);

    const updatedUser = await userService.updateMe(userId, {
      name: req.body.name,
      image: req.body.image,
      type: req.body.type,
    });

    res.status(200).json(updatedUser);
  }

  async updatePassword(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;

    validateUpdatePassword(req.body);

    const result = await userService.updatePassword(userId, {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    });

    res.status(200).json(result);
  }
}
