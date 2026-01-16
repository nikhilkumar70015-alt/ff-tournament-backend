const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
  getTournaments,
  joinTournament,
  createTournament,
  addRoomDetails,
  completeTournament
} = require("../controllers/tournament.controller");

/* USER */
router.get("/", auth, getTournaments);
router.post("/join/:id", auth, joinTournament);

/* ADMIN */
router.post("/create", auth, admin, createTournament);
router.post("/room/:id", auth, admin, addRoomDetails);
router.post("/complete/:id", auth, admin, completeTournament);

module.exports = router;
