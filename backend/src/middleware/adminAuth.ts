import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
    name: string;
    isActive: boolean;
  };
  user?: any;
}

export const adminAuth = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'pakkam_super_secret_jwt_key_2026_hyperlocal';
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const configuredAdminEmail = process.env.ADMIN_EMAIL;
    const isRoleAdmin = decoded && (decoded.role === 'admin' || decoded.role === 'ADMIN');
    const isEmailMatching = Boolean(
      decoded &&
      configuredAdminEmail &&
      decoded.email &&
      decoded.email.toLowerCase() === configuredAdminEmail.toLowerCase()
    );

    if (!isRoleAdmin || !isEmailMatching) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const adminPayload = {
      id: 'admin',
      email: configuredAdminEmail || '',
      role: 'admin',
      name: 'Pakkam Admin',
      isActive: true,
    };
    req.admin = adminPayload;
    req.user = adminPayload;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
};
