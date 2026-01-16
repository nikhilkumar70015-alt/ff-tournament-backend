const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
  createRedeemRequest,
  getPendingRedeems,
  approveRedeem,
  rejectRedeem
} = require("../controllers/redeem.controller");

/* USER */
router.post("/request", auth, createRedeemRequest);

/* ADMIN */
router.get("/pending", auth, admin, getPendingRedeems);
router.post("/approve/:id", auth, admin, approveRedeem);
router.post("/reject/:id", auth, admin, rejectRedeem);

module.exports = router;
