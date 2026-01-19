import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    game: {
      type: String,
      default: "Free Fire",
      immutable: true // sirf Free Fire allowed
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    matchType: {
      type: String,
      enum: ["solo", "duo", "squad"],
      required: true
    },

    entryType: {
      type: String,
      enum: ["free", "coins"],
      required: true
    },

    entryFee: {
      type: Number,
      default: 0
    },

    prizePool: {
      type: Number,
      required: true
    },

    maxPlayers: {
      type: Number,
      required: true
    },

    joinedPlayers: {
      type: Number,
      default: 0
    },

    rules: {
      type: String,
      required: true
    },

    startTime: {
      type: Date,
      required: true
    },

    roomId: {
      type: String,
      default: null
    },

    roomPassword: {
      type: String,
      default: null
    },

    roomVisibleAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;
