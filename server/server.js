// server/server.js - UPDATED WITH NEW ROUTES
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🛒 Mini Supermarket API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      staff: '/api/staff',
      products: '/api/products',
      suppliers: '/api/suppliers',
      docs: '/api/docs'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// API Routes
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));

// Future routes
// app.use('/api/accounts', require('./routes/accountRoutes'));
// app.use('/api/orders', require('./routes/orderRoutes'));
// app.use('/api/customers', require('./routes/customerRoutes'));
// app.use('/api/invoices', require('./routes/invoiceRoutes'));
// app.use('/api/carts', require('./routes/cartRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🛒 MINI SUPERMARKET API SERVER     ║
║   🚀 Server running on port ${PORT}     ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}      ║
║   📊 MongoDB: Connected               ║
║                                       ║
║   📍 Available Routes:                ║
║   • GET  /api/staff                   ║
║   • GET  /api/products                ║
║   • GET  /api/suppliers               ║
╚═══════════════════════════════════════╝
  `);
});