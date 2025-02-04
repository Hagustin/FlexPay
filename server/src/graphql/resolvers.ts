import bcrypt from 'bcryptjs';
import { generateToken, checkWalletLock } from '../middleware/auth';
import { User } from '../models/User';
import { createPaymentIntent, getPaymentIntent } from '../services/payment';
import { IUser } from '../models/User';
import { GraphQLContext } from '../types/context';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import FLEXPAY_INSTRUCTIONS from "../config/chatbotInstructions";

dotenv.config();

//AI <let's try!
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const allowedCurrencies = ['AUD', 'USD', 'JPY'];

const resolvers = {
  Query: {
    getUser: async (_: unknown, { id }: { id?: string }, context: GraphQLContext) => {
      const userId = id || context.user?.id;
      if (!userId) {
        console.log("👤 Guest user detected. Returning null");
        return null;
      };
    
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID format");
      }
    
      const user = await User.findById(new mongoose.Types.ObjectId(userId))
        .populate("transactions") // ✅ Ensure transactions are populated
        .lean();
    
      if (!user) throw new Error('User not found');
    
      return {
        ...user,
        id: user._id.toString(),
        transactions: user.transactions.map((tx) => ({
          id: tx._id.toString(),
          amount: tx.amount,
          type: tx.type,
          status: tx.status || "completed", // ✅ Ensure status exists
          date: tx.date.toISOString(),
          senderId: tx.senderId || null,
          receiverId: tx.receiverId || null,
          description: tx.description || "No description",
        })),
      };
    },
    

    getTransactions: async (
      _: unknown,
      { userId, limit = 10, offset = 0 }: { userId: string; limit?: number; offset?: number },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");
    
      console.log(`🔍 Fetching transactions for user: ${userId}`); 
    
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
    
      console.log(`✅ User found: ${user.username}, Transactions:`, user.transactions); 
    
      return user.transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(offset, offset + limit)
        .map((tx) => ({
          id: tx._id.toString(),
          amount: tx.amount,
          type: tx.type,
          status: tx.status || "completed", // ✅ Ensure `status` is always defined
          date: new Date(tx.date).toISOString(), 
          senderId: tx.senderId || null,
          receiverId: tx.receiverId || null,
          description: tx.description || "No description",
        }));
    },
    
    
    
    
    //new Item all are heavily researched and implemented ; also by the use if the google AI
    askChatbot: async (_: any, { userId, question }: { userId?: string; question: string }) => {
      try {
        console.log(`🔍 Processing Chatbot Query | userId: ${userId || "Guest"}, question: ${question}`);
    
        let userContext = "Guest User | No account data available.";
        
        // ✅ Only fetch user details if userId is provided
        if (userId) {
          console.log("🔍 Fetching balance for userId:", userId);
    
          const objectId = new mongoose.Types.ObjectId(userId);
          const user: IUser | null = await User.findById(objectId).lean();
    
          if (!user) {
            console.error("❌ User not found for ID:", userId);
            throw new Error("User not found.");
          }
    
          console.log("✅ User found:", user.username, "| Balance (AUD):", user.walletBalance);
          userContext = `User Info: Username: ${user.username}, Balance: AUD $${user.walletBalance}`;
        }
    
        // ✅ Combine balance info (if available) with AI instructions
        const fullPrompt = `${FLEXPAY_INSTRUCTIONS}\n\n${userContext}\n\nUser asked: ${question}`;
        
        console.log("🔍 Sending message to Google Gemini with FlexPay guidance...");
    
        // ✅ Call Gemini AI with contextual data
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(fullPrompt);
        const response = result.response.text();
    
        return { response };
      } catch (error) {
        console.error("❌ Gemini API Error:", error);
        return { response: "Sorry, an error occurred while processing your request." };
      }
    },    
  },

  Mutation: {
    register: async (
      _: unknown,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string }
    ) => {
      if (await User.findOne({ email })) throw new Error('User already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
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

      return {
        user: { ...newUser.toObject(), id: newUser._id.toString() },
        token,
      };
    },

    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await User.findOne({ email }).lean();
      if (!user) throw new Error('User not found');

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new Error('Invalid credentials');

      const token = generateToken({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      });

      return { user: { ...user, id: user._id.toString() }, token };
    },

    addFundsViaCard: async (
      _: unknown,
      {
        userId,
        amount,
        currency,
      }: { userId: string; amount: number; currency: string }
    ) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const paymentIntent = await createPaymentIntent(amount, currency);

      return {
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        currency: paymentIntent.currency.toUpperCase(),
      };
    },

    confirmPayment: async (
      _: unknown,
      { userId, paymentIntentId }: { userId: string; paymentIntentId: string }
    ) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const paymentIntent = await getPaymentIntent(paymentIntentId);
      if (paymentIntent.status !== 'succeeded')
        throw new Error('Payment not completed');

      user.walletBalance += paymentIntent.amount_received / 100;
      await user.save();

      return {
        id: user._id.toString(),
        balance: user.walletBalance,
        currency: paymentIntent.currency.toUpperCase(),
      };
    },

    addFunds: async (
      _: unknown,
      { userId, amount }: { userId: string; amount: number },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(userId);
    
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
    
      user.walletBalance += amount;
      user.transactions.push({
        amount,
        type: "credit",
        status: "completed", // ✅ Ensure this is added
        date: new Date(),
        description: `Bank Deposit of $${amount}`,
      });
    
      await user.save();
    
      return {
        id: user._id.toString(),
        balance: user.walletBalance,
        transactions: user.transactions.map((tx) => ({
          id: tx._id.toString(),
          amount: tx.amount,
          type: tx.type,
          status: tx.status,
          date: tx.date.toISOString(),
          description: tx.description || "Bank Deposit",
        })),
      };
    },
    
    withdrawFunds: async (
      _: unknown,
      { userId, amount }: { userId: string; amount: number },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error('Unauthorized');
      await checkWalletLock(userId);

      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      if (user.walletBalance < amount) throw new Error('Insufficient balance');

      user.walletBalance -= amount;
      user.transactions.push({ amount, type: 'debit', date: new Date() });

      await user.save();

      return {
        id: user._id.toString(),
        balance: user.walletBalance,
        transactions: user.transactions.map((tx) => ({
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
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(senderId);
    
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      if (!sender || !receiver) throw new Error("Sender or Receiver not found");
    
      if (sender.walletBalance < amount) throw new Error("Insufficient balance");
    
      console.log("🔹 Sender Before Transaction:", sender);
      console.log("🔹 Receiver Before Transaction:", receiver);
    
      sender.walletBalance -= amount;
      sender.transactions.push({
        amount,
        type: "debit",
        status: "completed", 
        date: new Date(),
        receiverId,
        description: `Transferred $${amount} to ${receiver.username}`,
      });
    
      receiver.walletBalance += amount;
      receiver.transactions.push({
        amount,
        type: "credit",
        status: "completed",
        date: new Date(),
        senderId,
        description: `Received $${amount} from ${sender.username}`,
      });
    
      await sender.save();
      await receiver.save();
    
      console.log("✅ Sender After Transaction:", sender);
      console.log("✅ Receiver After Transaction:", receiver);
    
      return {
        id: sender._id.toString(),
        balance: sender.walletBalance,
        transactions: sender.transactions.map((tx) => ({
          amount: tx.amount,
          type: tx.type,
          status: tx.status, 
          date: tx.date.toISOString(),
        })),
      };
    },
    

    generateQR: async (
      _: unknown,
      { userId, amount }: { userId: string; amount: number },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error('Unauthorized');
      await checkWalletLock(userId);
    
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
    
      if (user.walletBalance < amount) throw new Error('Insufficient funds');
    
      // Generate QR Code
      const qrCode = uuidv4();
    
      // Store QR Code in Transactions with "pending" status
      user.transactions.push({
        amount,
        type: 'pending',
        date: new Date(),
        qrCode,
      });
    
      await user.save();
    
      return { code: qrCode, amount, status: 'pending' }; 
    },
    

    scanQR: async (
      _: unknown,
      { userId, qrCode }: { userId: string; qrCode: string },
      context: GraphQLContext
    ) => {
      if (!context.user) throw new Error("Unauthorized");
      await checkWalletLock(userId);
    
      const payer = await User.findById(userId);
      if (!payer) throw new Error("User (payer) not found");
    
      // ✅ Find the receiver with the pending transaction
      const receiver = await User.findOne(
        { "transactions.qrCode": qrCode, "transactions.type": "pending" }
      );
    
      if (!receiver) {
        console.error("❌ QR Code not found or already completed");
        throw new Error("QR code not found or expired");
      }
    
      // ✅ Locate transaction in receiver's transactions
      const transaction = receiver.transactions.find(tx => tx.qrCode === qrCode);
    
      if (!transaction) throw new Error("Invalid transaction");
      console.log("🔍 Transaction Found:", transaction);
    
      if (transaction.type !== "pending") {
        console.error("❌ Transaction is already completed or invalid");
        throw new Error("Transaction is not pending");
      }
    
      // ✅ Ensure payer has enough balance
      if (payer.walletBalance < transaction.amount) {
        throw new Error("Insufficient funds");
      }
    
      console.log("✅ BEFORE UPDATE:", transaction);
    
      // ✅ Process the transaction (Atomic update)
      payer.walletBalance -= transaction.amount;
      receiver.walletBalance += transaction.amount;
    
      // ✅ Update transaction status using `findOneAndUpdate`
      const updatedReceiver = await User.findOneAndUpdate(
        { "transactions.qrCode": qrCode, "transactions.type": "pending" },
        {
          $set: {
            "transactions.$.type": "completed",
            "transactions.$.qrCode": null
          }
        },
        { new: true }
      );
    
      console.log("✅ Transaction After Update:", updatedReceiver);
    
      // ✅ Save payer's transaction history
      payer.transactions.push({
        amount: transaction.amount,
        type: "debit",
        status: "completed",
        date: new Date(),
        description: `Sent $${transaction.amount} to ${receiver.username}`
      });
    
      await payer.save();
      await receiver.save();
    
      if (updatedReceiver) {
        console.log("✅ QR Transaction Completed:", updatedReceiver.transactions);
      } else {
        console.error("❌ Failed to update transaction: Receiver not found");
      }
    
      return {
        id: receiver._id.toString(),
        balance: receiver.walletBalance,
        transactionStatus: "completed",
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
