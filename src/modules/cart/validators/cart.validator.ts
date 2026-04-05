import { AppError } from '../../../common/types/errors';

export const validateAddCartItem = (body: any): void => {
  const { productId, sizeId, quantity } = body;

  if (!productId || sizeId === undefined || quantity === undefined) {
    throw new AppError(
      400,
      '상품ID, 사이즈, 수량을 모두 입력해주세요.',
      'Bad Request'
    );
  }

  if (typeof sizeId !== 'number' || sizeId < 1) {
    throw new AppError(400, '유효한 사이즈를 선택해주세요.', 'Bad Request');
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    throw new AppError(400, '수량은 1개 이상이어야 합니다.', 'Bad Request');
  }
};

export const validateUpdateCartItem = (body: any): void => {
  const { quantity } = body;

  if (quantity === undefined) {
    throw new AppError(400, '수량을 입력해주세요.', 'Bad Request');
  }

  if (typeof quantity !== 'number' || quantity < 1) {
    throw new AppError(400, '수량은 1개 이상이어야 합니다.', 'Bad Request');
  }
};
