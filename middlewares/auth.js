import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * 🔐 AUTH MIDDLEWARE
 * Protected routes ke liye
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Token format: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user (without password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found"
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned"
      });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid"
    });
  }
};

export default authMiddleware;
