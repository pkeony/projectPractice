import { AppError } from '../../../common/types/errors';

export const validateCreateReview = (body: any): void => {
  const { orderItemId, rating, content } = body;

  // ✅ productId는 URL 파라미터에서 오므로 body 체크 제거!
  if (!orderItemId || rating === undefined || !content) {
    throw new AppError(400, '모든 필드를 입력해주세요.', 'Bad Request');
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new AppError(400, '별점은 1~5 사이여야 합니다.', 'Bad Request');
  }

  if (!Number.isInteger(rating)) {
    throw new AppError(400, '별점은 정수여야 합니다.', 'Bad Request');
  }

  if (content.length < 1 || content.length > 500) {
    throw new AppError(400, '리뷰 내용은 1~500자여야 합니다.', 'Bad Request');
  }
};

export const validateUpdateReview = (body: any): void => {
  const { rating, content } = body;
  if (rating !== undefined) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new AppError(400, '별점은 1~5 사이여야 합니다.', 'Bad Request');
    }

    if (!Number.isInteger(rating)) {
      throw new AppError(400, '별점은 정수여야 합니다.', 'Bad Request');
    }
  }

  if (content !== undefined) {
    if (content.length < 1 || content.length > 500) {
      throw new AppError(400, '리뷰 내용은 1~500자여야 합니다.', 'Bad Request');
    }
  }
};
