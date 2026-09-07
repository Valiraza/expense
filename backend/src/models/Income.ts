import mongoose, { Schema } from 'mongoose';

const incomeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String },
}, { timestamps: true });

incomeSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Income', incomeSchema);
