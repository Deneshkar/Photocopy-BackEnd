const mongoose = require("mongoose");

const printRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    file: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    copies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    printType: {
      type: String,
      enum: ["black_white", "color"],
      default: "black_white",
    },
    paperSize: {
      type: String,
      enum: ["A4", "A3", "Letter"],
      default: "A4",
    },
    sides: {
      type: String,
      enum: ["single", "double"],
      default: "single",
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "printing", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrintRequest", printRequestSchema);