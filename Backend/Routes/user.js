const express=require("express")
const User=require("../Models/User.js")

const router = express.Router();

// Save or get user
router.post("/wallet", async (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address required" });
  }

  try {
    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({ walletAddress });
      await user.save();
      console.log("New user saved to DB");
    } else {
      console.log("User already exists in DB");
    }

    return res.json({ user });
  } catch (error) {
    console.error("Error in wallet route:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports=router