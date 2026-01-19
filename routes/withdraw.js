import express from "express";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

/**
 * 🛡️ ADMIN CHECK (inline, final)
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }
  next();
};

/**
 * 💸 USER WITHDRAW REQUEST
 * POST /api/withdraw/request
 */
router.post("/request", authMiddleware, async (req, res, next) => {
  try {
    const { amount, method, upiId } = req.body;

    if (!amount || amount <= 0 || !method) {
      return res.status(400).json({
        success: false,
        message: "Valid amount and method are required"
      });
    }

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found"
      });
    }

    if (wallet.cashBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient cash balance"
      });
    }

    // Deduct cash immediately (safe hold)
    wallet.cashBalance -= amount;
    wallet.transactions.push({
      type: "WITHDRAW_REQUEST",
      amount,
      currency: "cash",
      reference: upiId || "",
      description: `Withdraw request via ${method}`
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Withdraw request submitted successfully"
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ✅ ADMIN APPROVE / REJECT WITHDRAW
 * POST /api/withdraw/admin/action
 */
router.post(
  "/admin/action",
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const { userId, amount, action } = req.body;
      // action = "approve" | "reject"

      if (!userId || !amount || !action) {
        return res.status(400).json({
          success: false,
          message: "userId, amount and action are required"
        });
      }

      const wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: "Wallet not found"
        });
      }

      if (action === "approve") {
        wallet.transactions.push({
          type: "WITHDRAW_APPROVED",
          amount,
          currency: "cash",
          reference: "ADMIN_APPROVED",
          description: "Withdraw approved by admin"
        });
      }

      if (action === "reject") {
        // Refund cash back
        wallet.cashBalance += amount;
        wallet.transactions.push({
          type: "WITHDRAW_REJECTED",
          amount,
          currency: "cash",
          reference: "ADMIN_REJECTED",
          description: "Withdraw rejected and refunded"
        });
      }

      await wallet.save();

      res.status(200).json({
        success: true,
        message:
          action === "approve"
            ? "Withdraw approved successfully"
            : "Withdraw rejected and refunded"
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
