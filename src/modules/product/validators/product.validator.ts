import { AppError } from '../../../common/types/errors';

export const validateCreateProduct = (body: any): void => {
  const { name, categoryId, price } = body;

  if (!name || !categoryId || price === undefined) {
    throw new AppError(
      400,
      '상품명, 카테고리, 가격은 필수입니다.',
      'Bad Request'
    );
  }

  if (typeof price !== 'number' || price < 0) {
    throw new AppError(400, '가격은 0 이상의 숫자여야 합니다.', 'Bad Request');
  }

  if (name.length < 1 || name.length > 100) {
    throw new AppError(400, '상품명은 1~100자여야 합니다.', 'Bad Request');
  }

  if (body.discountRate !== undefined) {
    if (
      typeof body.discountRate !== 'number' ||
      body.discountRate < 0 ||
      body.discountRate > 100
    ) {
      throw new AppError(400, '할인율은 0~100 사이여야 합니다.', 'Bad Request');
    }
  }

  if (body.stocks) {
    if (!Array.isArray(body.stocks)) {
      throw new AppError(400, 'stocks는 배열이어야 합니다.', 'Bad Request');
    }

    for (const stock of body.stocks) {
      if (!stock.sizeId || stock.quantity === undefined) {
        throw new AppError(
          400,
          '재고에는 sizeId와 quantity가 필요합니다.',
          'Bad Request'
        );
      }

      if (typeof stock.quantity !== 'number' || stock.quantity < 0) {
        throw new AppError(
          400,
          '재고 수량은 0 이상이어야 합니다.',
          'Bad Request'
        );
      }
    }
  }
};

export const validateUpdateProduct = (body: any): void => {
  const { name, price, discountRate } = body;
  if (name !== undefined && (name.length < 1 || name.length > 100)) {
    throw new AppError(400, '상품명은 1~100자여야 합니다.', 'Bad Request');
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    throw new AppError(400, '가격은 0 이상의 숫자여야 합니다.', 'Bad Request');
  }

  if (
    discountRate !== undefined &&
    (typeof discountRate !== 'number' || discountRate < 0 || discountRate > 100)
  ) {
    throw new AppError(400, '할인율은 0~100 사이여야 합니다.', 'Bad Request');
  }

  if (body.stocks) {
    if (!Array.isArray(body.stocks)) {
      throw new AppError(400, 'stocks는 배열이어야 합니다.', 'Bad Request');
    }

    for (const stock of body.stocks) {
      if (!stock.sizeId || stock.quantity === undefined) {
        throw new AppError(
          400,
          '재고에는 sizeId와 quantity가 필요합니다.',
          'Bad Request'
        );
      }

      if (typeof stock.quantity !== 'number' || stock.quantity < 0) {
        throw new AppError(
          400,
          '재고 수량은 0 이상이어야 합니다.',
          'Bad Request'
        );
      }
    }
  }
};
