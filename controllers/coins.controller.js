const CoinPurchase = require("../models/CoinPurchase");
const User = require("../models/User");

/* ================= USER ================= */

// Create coin purchase request
exports.createCoinRequest = async (req, res) => {
  try {
    const { amountINR, coins, utr, screenshotUrl } = req.body;

    if (!amountINR || !coins || !utr || !screenshotUrl) {
      return res.status(400).json({ message: "All fields required" });
    }

    const request = await CoinPurchase.create({
      user: req.user.id,
      amountINR,
      coins,
      utr,
      screenshotUrl
    });

    res.json({
      message: "Coin purchase request submitted",
      request
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= ADMIN ================= */

// Get all pending requests
exports.getPendingRequests = async (req, res) => {
  const requests = await CoinPurchase.find({ status: "pending" })
    .populate("user", "email username coins");

  res.json(requests);
};

// Approve coin request
exports.approveRequest = async (req, res) => {
  const { id } = req.params;

  const request = await CoinPurchase.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (request.status !== "pending") {
    return res.status(400).json({ message: "Already processed" });
  }

  const user = await User.findById(request.user);
  user.coins += request.coins;

  request.status = "approved";

  await user.save();
  await request.save();

  res.json({ message: "Coins credited successfully" });
};

// Reject coin request
exports.rejectRequest = async (req, res) => {
  const { id } = req.params;

  const request = await CoinPurchase.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = "rejected";
  await request.save();

  res.json({ message: "Request rejected" });
};
