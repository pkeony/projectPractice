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

  async findByUserIdWithStats(userId: string) {
    const store = await prisma.store.findUnique({
      where: { userId },
      include: {
        likes: true,
        products: {
          include: {
            stocks: true,
            orderItems: true,
          },
        },
      },
    });

    if (!store) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthFavoriteCount = await prisma.storeLike.count({
      where: {
        storeId: store.id,
        createdAt: { gte: startOfMonth },
      },
    });

    const productCount = store.products.length;
    const favoriteCount = store.likes.length;
    const totalSoldCount = store.products.reduce(
      (sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.quantity, 0),
      0
    );

    return {
      id: store.id,
      userId: store.userId,
      name: store.name,
      address: store.address,
      detailAddress: store.detailAddress,
      phoneNumber: store.phoneNumber,
      content: store.content,
      image: store.image,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      productCount,
      favoriteCount,
      monthFavoriteCount,
      totalSoldCount,
    };
  }

  async findProductsByStoreId(storeId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { storeId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          stocks: true,
        },
      }),
      prisma.product.count({ where: { storeId } }),
    ]);

    const list = products.map((p) => {
      const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
      const now = new Date();
      const isDiscount =
        p.discountRate > 0 &&
        (!p.discountStartTime || p.discountStartTime <= now) &&
        (!p.discountEndTime || p.discountEndTime >= now);

      return {
        id: p.id,
        image: p.image,
        name: p.name,
        price: p.price,
        createdAt: p.createdAt,
        stock: totalStock,
        isDiscount,
        isSoldOut: p.isSoldOut,
      };
    });

    return { products: list, total };
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
