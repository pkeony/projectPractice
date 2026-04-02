import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { hashPassword, comparePassword } from '../../common/lib/password';
import { AppError } from '../../common/types/errors';
import { UserType } from '@prisma/client';
import { string } from 'superstruct';

const userRepository = new UserRepository();

export class UserService {
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

  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다', 'Not found');
    }

    const updateData: { name?: string; image?: string; type?: UserType } = {};

    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.image !== undefined) {
      updateData.image = updateUserDto.image;
    }

    if (updateUserDto.type !== undefined) {
      updateData.type = updateUserDto.type;
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);

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

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다.', 'Not Found');
    }

    const isCurrentPasswordValid = await comparePassword(
      updatePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new AppError(401, '현재 비밀번호가 틀렸습니다', 'Unauthorized');
    }

    const hashedNewPassword = await hashPassword(updatePasswordDto.newPassword);

    await userRepository.updatePassword(userId, hashedNewPassword);

    return { message: '비밀번호가 변경되었습니다.' };
  }
}
