import prisma from '../../common/database/prisma';

export class ProductRepository {
  async findById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        category: true,
        stocks: {
          include: { size: true },
        },

        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    categoryId?: string;
    storeId?: string;
    keyword?: string;
    sortBy?: string;
  }) {
    const { page, limit, categoryId, storeId, keyword, sortBy } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (keyword) {
      where.name = {
        contains: keyword, //부분일치 검색
        mode: 'insensitive', //대소문자 구분x
      };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          category: true,
          stocks: {
            include: { size: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async create(
    storeId: string,
    data: {
      name: string;
      categoryId: string;
      price: number;
      content?: string;
      image?: string;
      discountRate?: number;
      discountStartTime?: Date;
      discountEndTime?: Date;
    }
  ) {
    return prisma.product.create({
      data: {
        storeId,
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        content: data.content || '',
        image: data.image,
        discountRate: data.discountRate || 0,
        discountStartTime: data.discountStartTime,
        discountEndTime: data.discountEndTime,
      },
      include: {
        category: true,
        stocks: {
          include: { size: true },
        },
      },
    });
  }

  async update(productId: string, data: any) {
    return prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: true,
        stocks: {
          include: { size: true },
        },
      },
    });
  }

  async delete(productId: string) {
    return prisma.product.delete({
      where: { id: productId },
    });
  }

  async upsertStock(productId: string, sizeId: number, quantity: number) {
    return prisma.productStock.upsert({
      where: {
        productId_sizeId: { productId, sizeId },
      },
      update: { quantity },
      create: { productId, sizeId, quantity },
      include: { size: true },
    });
  }
}
