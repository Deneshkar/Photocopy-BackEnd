const express = require("express");
const {
  getProfitSummary,
  getProfitEntries,
  createProfitEntry,
  updateProfitEntry,
  deleteProfitEntry,
} = require("../controllers/profitController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", protect, adminOnly, getProfitSummary);
router.get("/entries", protect, adminOnly, getProfitEntries);
router.post("/entries", protect, adminOnly, createProfitEntry);
router.put("/entries/:id", protect, adminOnly, updateProfitEntry);
router.delete("/entries/:id", protect, adminOnly, deleteProfitEntry);

module.exports = router;