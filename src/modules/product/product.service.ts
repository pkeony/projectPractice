import { ProductRepository } from './product.repository';
import { StoreRepository } from '../store/store.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AppError } from '../../common/types/errors';

const productRepository = new ProductRepository();
const storeRepository = new StoreRepository();

export class ProductService {
  async getProductById(productId: string) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'Not Found');
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          //reduce() 배열을 하나의 값으로 줄이기
          //sum + reviews.rationg -> 모든 rating값을 더한다 sum이 그런뜻
          product.reviews.length
        : 0;

    return {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10, //4.3333 같은값을 round로 43으로 만든뒤 4.3으로 바꾸기
    };
  }

  async getProducts(params: {
    page: number;
    limit: number;
    categoryId?: string;
    storeId?: string;
    keyword?: string;
    sortBy?: string;
  }) {
    const { products, total } = await productRepository.findAll(params);

    return {
      products,
      total,
      pages: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
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
}
