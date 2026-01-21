import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

/**
 * 🔐 Helper: Generate JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

/**
 * 📝 REGISTER
 * POST /api/auth/register
 */
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, freeFireUID } = req.body;

    if (!username || !email || !password || !freeFireUID) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      freeFireUID
    });

    // Create wallet for user
    await Wallet.create({
      user: user._id,
      coinsBalance: 0,
      cashBalance: 0,
      transactions: []
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token: generateToken(user),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        freeFireUID: user.freeFireUID,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 🔑 LOGIN
 * POST /api/auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user + include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned"
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        freeFireUID: user.freeFireUID,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
