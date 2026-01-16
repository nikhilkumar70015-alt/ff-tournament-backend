const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
  createCoinRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest
} = require("../controllers/coins.controller");

/* USER */
router.post("/buy", auth, createCoinRequest);

/* ADMIN */
router.get("/pending", auth, admin, getPendingRequests);
router.post("/approve/:id", auth, admin, approveRequest);
router.post("/reject/:id", auth, admin, rejectRequest);

module.exports = router;
