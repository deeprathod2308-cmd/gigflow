import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token, unauthorized' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access only' });
    return;
  }
  next();
};