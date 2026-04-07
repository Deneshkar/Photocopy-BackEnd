const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const PrintRequest = require("../models/PrintRequest");

// Get admin dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalPrintRequests = await PrintRequest.countDocuments();

    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({ status: "processing" });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    const pendingPrintRequests = await PrintRequest.countDocuments({ status: "pending" });
    const acceptedPrintRequests = await PrintRequest.countDocuments({ status: "accepted" });
    const printingPrintRequests = await PrintRequest.countDocuments({ status: "printing" });
    const completedPrintRequests = await PrintRequest.countDocuments({ status: "completed" });
    const rejectedPrintRequests = await PrintRequest.countDocuments({ status: "rejected" });

    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalCustomers = await User.countDocuments({ role: "customer" });

    const completedOrderList = await Order.find({ status: "completed" }).select("totalPrice");
    const totalRevenue = completedOrderList.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalCustomers,
      totalProducts,
      totalOrders,
      totalPrintRequests,
      totalRevenue,
      orders: {
        pending: pendingOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      printRequests: {
        pending: pendingPrintRequests,
        accepted: acceptedPrintRequests,
        printing: printingPrintRequests,
        completed: completedPrintRequests,
        rejected: rejectedPrintRequests,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .select("name category stock price isAvailable");

    res.status(200).json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getLowStockProducts,
};