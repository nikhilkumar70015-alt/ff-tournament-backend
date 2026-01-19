import express from "express";
import mongoose from "mongoose";
import Tournament from "../models/Tournament.js";
import Join from "../models/Join.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

/**
 * 📋 GET ALL TOURNAMENTS (Upcoming + Live)
 * GET /api/tournaments
 */
router.get("/", async (req, res, next) => {
  try {
    const tournaments = await Tournament.find({
      status: { $in: ["upcoming", "live"] }
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: tournaments
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 🎮 GET MY TOURNAMENTS
 * GET /api/tournaments/my
 */
router.get("/my", authMiddleware, async (req, res, next) => {
  try {
    const myMatches = await Join.find({ user: req.user.id })
      .populate("tournament")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: myMatches
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ➕ JOIN TOURNAMENT
 * POST /api/tournaments/:id/join
 */
router.post("/:id/join", authMiddleware, async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tournament = await Tournament.findById(req.params.id).session(session);

    if (!tournament) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Tournament not found"
      });
    }

    if (tournament.status !== "upcoming") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Tournament already started or finished"
      });
    }

    if (tournament.joinedPlayers >= tournament.maxPlayers) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Tournament is full"
      });
    }

    // Check already joined
    const alreadyJoined = await Join.findOne({
      user: req.user.id,
      tournament: tournament._id
    }).session(session);

    if (alreadyJoined) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "You have already joined this tournament"
      });
    }

    // Wallet check
    const wallet = await Wallet.findOne({ user: req.user.id }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Wallet not found"
      });
    }

    // Paid tournament
    if (tournament.entryType === "coins") {
      if (wallet.coinsBalance < tournament.entryFee) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Insufficient coins"
        });
      }

      wallet.coinsBalance -= tournament.entryFee;
      wallet.transactions.push({
        type: "JOIN_TOURNAMENT",
        amount: tournament.entryFee,
        currency: "coins",
        reference: tournament._id.toString(),
        description: "Joined tournament"
      });

      await wallet.save({ session });
    }

    // Create join entry
    await Join.create(
      [
        {
          user: req.user.id,
          tournament: tournament._id
        }
      ],
      { session }
    );

    // Update tournament count
    tournament.joinedPlayers += 1;
    await tournament.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Successfully joined tournament"
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

/**
 * 🔑 GET ROOM ID & PASSWORD (Only Joined Users)
 * GET /api/tournaments/:id/room
 */
router.get("/:id/room", authMiddleware, async (req, res, next) => {
  try {
    const joined = await Join.findOne({
      user: req.user.id,
      tournament: req.params.id
    });

    if (!joined) {
      return res.status(403).json({
        success: false,
        message: "You have not joined this tournament"
      });
    }

    const tournament = await Tournament.findById(req.params.id);

    if (!tournament.roomId || !tournament.roomPassword) {
      return res.status(400).json({
        success: false,
        message: "Room details not available yet"
      });
    }

    // Optional time lock
    if (
      tournament.roomVisibleAt &&
      new Date() < new Date(tournament.roomVisibleAt)
    ) {
      return res.status(400).json({
        success: false,
        message: "Room details will be available shortly"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        roomId: tournament.roomId,
        roomPassword: tournament.roomPassword,
        startTime: tournament.startTime
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
