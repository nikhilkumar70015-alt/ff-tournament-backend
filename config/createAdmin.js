const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdminIfNotExists = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("❌ ADMIN_EMAIL / ADMIN_PASSWORD missing");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("✅ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashedPassword,
    username: "admin",
    inGameName: "ADMIN",
    role: "admin",        // 🔥 VERY IMPORTANT
    coins: 0
  });

  console.log("🔥 Admin created successfully");
};

module.exports = createAdminIfNotExists;
