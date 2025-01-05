// src/routes/walletRoutes.ts
import express, { Request, Response } from 'express';
import { authenticateToken, checkWalletLock } from '../middleware/auth';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';

const router = express.Router();

// Check wallet balance (protected route)
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select('walletBalance');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

router.post('/add', authenticateToken, checkWalletLock, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { amount } = req.body;

    if (amount <= 0) {
      res.status(400).json({ message: 'Amount must be greater than 0' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Log the transaction
    await Transaction.create({
      userId,
      type: 'credit',
      amount,
      description: 'Funds added',
    });

    res.status(200).json({ message: 'Funds added successfully', walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add funds to wallet' });
  }
});

router.post('/deduct', authenticateToken, checkWalletLock, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { amount } = req.body;

    if (amount <= 0) {
      res.status(400).json({ message: 'Amount must be greater than 0' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.walletBalance < amount) {
      res.status(400).json({ message: 'Insufficient balance' });
      return;
    }

    user.walletBalance -= amount;
    await user.save();

    // Log the transaction
    await Transaction.create({
      userId,
      type: 'debit',
      amount,
      description: 'Funds deducted',
    });

    res.status(200).json({ message: 'Funds deducted successfully', walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deduct funds from wallet' });
  }
});

// Fetch transaction history (protected route)
router.get('/transactions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
  
      const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  router.post('/transfer', authenticateToken, checkWalletLock, async (req: Request, res: Response): Promise<void> => {
    try {
      const senderId = (req as any).user.id;
      const { recipientUsername, amount } = req.body;
  
      // Validate the transfer amount
      if (amount <= 0) {
        res.status(400).json({ message: 'Amount must be greater than 0' });
        return;
      }
  
      // Find the recipient by username
      const recipient = await User.findOne({ username: recipientUsername });
      if (!recipient) {
        res.status(404).json({ message: 'Recipient not found' });
        return;
      }
  
      // Find the sender and ensure sufficient balance
      const sender = await User.findById(senderId);
      if (!sender || sender.walletBalance < amount) {
        res.status(400).json({ message: 'Insufficient balance' });
        return;
      }
  
      // Deduct from sender's wallet and add to recipient's wallet
      sender.walletBalance -= amount;
      recipient.walletBalance += amount;
  
      await sender.save();
      await recipient.save();
  
      // Log the transactions for both sender and recipient
      await Transaction.create([
        {
          userId: senderId,
          type: 'debit',
          amount,
          description: `Transferred to ${recipient.username}`,
        },
        {
          userId: recipient._id,
          type: 'credit',
          amount,
          description: `Received from ${sender.username}`,
        },
      ]);
  
      res.status(200).json({ message: 'Transfer successful', senderBalance: sender.walletBalance });
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete the transfer' });
    }
  });

  router.put('/lock', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
  
      const user = await User.findByIdAndUpdate(userId, { walletLocked: true }, { new: true });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      res.status(200).json({ message: 'Wallet locked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to lock wallet' });
    }
  });

  router.put('/unlock', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
  
      const user = await User.findByIdAndUpdate(userId, { walletLocked: false }, { new: true });
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      res.status(200).json({ message: 'Wallet unlocked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unlock wallet' });
    }
  });
  
  
  

export default router;
