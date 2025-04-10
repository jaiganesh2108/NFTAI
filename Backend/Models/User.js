const mongoose=require("mongoose")

const userSchema = new mongoose.Schema({
  username: String,
  walletAddress: String,
  tokens: Number,
  streak: Number,
  contributions: Number,
  lastContributionDate: Date,
});

const User= mongoose.model('User', userSchema);
module.exports = User