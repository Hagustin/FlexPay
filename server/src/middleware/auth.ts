import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  id: string;
  username: string;
  email: string;
}

// Middleware to validate JWT token
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop()?.trim(); // Extract Bearer token
  }

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return; // Ensure we stop execution if there's no token
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || 'default_secret';
    const { id, username, email } = jwt.verify(token, secretKey) as JwtPayload;

    // Attach user data to the request object
    (req as any).user = { id, username, email };
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    if (error instanceof Error) {
      console.error('Invalid token:', error.message);
    } else {
      console.error('Invalid token:', error);
    }
    res.status(403).json({ message: 'Invalid token.' });
  }
};

export const checkWalletLock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return; // Stop further execution if the user is not found
    }

    if (user.walletLocked) {
      res.status(403).json({ message: 'Wallet is locked. Unlock it to perform this action.' });
      return; // Stop further execution if the wallet is locked
    }

    next(); // Proceed if wallet is not locked
  } catch (error) {
    console.error('Error checking wallet lock:', error);
    res.status(500).json({ message: 'Failed to check wallet lock status.' });
  }
};
