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
        inquiries: {
          include: {
            user: { select: { id: true, name: true } },
            reply: true,
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
    pageSize: number;
    sort?: string;
    search?: string;
    priceMin?: number;
    priceMax?: number;
    size?: string;
    favoriteStore?: string;
    categoryName?: string;
  }) {
    const {
      page,
      pageSize,
      sort,
      search,
      priceMin,
      priceMax,
      size,
      favoriteStore,
      categoryName,
    } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (categoryName) {
      where.category = {
        name: {
          equals: categoryName,
          mode: 'insensitive', // ✅ 대소문자 무시!
        },
      };
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    if (size) {
      where.stocks = {
        some: {
          size: { name: size },
          quantity: { gt: 0 },
        },
      };
    }

    if (favoriteStore) {
      where.store = {
        likes: {
          some: { userId: favoriteStore },
        },
      };
    }

    let orderBy: any = { createdAt: 'desc' };

    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'recent') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
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
          orderItems: {
            select: { quantity: true },
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
