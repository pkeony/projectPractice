import { AppError } from '../../../common/types/errors';

export const validateCreateStore = (body: any): void => {
  const { name, address, detailAddress, phoneNumber, content } = body;
  if (!name || !address || !detailAddress || !phoneNumber || !content) {
    throw new AppError(400, '모든 필수 항목을 입력해주세요.', 'Bad Request');
  }

  if (name.length < 1 || name.length > 50) {
    throw new AppError(400, '가게 이름은 1~50자여야 합니다.', 'Bad Request');
  }

  if (phoneNumber.length < 9 || phoneNumber.length > 15) {
    throw new AppError(
      400,
      '전화번호 형식이 올바르지 않습니다.',
      'Bad Request'
    );
  }
};

export const validateUpdateStore = (body: any): void => {
  const { name, phoneNumber } = body;

  if (name !== undefined && (name.length < 1 || name.length > 50)) {
    throw new AppError(400, '가게 이름은 1~50자여야 합니다.', 'Bad Request');
  }

  if (
    phoneNumber !== undefined &&
    (phoneNumber.length < 9 || phoneNumber.length > 15)
  ) {
    throw new AppError(
      400,
      '전화번호 형식이 올바르지 않습니다.',
      'Bad Request'
    );
  }
};
