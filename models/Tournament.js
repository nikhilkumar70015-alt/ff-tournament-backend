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
  prizeCoins: {
    type: Number,
    required: true
  },
  matchTime: {
    type: Date,
    required: true
  },
  roomId: {
    type: String
  },
  roomPassword: {
    type: String
  },
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
