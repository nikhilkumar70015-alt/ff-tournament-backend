require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const email = process.env.ADMIN_EMAIL;      // 👈 change kar sakte ho
    const plainPassword = process.env.ADMIN_PASSWORD;    // 👈 change kar sakte ho

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await Admin.create({
      email,
      password: hashedPassword
    });

    console.log("🎉 ADMIN CREATED SUCCESSFULLY");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", plainPassword);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

createAdmin();
