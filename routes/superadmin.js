router.post(
  "/create-admin",
  authMiddleware,
  async (req, res) => {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Superadmin access only"
      });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const admin = await User.create({
      username,
      email,
      password,
      role: "admin"
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      adminId: admin._id
    });
  }
);

export default router;
