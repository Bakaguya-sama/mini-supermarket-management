const Redis = require('ioredis');
const logger = require('./logger');

const redisClient = new Redis(process.env.REDIS_URI || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true, 
  enableOfflineQueue: false, 
  maxRetriesPerRequest: 0,
  commandTimeout: 500, // Nếu lệnh treo quá 0.5s -> throw error ngay
  connectTimeout: 500, // Thử kết nối tối đa 0.5s -> fail fast
  retryStrategy(times) {
    logger.warn('Redis không khả dụng, bỏ qua cache...');
    return null; // Không retry nữa, đứt luôn để API chạy tiếp bằng MongoDB
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