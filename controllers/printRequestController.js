const PrintRequest = require("../models/PrintRequest");

const PRINT_REQUEST_STATUSES = new Set([
  "pending",
  "accepted",
  "printing",
  "completed",
  "rejected",
]);

const normalizeUploadPath = (filePath = "") => filePath.replace(/\\/g, "/");

// Create print request
const createPrintRequest = async (req, res) => {
  try {
    const { customerName, phone, copies, printType, paperSize, sides, note } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    if (!customerName || !phone) {
      return res
        .status(400)
        .json({ message: "Customer name and phone are required" });
    }

    const printRequest = await PrintRequest.create({
      user: req.user._id,
      customerName,
      phone,
      file: normalizeUploadPath(req.file.path),
      originalFileName: req.file.originalname,
      copies: Number(copies) || 1,
      printType: printType || "black_white",
      paperSize: paperSize || "A4",
      sides: sides || "single",
      note: note || "",
    });

    res.status(201).json({
      message: "Print request created successfully",
      printRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user's print requests
const getMyPrintRequests = async (req, res) => {
  try {
    const requests = await PrintRequest.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all print requests (admin) with filters
const getAllPrintRequests = async (req, res) => {
  try {
    const { status, customerName, printType, paperSize } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (customerName) {
      query.customerName = { $regex: customerName, $options: "i" };
    }

    if (printType) {
      query.printType = printType;
    }

    if (paperSize) {
      query.paperSize = paperSize;
    }

    const requests = await PrintRequest.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single print request
const getPrintRequestById = async (req, res) => {
  try {
    const request = await PrintRequest.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!request) {
      return res.status(404).json({ message: "Print request not found" });
    }

    if (
      req.user.role !== "admin" &&
      request.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update print request status (admin)
const updatePrintRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PrintRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Print request not found" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!PRINT_REQUEST_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid print request status" });
    }

    request.status = status;
    const updatedRequest = await request.save();

    res.status(200).json({
      message: "Print request status updated successfully",
      printRequest: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete print request
const deletePrintRequest = async (req, res) => {
  try {
    const request = await PrintRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Print request not found" });
    }

    await request.deleteOne();

    res.status(200).json({ message: "Print request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPrintRequest,
  getMyPrintRequests,
  getAllPrintRequests,
  getPrintRequestById,
  updatePrintRequestStatus,
  deletePrintRequest,
};
