import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { verifyAccessToken } from '../lib/jwt';
import { AppError, ErrorMessages } from '../types/errors';

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new AppError(401, ErrorMessages.UNAUTHORIZED);
  }

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    throw new AppError(401, ErrorMessages.UNAUTHORIZED);
  }

  req.user = decoded;
  next();
};

export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};
