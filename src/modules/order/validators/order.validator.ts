import { AppError } from '../../../common/types/errors';

export const validateCreateOrder = (body: any): void => {
  const { name, phoneNumber, address, usePoint } = body;
  // ✅ orderItems 또는 items 둘 다 허용
  const items = body.orderItems || body.items;

  if (!name || !phoneNumber || !address) {
    throw new AppError(
      400,
      '주문자명, 전화번호, 주소는 필수입니다.',
      'Bad Request'
    );
  }

  if (
    usePoint !== undefined &&
    (typeof usePoint !== 'number' || usePoint < 0)
  ) {
    throw new AppError(
      400,
      '포인트는 0 이상의 숫자여야 합니다.',
      'Bad Request'
    );
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError(
      400,
      '주문 상품을 1개 이상 선택해주세요.',
      'Bad Request'
    );
  }

  for (const item of items) {
    if (
      !item.productId ||
      item.sizeId === undefined ||
      item.quantity === undefined
    ) {
      throw new AppError(
        400,
        '주문 상품에는 productId, sizeId, quantity가 필요합니다.',
        'Bad Request'
      );
    }

    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      throw new AppError(
        400,
        '주문 수량은 1개 이상이어야 합니다.',
        'Bad Request'
      );
    }
  }
};
