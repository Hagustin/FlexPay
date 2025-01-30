import bcrypt from "bcryptjs";
import { generateToken, checkWalletLock } from "../middleware/auth";
import { User } from "../models/User";
import { createPaymentIntent, getPaymentIntent } from "../services/payment";
import { GraphQLContext } from "../types/context";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose"; // ✅ Import Mongoose for ObjectId validation


const allowedCurrencies = ["AUD", "USD", "JPY"];

const resolvers = {
  Query: {
    getUser: async (_: unknown, { id }: { id?: string }, context: GraphQLContext) => {
      const userId = id || context.user?.id; // ✅ Use provided ID or fallback to logged-in user
      if (!userId) throw new Error("Unauthorized - User ID is required");
    
      // ✅ Ensure ID is a valid MongoDB ObjectId before querying
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }
    
      const user = await User.findById(new mongoose.Types.ObjectId(userId)).lean();
      if (!user) throw new Error("User not found");
    
      return { ...user, id: user._id.toString() };
    },
    

    getTransactions: async (_: unknown, { userId, limit = 10, offset = 0 }: { userId: string; limit?: number; offset?: number }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

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
    register: async (_: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      if (await User.findOne({ email })) throw new Error("User already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword, walletBalance: 0, walletLocked: false });

      await newUser.save();

      const token = generateToken({ id: newUser._id.toString(), username: newUser.username, email: newUser.email });

      return { user: { ...newUser.toObject(), id: newUser._id.toString() }, token };
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email }).lean();
      if (!user) throw new Error("User not found");

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new Error("Invalid credentials");

      const token = generateToken({ id: user._id.toString(), username: user.username, email: user.email });

      return { user: { ...user, id: user._id.toString() }, token };
    },

    addFundsViaCard: async (_: unknown, { userId, amount, currency }: { userId: string; amount: number; currency: string }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const paymentIntent = await createPaymentIntent(amount, currency);
      
      return {
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        currency: paymentIntent.currency.toUpperCase(),
      };
    },

    confirmPayment: async (_: unknown, { userId, paymentIntentId }: { userId: string; paymentIntentId: string }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const paymentIntent = await getPaymentIntent(paymentIntentId);
      if (paymentIntent.status !== "succeeded") throw new Error("Payment not completed");

      user.walletBalance += paymentIntent.amount_received / 100;
      await user.save();

      return {
        id: user._id.toString(),
        balance: user.walletBalance,
        currency: paymentIntent.currency.toUpperCase(),
      };
    },

    addFunds: async (_: unknown, { userId, amount }: { userId: string; amount: number }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(userId);

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.walletBalance += amount;
      user.transactions.push({ amount, type: "credit", date: new Date() });

      await user.save();

      return { id: user._id.toString(), balance: user.walletBalance, transactions: user.transactions.map(tx => ({ amount: tx.amount, type: tx.type, date: tx.date.toISOString() })) };
    },

    withdrawFunds: async (_: unknown, { userId, amount }: { userId: string; amount: number }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(userId);

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      if (user.walletBalance < amount) throw new Error("Insufficient balance");

      user.walletBalance -= amount;
      user.transactions.push({ amount, type: "debit", date: new Date() });

      await user.save();

      return { id: user._id.toString(), balance: user.walletBalance, transactions: user.transactions.map(tx => ({ amount: tx.amount, type: tx.type, date: tx.date.toISOString() })) };
    },

    transferFunds: async (_: unknown, { senderId, receiverId, amount }: { senderId: string; receiverId: string; amount: number }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(senderId);

      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      if (!sender || !receiver) throw new Error("Sender or Receiver not found");

      if (sender.walletBalance < amount) throw new Error("Insufficient balance");

      sender.walletBalance -= amount;
      sender.transactions.push({ amount, type: "debit", date: new Date() });

      receiver.walletBalance += amount;
      receiver.transactions.push({ amount, type: "credit", date: new Date() });

      await sender.save();
      await receiver.save();

      return { id: sender._id.toString(), balance: sender.walletBalance, transactions: sender.transactions.map(tx => ({ amount: tx.amount, type: tx.type, date: tx.date.toISOString() })) };
    },

    generateQR: async (_: unknown, { userId, amount }: { userId: string; amount: number }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(userId);
    
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
    
      if (user.walletBalance < amount) throw new Error("Insufficient funds");
    
      // Generate QR Code
      const qrCode = uuidv4();
    
      // Store QR Code in Transactions
      user.transactions.push({
        amount,
        type: "pending",
        date: new Date(),
        qrCode,
      });
    
      await user.save();
    
      return { code: qrCode, amount, status: "pending" };
    },

    scanQR: async (_: unknown, { userId, qrCode }: { userId: string; qrCode: string }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(userId);
    
      const receiver = await User.findById(userId);
      if (!receiver) throw new Error("User not found");
    
      // Find sender by matching the QR code in their transactions
      const sender = await User.findOne({ "transactions.qrCode": qrCode });
      if (!sender) throw new Error("QR code not found or expired");
    
      // Get the transaction details
      const transactionIndex = sender.transactions.findIndex(tx => tx.qrCode === qrCode);
      if (transactionIndex === -1) throw new Error("Invalid transaction");
    
      const transaction = sender.transactions[transactionIndex];
    
      // Ensure receiver has enough balance
      if (receiver.walletBalance < transaction.amount) throw new Error("Insufficient funds");
    
      // Process transaction
      receiver.walletBalance -= transaction.amount;
      sender.walletBalance += transaction.amount;
    
      receiver.transactions.push({ amount: transaction.amount, type: "debit", date: new Date() });
      sender.transactions.push({ amount: transaction.amount, type: "credit", date: new Date() });
    
      // Mark QR code transaction as completed
      sender.transactions[transactionIndex].type = "completed";
    
      await receiver.save();
      await sender.save();
    
      return { id: receiver._id.toString(), balance: receiver.walletBalance };
    }
    ,

    lockWallet: async (_: unknown, { userId }: { userId: string }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.walletLocked = true;
      await user.save();

      return { ...user.toObject(), id: user._id.toString() };
    },

    unlockWallet: async (_: unknown, { userId }: { userId: string }, context: GraphQLContext) => {
      if (!context.user) throw new Error("Unauthorized");

      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      user.walletLocked = false;
      await user.save();

      return { ...user.toObject(), id: user._id.toString() };
    },
  },
};

export default resolvers;
