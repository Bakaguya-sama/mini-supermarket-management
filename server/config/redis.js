const Redis = require('ioredis');
const logger = require('./logger');

const redisClient = new Redis(process.env.REDIS_URI || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true, // Không tự connect ngay khi khởi động
  retryStrategy(times) {
    if (times > 3) {
      logger.warn('Redis không khả dụng, bỏ qua cache...');
      return null;
    }
    return Math.min(times * 50, 2000);
  }
});

// Chỉ log lỗi 1 lần duy nhất
let errorLogged = false;
redisClient.on('error', (err) => {
  if (!errorLogged) {
    logger.warn('⚠️ Redis không kết nối được, server vẫn chạy bình thường không có cache.');
    errorLogged = true;
  }
});

redisClient.on('connect', () => {
  errorLogged = false;
  logger.info('✅ Redis connected');
});

module.exports = redisClient;