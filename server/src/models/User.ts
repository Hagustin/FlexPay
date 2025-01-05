import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the User interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  walletBalance: number; // Field for wallet balance
  walletLocked: boolean; // New field to lock/unlock wallet
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create the User schema
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 }, // Initialize wallet balance to 0
  walletLocked: { type: Boolean, default: false }, // New field to lock/unlock wallet
});

// Hash the password before saving
UserSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

// Compare candidate password with the stored hashed password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
export const User = mongoose.model<IUser>('User', UserSchema);
