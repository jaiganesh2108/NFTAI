const mongoose=require("mongoose")

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

const Model=mongoose.model('Model', modelSchema);
module.exports = Model