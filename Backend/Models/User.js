import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  walletAddress: String,
  tokens: Number,
  streak: Number,
  contributions: Number,
  lastContributionDate: Date,
});

export default mongoose.model('User', userSchema);