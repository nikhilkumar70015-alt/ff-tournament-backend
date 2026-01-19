import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // ek user ka ek hi wallet
    },

    coinsBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    cashBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    transactions: [
      {
        type: {
          type: String,
          enum: [
            "JOIN_TOURNAMENT",
            "WIN_REWARD",
            "ADMIN_CREDIT",
            "ADMIN_DEBIT",
            "WITHDRAW_REQUEST",
            "WITHDRAW_APPROVED",
            "WITHDRAW_REJECTED"
          ],
          required: true
        },

        amount: {
          type: Number,
          required: true
        },

        currency: {
          type: String,
          enum: ["coins", "cash"],
          required: true
        },

        reference: {
          type: String,
          default: null // tournamentId / withdrawId / admin note
        },

        description: {
          type: String,
          default: ""
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
