import { UserRepository } from './user.repository';
import { AppError } from '../../common/types/errors';
import { UserType } from '@prisma/client';
import { hashPassword, comparePassword } from '../../common/lib/password';
import { generateTokens } from '../../common/lib/jwt';
import { AuthRepository } from '../auth/auth.repository';
import { ErrorMessages } from '../../common/types/errors';

const userRepository = new UserRepository();
const authRepository = new AuthRepository();

export class UserService {
  async signup(signUpDto: {
    email: string;
    password: string;
    name: string;
    type: string;
  }) {
    const existingUser = await authRepository.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new AppError(409, ErrorMessages.USER_ALREADY_EXISTS, 'Conflict');
    }

    const hashedPassword = await hashPassword(signUpDto.password);

    const user = await authRepository.createUser({
      email: signUpDto.email,
      password: hashedPassword,
      name: signUpDto.name,
      type: signUpDto.type as UserType,
    });

    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      type: user.type,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        image: user.image,
        points: user.points,
        gradeId: user.gradeId,
      },
    };
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다.', 'NotFound');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
      image: user.image,
      points: user.points,
      gradeId: user.gradeId,
      grade: user.grade,
    };
  }

  async updateMe(
    userId: string,
    updateData: {
      name?: string;
      image?: string;
      currentPassword?: string;
      password?: string;
    }
  ) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다', 'Not found');
    }

    if (updateData.password) {
      if (!updateData.currentPassword) {
        throw new AppError(
          400,
          '현재 비밀번호를 입력해주세요.',
          'Bad Request'
        );
      }

      const isCurrentPasswordValid = await comparePassword(
        updateData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new AppError(401, '현재 비밀번호가 틀렸습니다', 'Unauthorized');
      }
    }

    const data: { name?: string; image?: string; password?: string } = {};

    if (updateData.name !== undefined) {
      data.name = updateData.name;
    }

    if (updateData.image !== undefined) {
      data.image = updateData.image;
    }

    if (updateData.password !== undefined) {
      data.password = await hashPassword(updateData.password);
    }

    const updatedUser = await userRepository.updateUser(userId, data);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      type: updatedUser.type,
      image: updatedUser.image,
      points: updatedUser.points,
      gradeId: updatedUser.gradeId,
      grade: updatedUser.grade,
    };
  }

  async getMyLikes(userId: string) {
    const likes = await userRepository.findStoreLikes(userId);
    return likes;
  }

  async deleteAccount(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다.', 'Not Found');
    }

    await userRepository.deleteUser(userId);
  }
}
