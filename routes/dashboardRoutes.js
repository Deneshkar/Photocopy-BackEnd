const express = require("express");
const {
  getDashboardSummary,
  getLowStockProducts,
} = require("../controllers/dashboardController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", protect, adminOnly, getDashboardSummary);
router.get("/low-stock", protect, adminOnly, getLowStockProducts);

module.exports = router;