import express from "express";
import Tournament from "../models/Tournament.js";
import Join from "../models/Join.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import authMiddleware from "../middlewares/auth.js";
import adminOnly from "../middlewares/adminOnly.js";
import superAdminOnly from "../middlewares/superAdminOnly.js";
import permissionCheck from "../middlewares/permission.js";

const router = express.Router();

/**
 * 🛡️ ADMIN CHECK MIDDLEWARE (inline, final)
 */


/**
 * ➕ CREATE TOURNAMENT
 * POST /api/admin/tournaments
 */
router.post(
  "/tournaments",
  authMiddleware,
  adminOnly,
  permissionCheck("mangaeTournaments"),
  async (req, res, next) => {
    try {
      const {
        title,
        matchType,
        entryType,
        entryFee,
        prizePool,
        maxPlayers,
        rules,
        startTime
      } = req.body;

      if (
        !title ||
        !matchType ||
        !entryType ||
        !prizePool ||
        !maxPlayers ||
        !rules ||
        !startTime
      ) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be provided"
        });
      }

      const tournament = await Tournament.create({
        title,
        matchType,
        entryType,
        entryFee: entryType === "coins" ? entryFee : 0,
        prizePool,
        maxPlayers,
        rules,
        startTime,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: "Tournament created successfully",
        data: tournament
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 🔑 ADD / UPDATE ROOM ID & PASSWORD
 * PUT /api/admin/tournaments/:id/room
 */
router.put(
  "/tournaments/:id/room",
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const { roomId, roomPassword, roomVisibleAt } = req.body;

      if (!roomId || !roomPassword) {
        return res.status(400).json({
          success: false,
          message: "Room ID and password are required"
        });
      }

      const tournament = await Tournament.findByIdAndUpdate(
        req.params.id,
        {
          roomId,
          roomPassword,
          roomVisibleAt: roomVisibleAt || new Date(),
          status: "live"
        },
        { new: true }
      );

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Room details updated",
        data: tournament
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 🏆 DECLARE WINNERS & DISTRIBUTE REWARDS
 * POST /api/admin/tournaments/:id/results
 */
router.post(
  "/tournaments/:id/results",
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const { results } = req.body;
      // results = [{ userId, rank, rewardCoins, rewardCash }]

      if (!Array.isArray(results) || results.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Results array is required"
        });
      }

      const tournament = await Tournament.findById(req.params.id);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: "Tournament not found"
        });
      }

      for (const r of results) {
        // Update join result
        await Join.findOneAndUpdate(
          { user: r.userId, tournament: tournament._id },
          {
            status: "completed",
            "result.rank": r.rank
          }
        );

        // Credit wallet
        const wallet = await Wallet.findOne({ user: r.userId });
        if (!wallet) continue;

        if (r.rewardCoins && r.rewardCoins > 0) {
          wallet.coinsBalance += r.rewardCoins;
          wallet.transactions.push({
            type: "WIN_REWARD",
            amount: r.rewardCoins,
            currency: "coins",
            reference: tournament._id.toString(),
            description: "Tournament winning reward"
          });
        }

        if (r.rewardCash && r.rewardCash > 0) {
          wallet.cashBalance += r.rewardCash;
          wallet.transactions.push({
            type: "WIN_REWARD",
            amount: r.rewardCash,
            currency: "cash",
            reference: tournament._id.toString(),
            description: "Tournament winning reward"
          });
        }

        await wallet.save();
      }

      tournament.status = "completed";
      await tournament.save();

      res.status(200).json({
        success: true,
        message: "Results declared and rewards distributed"
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 🚫 BAN / UNBAN USER
 * PUT /api/admin/users/:id/ban
 */
router.put(
  "/users/:id/ban",
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const { ban } = req.body; // true / false

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isBanned: ban === true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        message: ban ? "User banned" : "User unbanned"
      });
    } catch (error) {
      next(error);
    }
  }
);
/**
 * 📊 ADMIN DASHBOARD STATS
 * GET /api/admin/dashboard
 */
router.get(
  "/dashboard",
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const tournamentsCount = await Tournament.countDocuments();
      const adminsCount = await User.countDocuments({role: "admin")};
      const usersCount = await User.countDocuments({ role: "user" });

      // Pending withdrawals = last transaction WITHDRAW_REQUEST
      const pendingWithdraws = await Wallet.countDocuments({
        "transactions.type": "WITHDRAW_REQUEST"
      });

      res.status(200).json({
        success: true,
        permissions: req.user.permissions || {},
        data: {
          tournaments: tournamentsCount,
          admins: adminsCount,
          users: usersCount,
          pendingWithdraws
        }
      });
    } catch (error) {
      next(error);
    }
  }
);
/**
 * 💸 GET ALL PENDING WITHDRAW REQUESTS (ADMIN)
 * GET /api/admin/withdrawals
 */
router.get(
  "/withdrawals",
  authMiddleware,
  adminOnly,
  permissionCheck("manageWithdrawals"),
  async (req, res, next) => {
    try {
      const wallets = await Wallet.find({
        "transactions.type": "WITHDRAW_REQUEST"
      }).populate("user", "email");

      const requests = [];

      wallets.forEach((wallet) => {
        wallet.transactions.forEach((tx) => {
          if (tx.type === "WITHDRAW_REQUEST") {
            requests.push({
              userId: wallet.user._id,
              email: wallet.user.email,
              amount: tx.amount,
              method: "UPI",
              upiId: tx.reference,
              createdAt: tx.createdAt
            });
          }
        });
      });

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }
);
/**
 * 👥 GET ALL USERS (ADMIN)
 * GET /api/admin/users
 */
router.get(
  "/users",
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const users = await User.find(
        { role: "user" },
        {
          username: 1,
          email: 1,
          freeFireUID: 1,
          isBanned: 1,
          createdAt: 1
        }
      ).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
