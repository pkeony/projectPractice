import prisma from '../../common/database/prisma';
import { UserType } from '@prisma/client';

export class UserRepository {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { grade: true },
    });
  }

  async updateUser(
    userId: string,
    data: {
      name?: string;
      image?: string;
      type?: UserType;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: { grade: true },
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
