const Tournament = require("../models/Tournament");
const User = require("../models/User");

/* ================= USER ================= */

// Get tournaments
exports.getTournaments = async (req, res) => {
  const tournaments = await Tournament.find({ status: "upcoming" });
  res.json(tournaments);
};

// Join tournament
exports.joinTournament = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const tournament = await Tournament.findById(id);
  if (!tournament) {
    return res.status(404).json({ message: "Tournament not found" });
  }

  if (tournament.participants.includes(userId)) {
    return res.status(400).json({ message: "Already joined" });
  }

  const user = await User.findById(userId);

  // Paid tournament
  if (tournament.type === "paid") {
    if (user.coins < tournament.entryCoins) {
      return res.status(400).json({ message: "Not enough coins" });
    }
    user.coins -= tournament.entryCoins;
    await user.save();
  }

  tournament.participants.push(userId);
  await tournament.save();

  res.json({ message: "Joined tournament successfully" });
};

/* ================= ADMIN ================= */

// Create tournament
exports.createTournament = async (req, res) => {
  const tournament = await Tournament.create(req.body);
  res.json({ message: "Tournament created", tournament });
};

// Add room details
exports.addRoomDetails = async (req, res) => {
  const { id } = req.params;
  const { roomId, roomPassword } = req.body;

  const tournament = await Tournament.findById(id);
  if (!tournament) {
    return res.status(404).json({ message: "Tournament not found" });
  }

  tournament.roomId = roomId;
  tournament.roomPassword = roomPassword;
  tournament.status = "ongoing";

  await tournament.save();
  res.json({ message: "Room details added" });
};

// ✅ COMPLETE TOURNAMENT (PER KILL + RANK PRIZE)
exports.completeTournament = async (req, res) => {
  const { id } = req.params;
  const { results } = req.body;
  /*
    results = [
      { userId, kills, rank }
    ]
  */

  const tournament = await Tournament.findById(id);
  if (!tournament) {
    return res.status(404).json({ message: "Tournament not found" });
  }

  for (const r of results) {
    const user = await User.findById(r.userId);
    if (!user) continue;

    let coins = r.kills * tournament.perKillCoins;

    if (r.rank === 1) coins += tournament.prizes.first;
    if (r.rank === 2) coins += tournament.prizes.second;
    if (r.rank === 3) coins += tournament.prizes.third;

    user.coins += coins;
    await user.save();
  }

  tournament.status = "completed";
  await tournament.save();

  res.json({ message: "Tournament completed & rewards distributed" });
};
