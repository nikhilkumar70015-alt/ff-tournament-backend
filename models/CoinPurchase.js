const mongoose = require("mongoose");

const coinPurchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amountINR: {
    type: Number,
    required: true
  },
  coins: {
    type: Number,
    required: true
  },
  utr: {
    type: String,
    required: true
  },
  screenshotUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("CoinPurchase", coinPurchaseSchema);
