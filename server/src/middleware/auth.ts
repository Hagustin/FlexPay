import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

interface JwtPayload {
  id: string;
  username: string;
  email: string;
}

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'default_secret';

// Function to generate a JWT token
export const generateToken = (user: { id: string; username: string; email: string }) => {
  return jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, {
    expiresIn: '1h',
  });
};

// Function to authenticate JWT token in GraphQL context
export const authenticateUser = (token: string | null) => {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  try {
    return jwt.verify(token, SECRET_KEY) as JwtPayload;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

// Function to check if the wallet is locked
export const checkWalletLock = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.walletLocked) {
    throw new Error('Wallet is locked. Unlock it to perform this action.');
  }

  return true; // If wallet is not locked, allow operation
};
