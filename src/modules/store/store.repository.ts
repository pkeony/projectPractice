import prisma from '../../common/database/prisma';

export class StoreRepository {
  async findByUserId(userId: string) {
    return prisma.store.findUnique({
      where: { userId },
      include: {
        likes: true,
        products: true,
      },
    });
  }

  async findById(storeId: string) {
    return prisma.store.findUnique({
      where: { id: storeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },

        likes: true,
        products: true,
      },
    });
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          likes: true,
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.store.count(),
    ]);

    return { stores, total };
  }

  async create(
    userId: string,
    data: {
      name: string;
      address: string;
      detailAddress: string;
      phoneNumber: string;
      content: string;
      image?: string;
    }
  ) {
    return prisma.store.create({
      data: {
        userId,
        name: data.name,
        address: data.address,
        detailAddress: data.detailAddress,
        phoneNumber: data.phoneNumber,
        content: data.content,
        image: data.image,
      },
      include: {
        likes: true,
        products: true,
      },
    });
  }

  async update(
    storeId: string,
    data: {
      name?: string;
      address?: string;
      detailAddress?: string;
      phoneNumber?: string;
      content?: string;
      image?: string;
    }
  ) {
    return prisma.store.update({
      where: { id: storeId },
      data,
      include: {
        likes: true,
        products: true,
      },
    });
  }

  async findLike(userId: string, storeId: string) {
    return prisma.storeLike.findUnique({
      where: {
        userId_storeId: { userId, storeId },
      },
    });
  }

  async createLike(userId: string, storeId: string) {
    return prisma.storeLike.create({
      data: { userId, storeId },
    });
  }

  async deleteLike(userId: string, storeId: string) {
    return prisma.storeLike.delete({
      where: {
        userId_storeId: { userId, storeId },
      },
    });
  }
}
