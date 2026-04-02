export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorMessages = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  USER_ALREADY_EXISTS: '이미 가입된 이메일입니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
  PRODUCT_NOT_FOUND: '상품�� 찾을 수 없습니다.',
  STORE_NOT_FOUND: '스토어를 찾을 수 없습니다.',
  CART_NOT_FOUND: '장바구니를 찾을 수 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
  REVIEW_NOT_FOUND: '리뷰를 찾을 수 없습니다.',
  INQUIRY_NOT_FOUND: '문의를 찾을 수 없습니다.',
};

// INVALID_CREDENTIALS	로그인 실패	401
// USER_ALREADY_EXISTS	중복 이메일	409
// USER_NOT_FOUND	사용자 없음	404
// UNAUTHORIZED	인증 필요	401
// FORBIDDEN	권한 없음	403
// INTERNAL_SERVER_ERROR	서버 오류	500
// PRODUCT_NOT_FOUND	상품 없음	404
// STORE_NOT_FOUND	스토어 없음	404
// CART_NOT_FOUND	장바구니 없음	404
// ORDER_NOT_FOUND	주문 없음	404
// REVIEW_NOT_FOUND	리뷰 없음	404
// INQUIRY_NOT_FOUND	문의 없음	404
