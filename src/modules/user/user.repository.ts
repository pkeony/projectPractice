import prisma from '../../common/database/prisma';

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
      password?: string;
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

  async findStoreLikes(userId: string) {
    const likes = await prisma.storeLike.findMany({
      where: { userId },
      include: {
        store: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return likes.map((like) => ({ store: like.store }));
  }

  async deleteUser(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}
