require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const createAdminIfNotExists = require("./config/createAdmin");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 ADMIN PANEL (STATIC)
app.use("/admin", express.static(path.join(__dirname, "admin-panel")));

// 🔗 ROUTES
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/coins", require("./routes/coins.routes"));
app.use("/api/tournaments", require("./routes/tournament.routes"));
app.use("/api/redeem", require("./routes/redeem.routes"));
app.use("/api/users", require("./routes/users.routes"));

// ✅ DB CONNECT + ADMIN CREATE
connectDB().then(async () => {
  await createAdminIfNotExists();
  console.log("✅ Admin checked/created");
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("🔥 Free Fire Tournament Backend Running");
});

// START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
