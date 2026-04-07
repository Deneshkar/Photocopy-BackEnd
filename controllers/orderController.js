const Order = require("../models/Order");
const Product = require("../models/Product");

const ORDER_STATUSES = new Set([
  "pending",
  "processing",
  "completed",
  "cancelled",
]);

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const rollbackReservedStock = async (reservedItems) => {
  for (const item of reservedItems) {
    const restoredProduct = await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity } },
      { new: true }
    );

    if (
      restoredProduct &&
      restoredProduct.stock > 0 &&
      !restoredProduct.isAvailable
    ) {
      restoredProduct.isAvailable = true;
      await restoredProduct.save();
    }
  }
};

const reserveProductStock = async (productId, quantity) => {
  const reservedProduct = await Product.findOneAndUpdate(
    {
      _id: productId,
      stock: { $gte: quantity },
      isAvailable: true,
    },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!reservedProduct) {
    const existingProduct = await Product.findById(productId).select(
      "name stock isAvailable"
    );

    if (!existingProduct) {
      throw createHttpError(404, `Product not found: ${productId}`);
    }

    if (!existingProduct.isAvailable || existingProduct.stock <= 0) {
      throw createHttpError(
        400,
        `Product is unavailable: ${existingProduct.name}`
      );
    }

    throw createHttpError(
      400,
      `Not enough stock for product: ${existingProduct.name}`
    );
  }

  if (reservedProduct.stock === 0 && reservedProduct.isAvailable) {
    reservedProduct.isAvailable = false;
    await reservedProduct.save();
  }

  return reservedProduct;
};

// Create order
const createOrder = async (req, res) => {
  const reservedItems = [];

  try {
    const { orderItems, customerName, phone, deliveryAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    if (!customerName || !phone || !deliveryAddress) {
      return res
        .status(400)
        .json({ message: "Please fill all customer details" });
    }

    let totalPrice = 0;
    const finalOrderItems = [];

    for (const item of orderItems) {
      const quantity = Number(item.quantity);

      if (!item.product || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Each order item must include a valid product and quantity",
        });
      }

      const product = await reserveProductStock(item.product, quantity);

      reservedItems.push({
        productId: product._id,
        quantity,
      });

      finalOrderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
      });

      totalPrice += product.price * quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems: finalOrderItems,
      totalPrice,
      customerName,
      phone,
      deliveryAddress,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    if (reservedItems.length > 0) {
      try {
        await rollbackReservedStock(reservedItems);
      } catch (rollbackError) {
        console.error("Order stock rollback failed:", rollbackError.message);
      }
    }

    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin) with filters
const getAllOrders = async (req, res) => {
  try {
    const { status, customerName } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (customerName) {
      query.customerName = { $regex: customerName, $options: "i" };
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!ORDER_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
