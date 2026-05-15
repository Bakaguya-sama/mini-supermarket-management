// server/server.js - UPDATED WITH NEW ROUTES
// IMPORTANT: MUST BE REQUIRED FIRST TO CAPTURE ALL TRACES
require('./config/tracer');

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Custom Configurations
const logger = require("./config/logger");
const { connectRabbitMQ, getChannel } = require("./config/rabbitmq");
const redisClient = require("./config/redis");
const { register } = require("./config/monitoring");
const statusMonitor = require("express-status-monitor");
const mongoose = require("mongoose");
const connectDB = require("./config/database");

const app = express();

// --- Monitoring & Alerting (SAD Availability) ---
// 1. Dashboard giám sát CPU/RAM tại route /status
app.use(statusMonitor({ path: '/status' }));



// Set security HTTP headers (SAD 4.3 & 11.1)
app.use(helmet());

// Compress HTTP responses (SAD 10.2)
app.use(compression());

// Global Rate Limiting (SAD 15.4 Request Throttling)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api", limiter);

// Tracing Middleware: Attach TraceId to Response Header
const { attachTraceId } = require('./middleware/tracing');
app.use(attachTraceId);

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

// 2. Cung cấp Metrics cho Prometheus (Capacity Planning)
app.get('/metrics', async (req, res) => {
  try {
    if (req.query.format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      return res.json(await register.getMetricsAsJSON());
    }
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});
// Increase payload size limit for images (base64 encoded)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// HTTP Request Logging piped to Winston (SAD 12.1)
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

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

// 3. Deep Health Check (Phát hiện "Chết lâm sàn")
app.get("/api/health", (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isRedisConnected = redisClient.status === 'ready';
  const mqChannel = getChannel();
  const isMqConnected = !!mqChannel;

  const isHealthy = isMongoConnected && isRedisConnected && isMqConnected;

  const healthStatus = {
    status: isHealthy ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(), // CPU & RAM Monitoring
    dependencies: {
      mongodb: isMongoConnected ? "connected" : "disconnected",
      redis: isRedisConnected ? "connected" : "disconnected",
      rabbitmq: isMqConnected ? "connected" : "disconnected",
    }
  };

  // Trả về HTTP 503 để Load Balancer (Nginx/K8s) biết đường chuyển hướng hoặc restart
  if (!isHealthy) {
    return res.status(503).json(healthStatus);
  }

  res.json(healthStatus);
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
app.use("/api/telemetry", require("./routes/telemetryRoutes")); // API Demo Telemetry

// Global Error Handling Middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const startServer = async () => {
    // Initialize Message Broker connection (SAD 7, 10.2)
    await connectRabbitMQ();

    app.listen(PORT, () => {
      logger.info(`
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
  };

  startServer();
}

module.exports = app;
