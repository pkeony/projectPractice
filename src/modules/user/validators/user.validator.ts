import { AppError } from '../../../common/types/errors';

export const validateUpdateUser = (body: any): void => {
  const { name, type } = body;

  if (name !== undefined && (name.length < 1 || name.length > 20)) {
    throw new AppError(400, '이름은 1~20자여야 합니다', 'Bad Request');
  }

  if (type !== undefined && !['BUYER', 'SELLER'].includes(type)) {
    throw new AppError(
      400,
      'type은 BUYER 또는 SELLER여야 합니다.',
      'Bad Request'
    );
  }
};

export const validateUpdatePassword = (body: any): void => {
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError(400, '모든 필드를 입력해주세요', 'Bad Request');
  }

  if (newPassword.length < 8) {
    throw new AppError(
      400,
      '새 비밀버호는 8자 이상이어야 합니다',
      'Bad Request'
    );
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(400, '새 비밀번호가 일치하지 않습니다.', 'Bad Request');
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      400,
      '현재 비밀번호와 다른 비밀번호를 입력해주세요',
      'Bad Request'
    );
  }
};
