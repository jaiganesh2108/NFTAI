const express=require("express")
const User=require("../Models/User.js")

const router = express.Router();

// Save or get user
router.post("/wallet", async (req, res) => {
    const { walletAddress } = req.body;
  
    if (!walletAddress) return res.status(400).json({ error: "Wallet address is required" });
  
    try {
      let user = await User.findOne({ walletAddress });
  
      if (!user) {
        user = new User({
          walletAddress,
          username: "Anonymous",
          bio: "",
          contributions: 0,
          streak: 0,
          tokens: 0
        });
        await user.save();
      }
  
      return res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // PUT update profile
router.put("/wallet/:address", async (req, res) => {
    const { address } = req.params;
    const { username, bio } = req.body;
  
    try {
      const user = await User.findOneAndUpdate(
        { walletAddress: address },
        { username, bio },
        { new: true }
      );
  
      if (!user) return res.status(404).json({ error: "User not found" });
  
      return res.json({ user });
    } catch (err) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

module.exports=router