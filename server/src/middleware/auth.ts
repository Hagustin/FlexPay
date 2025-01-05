import { Request, Response, NextFunction } from 'express';
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
