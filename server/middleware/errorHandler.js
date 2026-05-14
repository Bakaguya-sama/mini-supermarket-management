// server/middleware/errorHandler.js

const logger = require('../config/logger');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`Error in ${req.method} ${req.originalUrl}: ${err.message}`, { 
    stack: err.stack,
    body: req.body,
    query: req.query 
  });


  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    // Chỉ trả về stack trace trong môi trường development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    error: err.name || 'Error'
  });
};

module.exports = errorHandler;
