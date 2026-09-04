import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'pakkam_super_secret_jwt_key_2026_hyperlocal');
    const user = await User.findById(decoded.id).populate('shop');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or account deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

export const adminOnly = authorize('ADMIN');

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'pakkam_super_secret_jwt_key_2026_hyperlocal');
      const user = await User.findById(decoded.id).populate('shop');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silent fallback for guest requests
  }
  next();
};
