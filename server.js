require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const createAdminIfNotExists = require("./config/createAdmin");

connectDB().then(() => {
  createAdminIfNotExists();
});

app.use("/api/auth", require("./routes/auth.routes"));
// (tournament, coins, redeem routes yahin add honge – logic locked)
app.use("/api/coins", require("./routes/coins.routes"));
app.use("/api/tournaments", require("./routes/tournament.routes"));
app.use("/api/redeem", require("./routes/redeem.routes"));
app.use("/api/users", require("./routes/users.routes"));

app.get("/", (req, res) => {
  res.send("🔥 Free Fire Tournament Backend Running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
