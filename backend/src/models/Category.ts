import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
