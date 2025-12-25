// server/server.js - UPDATED WITH NEW ROUTES
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/database");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://192.168.1.197:5173",
      "http://192.168.1.197:5174",
      "http://192.168.1.197:5175",
    ],
    credentials: true,
  })
);
// Increase payload size limit for images (base64 encoded)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

// Connect to MongoDB only when run directly
if (require.main === module) {
  connectDB();
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "🛒 Mini Supermarket API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      staff: "/api/staff",
      products: "/api/products",
      suppliers: "/api/suppliers",
      docs: "/api/docs",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "connected",
  });
});

// API Routes
// Authentication routes (Public)
app.use("/api/auth", require("./routes/authRoutes"));

// Other routes
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/delivery-orders", require("./routes/deliveryOrderRoutes"));
app.use("/api/carts", require("./routes/cartRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/damaged-products", require("./routes/damagedProductRoutes"));
app.use("/api/shelves", require("./routes/shelfRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/product-shelves", require("./routes/productShelfRoutes"));
app.use("/api/product-stocks", require("./routes/productStockRoutes"));
app.use("/api/product-batches", require("./routes/productBatchRoutes"));
app.use("/api/promotions", require("./routes/promotionRoutes"));
app.use("/api/feedbacks", require("./routes/feedbackRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🛒 MINI SUPERMARKET API SERVER     ║
║   🚀 Server running on port ${PORT}     ║
║   🌍 Environment: ${process.env.NODE_ENV || "development"}      ║
║   📊 MongoDB: Connected               ║
║                                       ║
║   📍 Available Routes:                ║
║   • POST /api/auth/login              ║
║   • POST /api/auth/register/customer  ║
║   • POST /api/auth/register/staff     ║
║   • GET  /api/staff                   ║
║   • GET  /api/products                ║
║   • GET  /api/suppliers               ║
╚═══════════════════════════════════════╝
  `);
  });
}

module.exports = app;
