const express = require("express");
const {
  createPrintRequest,
  getMyPrintRequests,
  getAllPrintRequests,
  getPrintRequestById,
  updatePrintRequestStatus,
  deletePrintRequest,
} = require("../controllers/printRequestController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Customer routes
router.post("/", protect, upload.single("file"), createPrintRequest);
router.get("/my-requests", protect, getMyPrintRequests);
router.get("/:id", protect, getPrintRequestById);

// Admin routes
router.get("/", protect, adminOnly, getAllPrintRequests);
router.put("/:id/status", protect, adminOnly, updatePrintRequestStatus);
router.delete("/:id", protect, adminOnly, deletePrintRequest);

module.exports = router;