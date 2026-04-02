import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../types/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'access-secret-key';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    type: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(401, '토큰이 없습니다.', 'Unauthorized');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError(401, '토큰 형식이 잘못되었습니다.', 'Unauthorized');
  }

  const decoded = jwt.verify(token, JWT_SECRET) as {
    userId: string;
    email: string;
    type: string;
  };

  req.user = decoded;
  next();
};
