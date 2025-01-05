import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
    userId: Types.ObjectId; // Use Types.ObjectId for references
    type: 'credit' | 'debit';
    amount: number;
    timestamp: Date;
    description?: string;
}

  const TransactionSchema = new Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Correct type
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    description: { type: String },
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
