const express = require("express");
const { generatePrintAssist } = require("../controllers/aiController");

const router = express.Router();

// POST /api/ai/print-assist
router.post("/print-assist", generatePrintAssist);

module.exports = router;