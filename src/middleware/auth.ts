import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import { verifyAccessToken } from '../services/authService';

export const authenticate = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw Error('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

