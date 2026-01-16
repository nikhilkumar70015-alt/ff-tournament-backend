const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdminIfNotExists = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing");
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log("✅ Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    email: adminEmail,
    password: hashedPassword,
    username: "admin",
    inGameName: "ADMIN",
    coins: 0,
    isAdmin: true
  });

  console.log("🔥 Admin user created successfully");
};

module.exports = createAdminIfNotExists;
