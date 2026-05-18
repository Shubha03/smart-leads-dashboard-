import {
  Request,
  Response,
  NextFunction
} from 'express';

import jwt from 'jsonwebtoken';
import { config } from './config';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'Admin' | 'Sales User';
  };
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Token missing'
    });

    return;
  }

  try {
    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      config.JWT_SECRET
    ) as {
      userId: string;
      role: 'Admin' | 'Sales User';
    };

    req.user = decoded;

    next();
  } catch {
    res.status(403).json({
      error: 'Invalid token'
    });
  }
};

export const authorizeRoles =
  (...roles: ('Admin' | 'Sales User')[]) =>
  (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden'
      });

      return;
    }

    next();
  };

export const asyncHandler =
  (fn: Function) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    Promise.resolve(
      fn(req, res, next)
    ).catch(next);
  };