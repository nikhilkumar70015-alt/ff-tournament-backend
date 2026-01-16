const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["free", "paid"],
    required: true
  },

  entryCoins: {
    type: Number,
    default: 0
  },

  // 🔥 NEW: PER KILL COINS
  perKillCoins: {
    type: Number,
    default: 0
  },

  // 🔥 NEW: RANK WISE PRIZES
  prizes: {
    first: { type: Number, default: 0 },
    second: { type: Number, default: 0 },
    third: { type: Number, default: 0 }
  },

  matchTime: {
    type: Date,
    required: true
  },

  roomId: String,
  roomPassword: String,

  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  }

}, { timestamps: true });

module.exports = mongoose.model("Tournament", tournamentSchema);
