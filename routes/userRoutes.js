const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// Logged-in user profile route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route accessed",
    user: req.user,
  });
});

// Admin user management routes
router.get("/", protect, adminOnly, getAllUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;