import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest, JwtPayload, TUserRole } from '../types';
import { sendError } from '../utils/response.util';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization'];

  if (!token) {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Access denied. No token provided.');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
  }
};

export const requireRole = (...roles: TUserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, StatusCodes.FORBIDDEN, 'You do not have permission to perform this action.');
      return;
    }
    next();
  };
};