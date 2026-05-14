const Redis = require('ioredis');
const logger = require('./logger');

// Configure Redis Client
// By default connects to localhost:6379, configurable via env vars
const redisClient = new Redis(process.env.REDIS_URI || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Add retry strategy for resilience (SAD Availability)
  retryStrategy(times) {
    if (times > 3) {
      // Bỏ cuộc sau 3 lần thử (ngừng kết nối lại) để tránh spam log khi dev local không bật Redis
      logger.warn('Redis retry limit reached. Caching will be unavailable.');
      return null; 
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redisClient.on('connect', () => {
  logger.info('Redis connection established successfully');
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

module.exports = redisClient;
