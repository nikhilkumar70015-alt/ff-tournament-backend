const Tournament = require("../models/Tournament");
const User = require("../models/User");

/* ========== USER ========== */

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

  // PAID TOURNAMENT
  if (tournament.type === "paid") {
    if (user.coins < tournament.entryCoins) {
      return res.status(400).json({ message: "Not enough coins" });
    }
    user.coins -= tournament.entryCoins;
    await user.save();
  }

  // FREE TOURNAMENT → ad handled by app, backend trusts app
  tournament.participants.push(userId);
  await tournament.save();

  res.json({ message: "Joined tournament successfully" });
};


/* ========== ADMIN ========== */

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

// Complete tournament & give prize
exports.completeTournament = async (req, res) => {
  const { id } = req.params;
  const { winnerUserId } = req.body;

  const tournament = await Tournament.findById(id);
  if (!tournament) {
    return res.status(404).json({ message: "Tournament not found" });
  }

  const winner = await User.findById(winnerUserId);
  winner.coins += tournament.prizeCoins;

  tournament.status = "completed";

  await winner.save();
  await tournament.save();

  res.json({ message: "Tournament completed & prize credited" });
};
