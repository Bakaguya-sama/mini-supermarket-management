// server/middleware/errorHandler.js

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  
  if (err.stack) {
    console.error(err.stack);
  }

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
