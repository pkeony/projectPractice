import { AppError } from '../../../common/types/errors';

export const validateCreateInquiry = (body: any): void => {
  // ✅ productId 제거! URL 파라미터 또는 controller에서 주입
  const { title, content } = body;

  if (!title || !content) {
    throw new AppError(400, '제목, 내용은 필수입니다.', 'Bad Request');
  }

  if (title.length < 1 || title.length > 100) {
    throw new AppError(400, '제목은 1~100자여야 합니다.', 'Bad Request');
  }

  if (content.length < 1 || content.length > 1000) {
    throw new AppError(400, '내용은 1~1000자여야 합니다.', 'Bad Request');
  }
};

export const validateUpdateInquiry = (body: any): void => {
  const { title, content } = body;
  if (title !== undefined && (title.length < 1 || title.length > 100)) {
    throw new AppError(400, '제목은 1~100자여야 합니다.', 'Bad Request');
  }
  if (content !== undefined && (content.length < 1 || content.length > 1000)) {
    throw new AppError(400, '내용은 1~1000자여야 합니다.', 'Bad Request');
  }
};

export const validateCreateReply = (body: any): void => {
  const { content } = body;
  if (!content) {
    throw new AppError(400, '답변 내용을 입력해주세요.', 'Bad Request');
  }
  if (content.length < 1 || content.length > 1000) {
    throw new AppError(400, '답변은 1~1000자여야 합니다.', 'Bad Request');
  }
};
