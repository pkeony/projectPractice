import { ProductRepository } from './product.repository';
import { StoreRepository } from '../store/store.repository';
import { InquiryRepository } from '../inquiry/inquiry.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AppError } from '../../common/types/errors';

const productRepository = new ProductRepository();
const storeRepository = new StoreRepository();
const inquiryRepository = new InquiryRepository();

function calcDiscountPrice(
  price: number,
  discountRate: number,
  discountStartTime: Date | null,
  discountEndTime: Date | null
): number {
  const now = new Date();
  const isActive =
    discountRate > 0 &&
    (!discountStartTime || discountStartTime <= now) &&
    (!discountEndTime || discountEndTime >= now);

  if (isActive) {
    return Math.floor(price * (1 - discountRate / 100));
  }
  return price;
}

export class ProductService {
  async getProductById(productId: string) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    const ratingCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const review of product.reviews) {
      if (ratingCounts[review.rating] !== undefined) {
        ratingCounts[review.rating]++;
      }
    }

    return {
      ...product,
      discountPrice: calcDiscountPrice(
        product.price,
        product.discountRate,
        product.discountStartTime,
        product.discountEndTime
      ),
      stocks: product.stocks.map((s) => ({
        id: s.id,
        productId: s.productId,
        quantity: s.quantity,
        size: {
          id: s.size.id,
          name: s.size.name,
          size: { en: s.size.nameEn, ko: s.size.nameKo },
        },
      })),
      avgRating: Math.round(avgRating * 10) / 10,
      reviewsCount: product.reviews.length,
      reviewsRating: Math.round(avgRating * 10) / 10,
      // ✅ 프론트의 ReviewCount 타입에 맞춤!
      reviews: {
        rate1Length: ratingCounts[1],
        rate2Length: ratingCounts[2],
        rate3Length: ratingCounts[3],
        rate4Length: ratingCounts[4],
        rate5Length: ratingCounts[5],
        sumScore: Math.round(avgRating * 10) / 10,
      },
    };
  }

  async getProducts(params: {
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
    const { products, total } = await productRepository.findAll(params);

    const now = new Date();
    const list = products.map((p) => {
      const discountPrice = calcDiscountPrice(
        p.price,
        p.discountRate,
        p.discountStartTime,
        p.discountEndTime
      );
      const reviewsCount = (p as any)._count?.reviews ?? 0;
      const reviewsList: any[] = (p as any).reviews ?? [];
      const reviewsRating =
        reviewsList.length > 0
          ? Math.round(
              (reviewsList.reduce((sum: number, r: any) => sum + r.rating, 0) /
                reviewsList.length) *
                10
            ) / 10
          : 0;

      return {
        id: p.id,
        storeId: p.storeId,
        storeName: (p as any).store?.name ?? '',
        name: p.name,
        image: p.image,
        price: p.price,
        discountPrice,
        discountRate: p.discountRate,
        discountStartTime: p.discountStartTime,
        discountEndTime: p.discountEndTime,
        reviewsCount,
        reviewsRating,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        sales: (p as any).orderItems
          ? (p as any).orderItems.reduce(
              (sum: number, oi: any) => sum + oi.quantity,
              0
            )
          : 0,
      };
    });

    return {
      list,
      totalCount: total,
    };
  }

  async createProduct(userId: string, createProductDto: CreateProductDto) {
    const store = await storeRepository.findByUserId(userId);

    if (!store) {
      throw new AppError(404, '등록된 가게가 없습니다.', 'Not Found');
    }

    const product = await productRepository.create(store.id, {
      name: createProductDto.name,
      categoryId: createProductDto.categoryId,
      price: createProductDto.price,
      content: createProductDto.content,
      image: createProductDto.image,
      discountRate: createProductDto.discountRate,
      discountStartTime: createProductDto.discountStartTime
        ? new Date(createProductDto.discountStartTime)
        : undefined,
      discountEndTime: createProductDto.discountEndTime
        ? new Date(createProductDto.discountEndTime)
        : undefined,
    });

    if (createProductDto.stocks && createProductDto.stocks.length > 0) {
      for (const stock of createProductDto.stocks) {
        await productRepository.upsertStock(
          product.id,
          stock.sizeId,
          stock.quantity
        );
      }
    }

    const createdProduct = await productRepository.findById(product.id);

    return createdProduct;
  }

  async updateProduct(
    userId: string,
    productId: string,
    updateProductDto: UpdateProductDto
  ) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    if (product.store.userId !== userId) {
      throw new AppError(
        403,
        '본인 가게의 상품만 수정할 수 있습니다.',
        'Forbidden'
      );
    }

    const updateData: any = {};

    if (updateProductDto.name !== undefined)
      updateData.name = updateProductDto.name;
    if (updateProductDto.categoryId !== undefined)
      updateData.categoryId = updateProductDto.categoryId;
    if (updateProductDto.price !== undefined)
      updateData.price = updateProductDto.price;
    if (updateProductDto.content !== undefined)
      updateData.content = updateProductDto.content;
    if (updateProductDto.image !== undefined)
      updateData.image = updateProductDto.image;
    if (updateProductDto.discountRate !== undefined)
      updateData.discountRate = updateProductDto.discountRate;
    if (updateProductDto.isSoldOut !== undefined)
      updateData.isSoldOut = updateProductDto.isSoldOut;

    if (updateProductDto.discountStartTime !== undefined) {
      updateData.discountStartTime = new Date(
        updateProductDto.discountStartTime
      );
    }
    if (updateProductDto.discountEndTime !== undefined) {
      updateData.discountEndTime = new Date(updateProductDto.discountEndTime);
    }

    await productRepository.update(productId, updateData);

    if (updateProductDto.stocks && updateProductDto.stocks.length > 0) {
      for (const stock of updateProductDto.stocks) {
        await productRepository.upsertStock(
          productId,
          stock.sizeId,
          stock.quantity
        );
      }
    }

    const updatedProduct = await productRepository.findById(productId);

    return updatedProduct;
  }

  async deleteProduct(userId: string, productId: string) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    if (product.store.userId !== userId) {
      throw new AppError(
        403,
        '본인 가게의 상품만 삭제할 수 있습니다.',
        'Forbidden'
      );
    }

    await productRepository.delete(productId);

    return { message: '상품이 삭제되었습니다.' };
  }

  async getProductInquiries(
    productId: string,
    page: number,
    pageSize: number,
    sort: string,
    status: string | undefined,
    userId: string | undefined
  ) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    const isStoreOwner = product.store.userId === userId;
    const orderBy = sort === 'oldest' ? 'asc' : 'desc';

    const { inquiries, total } =
      await inquiryRepository.findByProductIdFiltered(
        productId,
        page,
        pageSize,
        orderBy,
        status
      );

    const list = inquiries.map((inquiry) => {
      if (inquiry.isSecret && inquiry.userId !== userId && !isStoreOwner) {
        return {
          ...inquiry,
          title: '비밀글입니다.',
          content: '비밀글입니다.',
          user: { id: '', name: '***' },
        };
      }
      return inquiry;
    });

    return {
      list,
      totalCount: total,
    };
  }
}
