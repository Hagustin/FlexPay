import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  walletBalance: number;
  walletLocked: boolean;
  transactions: {
    amount: number;
    type: "credit" | "debit" | "pending" | "completed";  // Added "pending" & "completed" for QR transactions
    date: Date;
    qrCode?: string;  // REMEMBER HENRY: Added qrCode field
  }[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  walletLocked: { type: Boolean, default: false },

  // Transactions Array with qrCode field
  transactions: [
    {
      amount: { type: Number, required: true },
      type: { type: String, enum: ["credit", "debit", "pending", "completed"], required: true },
      date: { type: Date, default: Date.now },
      qrCode: { type: String, default: null }, // REMEMBER HENRY: Added qrCode field
    },
  ],
});

// Password Hashing
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  console.log("Hashing password before saving:", this.password);
  
  // Ensure we do NOT hash an already hashed password
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    console.log("Skipping hash - password already hashed.");
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare candidate password with the stored hashed password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  console.log("Comparing:", candidatePassword, "with", this.password);
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
export const User = mongoose.model<IUser>('User', UserSchema);
