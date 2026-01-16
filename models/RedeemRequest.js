const mongoose = require("mongoose");

const redeemRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  method: {
    type: String,
    enum: ["upi", "google_play"],
    required: true
  },
  coins: {
    type: Number,
    required: true
  },
  upiId: {
    type: String // required only if method = upi
  },
  playCodeValue: {
    type: Number // required only if method = google_play (e.g., 50/100/200)
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  adminNote: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("RedeemRequest", redeemRequestSchema);
