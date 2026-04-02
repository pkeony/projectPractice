import { AppError } from '../../../common/types/errors';

//회원가입 유효성 검증
export const validateSignUp = (body: any): void => {
  const { email, password, name, type } = body;

  if (!email || !password || !name || !type) {
    throw new AppError(400, '모든 필드를 입력해주세요', 'Bad Request');
  }

  //이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, '유효한 이메일을 입력해주세요.', 'Bad Request');
  }

  //비밀번호 길이 검증
  if (password.length < 8) {
    throw new AppError(400, '비밀번호는 8자 이상이어야 합니다.', 'Bad Request');
  }

  // 이름 길이 검증
  if (name.length < 1 || name.length > 20) {
    throw new AppError(400, '이름은 1~20자여야 합니다.', 'Bad Request');
  }

  //타입 검증
  if (!['BUYER', 'SELLER'].includes(type)) {
    throw new AppError(
      400,
      'type은 BUYER 또는 SELLER여야 합니다.',
      'Bad Request'
    );
  }
};

//로그인 유효성 검증
export const validateLogin = (body: any): void => {
  const { email, password } = body;

  if (!email || !password) {
    throw new AppError(400, '이메일과 비밀번호를 입력해주세요.', 'Bad Request');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, '유효한 이메일을 입력해주세요.', 'Bad Request');
  }
};
