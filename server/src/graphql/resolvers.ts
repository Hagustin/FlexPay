import bcrypt from 'bcryptjs';
import { generateToken, checkWalletLock } from '../middleware/auth';
import { User } from '../models/User';
import { GraphQLContext } from '../types/context';

const resolvers = {
  Query: {
    getUser: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      console.log("🟢 Checking user authentication in getUser...");
      console.log("🟢 Received ID:", id);
      console.log("🟢 Context user:", context.user);

      if (!context.user) {
        console.log("🔴 Unauthorized access - No user in context.");
        throw new Error("Unauthorized");
      }

      const user = await User.findById(id).lean();
      if (!user) throw new Error("User not found");

      return { ...user, id: user._id.toString() };
    },

    getTransactions: async (
      _: unknown,
      { userId, limit = 10, offset = 0 }: { userId: string; limit?: number; offset?: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
    
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
    
      // Return paginated transactions
      return user.transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime()) 
        .slice(offset, offset + limit)  
        .map(tx => ({
          amount: tx.amount,
          type: tx.type,
          date: tx.date.toISOString(),
        }));
    }, 
  },

  Mutation: {
    register: async (
      _: unknown,
      { username, email, password }: { username: string; email: string; password: string }
    ) => {
      if (await User.findOne({ email })) {
        throw new Error('User already exists');
      }

      console.log("Before Hashing Password:", password);
      
      // Ensure password is NOT already hashed
      if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
        throw new Error("Password should not be pre-hashed before registration.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("After Hashing Password:", hashedPassword);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        walletBalance: 0,
        walletLocked: false,
      });

      await newUser.save();

      const token = generateToken({
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
      });

      return { user: { ...newUser.toObject(), id: newUser._id.toString() }, token };
    },

    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await User.findOne({ email }).lean();
      if (!user) {
        console.error("User not found:", email);
        throw new Error('User not found');
      }

      console.log("Stored Password:", user.password);
      console.log("Input Password:", password);

      const validPassword = await bcrypt.compare(password, user.password);
      console.log("Password Match:", validPassword);

      if (!validPassword) throw new Error('Invalid credentials');

      const token = generateToken({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      });

      return { user: { ...user, id: user._id.toString() }, token };
    },

    addFunds: async (
      _: unknown,
      { userId, amount }: { userId: string; amount: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
    
      await checkWalletLock(userId);
    
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
    
      // Add funds to wallet
      user.walletBalance += amount;
    
      // Add transaction history
      user.transactions.push({
        amount,
        type: "credit",
        date: new Date(),  // ✅ Save as Date object
      });
    
      await user.save();
    
      return {
        id: user._id.toString(),
        balance: user.walletBalance,
        transactions: user.transactions.map(tx => ({
          amount: tx.amount,
          type: tx.type,
          date: tx.date.toISOString(),
        })),
      };
    },

    withdrawFunds: async (
      _: unknown,
      { userId, amount }: { userId: string; amount: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
    
      await checkWalletLock(userId);
    
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
    
      if (user.walletBalance < amount) {
        throw new Error('Insufficient balance');
      }
    
      // Subtract funds from wallet
      user.walletBalance -= amount;
    
      // Add withdrawal transaction
      user.transactions.push({
        amount,
        type: "debit",
        date: new Date(),
      });
    
      await user.save();
    
      return {
        id: user._id.toString(),
        balance: user.walletBalance,
        transactions: user.transactions.map(tx => ({
          amount: tx.amount,
          type: tx.type,
          date: tx.date.toISOString(),
        })),
      };
    },

    transferFunds: async (
      _: unknown,
      { senderId, receiverId, amount }: { senderId: string; receiverId: string; amount: number },
      context: GraphQLContext
    ) => {
      if (!context.user) {
        throw new Error('Unauthorized');
      }
    
      await checkWalletLock(senderId);
    
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
    
      if (!sender || !receiver) {
        throw new Error('Sender or Receiver not found');
      }
    
      if (sender.walletBalance < amount) {
        throw new Error('Insufficient balance');
      }
    
      // Deduct from sender
      sender.walletBalance -= amount;
      sender.transactions.push({
        amount,
        type: "debit",
        date: new Date(),
      });
    
      // Credit to receiver
      receiver.walletBalance += amount;
      receiver.transactions.push({
        amount,
        type: "credit",
        date: new Date(),
      });
    
      await sender.save();
      await receiver.save();
    
      return {
        id: sender._id.toString(),
        balance: sender.walletBalance,
        transactions: sender.transactions.map(tx => ({
          amount: tx.amount,
          type: tx.type,
          date: tx.date.toISOString(),
        })),
      };
    },   

    lockWallet: async (
      _: unknown,
      { userId }: { userId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error('Unauthorized');

      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      user.walletLocked = true;
      await user.save();

      return { ...user.toObject(), id: user._id.toString() };
    },

    unlockWallet: async (
      _: unknown,
      { userId }: { userId: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error('Unauthorized');

      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      user.walletLocked = false;
      await user.save();

      return { ...user.toObject(), id: user._id.toString() };
    },
  },
};

export default resolvers;
