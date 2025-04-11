const express=require("express")
const router=express.Router()
const User=require("../Models/User.js")
const Model=require("../Models/Model.js")

router.post('/upload-model', async (req, res) => {
  try {
    const {
      userId,
      name,
      description,
      category,
      price,
      isNFT,
      blockchain,
    } = req.body;
    
    // 1. Save uploaded model
    const newModel = await Model.create({
      name,
      description,
      category,
      price,
      isNFT,
      status: 'published',
      blockchain,
      userId,
    });

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Update user contributions
    user.contributions += 1;

    // 3. Update streak (contribution must be on consecutive days)
    const today = new Date().toDateString();
    const last = new Date(user.lastContributionDate || 0).toDateString();

    if (today !== last) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (new Date(last).toDateString() === yesterday.toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }

      user.lastContributionDate = new Date();
    }

    // 4. Reward tokens for contribution
    user.tokens += 50;

    await user.save();

    return res.status(201).json({
      message: 'Model uploaded and profile updated',
      model: newModel,
      updatedProfile: {
        tokens: user.tokens,
        streak: user.streak,
        contributions: user.contributions,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

module.exports=router