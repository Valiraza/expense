import mongoose, { Schema } from 'mongoose';

const budgetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
}, { timestamps: true });

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
