const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const User = require("../models/User");

// Get all users (ADMIN ONLY)
router.get("/", auth, admin, async (req, res) => {
  try {
    const users = await User.find()
      .select("email username inGameName coins isAdmin createdAt");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
