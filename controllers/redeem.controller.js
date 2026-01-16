const RedeemRequest = require("../models/RedeemRequest");
const User = require("../models/User");

/* ================= USER ================= */

// Create redeem request
exports.createRedeemRequest = async (req, res) => {
  try {
    const { method, coins, upiId, playCodeValue } = req.body;

    if (!method || !coins) {
      return res.status(400).json({ message: "Method and coins required" });
    }

    if (method === "upi" && !upiId) {
      return res.status(400).json({ message: "UPI ID required" });
    }

    if (method === "google_play" && !playCodeValue) {
      return res.status(400).json({ message: "Play code value required" });
    }

    const user = await User.findById(req.user.id);
    if (user.coins < coins) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    const request = await RedeemRequest.create({
      user: req.user.id,
      method,
      coins,
      upiId: method === "upi" ? upiId : undefined,
      playCodeValue: method === "google_play" ? playCodeValue : undefined
    });

    res.json({ message: "Redeem request submitted", request });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= ADMIN ================= */

// Get pending redeem requests
exports.getPendingRedeems = async (req, res) => {
  const requests = await RedeemRequest.find({ status: "pending" })
    .populate("user", "email username coins");
  res.json(requests);
};

// Approve redeem request (coins deduct here)
exports.approveRedeem = async (req, res) => {
  const { id } = req.params;

  const request = await RedeemRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (request.status !== "pending") {
    return res.status(400).json({ message: "Already processed" });
  }

  const user = await User.findById(request.user);
  if (user.coins < request.coins) {
    return res.status(400).json({ message: "User has insufficient coins" });
  }

  // Deduct coins on approve
  user.coins -= request.coins;
  request.status = "approved";

  await user.save();
  await request.save();

  res.json({ message: "Redeem approved and coins deducted" });
};

// Reject redeem request
exports.rejectRedeem = async (req, res) => {
  const { id } = req.params;
  const { adminNote } = req.body;

  const request = await RedeemRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = "rejected";
  request.adminNote = adminNote || "Rejected by admin";
  await request.save();

  res.json({ message: "Redeem request rejected" });
};
