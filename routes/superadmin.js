import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

/**
 * SUPERADMIN → CREATE ADMIN
 * POST /api/superadmin/create-admin
 * Only superadmin can create admin
 */
router.post(
  "/create-admin",
  authMiddleware,
  async (req, res, next) => {
    try {
      // 🔒 Only superadmin allowed
      if (req.user.role !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Superadmin access only",
        });
      }

      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const admin = await User.create({
        username,
        email,
        password,
        role: "admin",
        permissions: {
          manageTournaments: true,
          manageWithdrawals: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Admin created successfully",
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
// ✅ GET ALL ADMINS (superadmin only)
router.get(
  "/admins",
  authMiddleware,
  async (req, res) => {
    try {
      // 🔒 only superadmin
      if (req.user.role !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Superadmin access only",
        });
      }

      const admins = await User.find(
        { role: "admin" },
        "-password"
      ).sort({ createdAt: -1 });

      res.json({
        success: true,
        admins,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;
