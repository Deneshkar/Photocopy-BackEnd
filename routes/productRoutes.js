const express = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post("/", protect, adminOnly, upload.single("file"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("file"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;