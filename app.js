const path = require("node:path");
const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/products", require("./routes/productRoutes"));
  app.use("/api/orders", require("./routes/orderRoutes"));
  app.use("/api/print-requests", require("./routes/printRequestRoutes"));
  app.use("/api/dashboard", require("./routes/dashboardRoutes"));

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "API is healthy",
    });
  });

  app.get("/", (req, res) => {
    res.json({ message: "Backend is running successfully" });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
