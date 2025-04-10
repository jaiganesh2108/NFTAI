import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  price: Number,
  status: String,
  isNFT: Boolean,
  blockchain: String,
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('Model', modelSchema);