import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Result } from 'neverthrow';

const JWT_SECRET = process.env.JWT_SECRET || 'black_rose_dnd_super_secret_jwt_key_2026';

interface JwtPayload {
  id: number;
  name: string;
  email: string;
}

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const verifyResult = Result.fromThrowable(
    () => jwt.verify(token, JWT_SECRET) as JwtPayload,
    (e) => e
  )();

  if (verifyResult.isErr()) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = verifyResult.value;
  next();
};
