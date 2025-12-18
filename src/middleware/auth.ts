import { Response, NextFunction } from 'express';
import { IAuthRequest } from '../types';
import { verifyAccessToken } from '../services/authService';
import { Types } from 'mongoose';

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.sendStatus(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    const decoded = verifyAccessToken(token);
    
    req.user = {
      userId: new Types.ObjectId(decoded.userId),
      username: decoded.username,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

