const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdminIfNotExists = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.log("⚠️ Admin env variables not set");
    return;
  }

  const existingAdmin = await User.findOne({
    email: process.env.ADMIN_EMAIL,
    role: "admin",
  });

  if (existingAdmin) {
    console.log("✅ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    10
  );

  await User.create({
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  console.log("🔥 Admin account auto-created");
};

module.exports = createAdminIfNotExists;
