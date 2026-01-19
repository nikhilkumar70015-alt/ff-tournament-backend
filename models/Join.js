import mongoose from "mongoose";

const joinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true
    },

    status: {
      type: String,
      enum: ["joined", "disqualified", "completed"],
      default: "joined"
    },

    result: {
      rank: {
        type: Number,
        default: null
      },
      kills: {
        type: Number,
        default: null
      },
      screenshot: {
        type: String,
        default: null
      }
    },

    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/**
 * 🚫 Prevent same user from joining same tournament twice
 */
joinSchema.index({ user: 1, tournament: 1 }, { unique: true });

const Join = mongoose.model("Join", joinSchema);

export default Join;
