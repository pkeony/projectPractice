import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //AppError면 (우리가 의도적으로 던진 에러)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.error,
    });
    return;
  }

  //예상치 못한 에러 (버그)
  console.error('Unexpected Error', err);
  res.status(500).json({
    statusCode: 500,
    message: '서버 내부 오류가 발생했습니다.',
    error: 'Internal Server Error',
  });
};
