import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Akses ditolak, token tidak ditemukan', 401);
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return sendError(res, 'Akses ditolak, token tidak ditemukan', 401);
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'sivera_secret_key_2026';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Token tidak valid atau sudah kadaluwarsa', 403);
  }
};