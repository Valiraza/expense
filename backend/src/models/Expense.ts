import mongoose, { Schema } from 'mongoose';

const expenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String },
  notes: { type: String },
}, { timestamps: true });

expenseSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Expense', expenseSchema);
