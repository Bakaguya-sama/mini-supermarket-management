const Redis = require('ioredis');
const logger = require('./logger');

<<<<<<< HEAD
// In test mode, skip Redis connection entirely
if (process.env.NODE_ENV === 'test') {
  // Create a mock Redis client for tests that won't attempt connection
  const mockRedis = {
    get: () => Promise.resolve(null),
    set: () => Promise.resolve('OK'),
    del: () => Promise.resolve(0),
    exists: () => Promise.resolve(0),
    expire: () => Promise.resolve(0),
    ttl: () => Promise.resolve(-1),
    on: () => {},
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    quit: () => Promise.resolve(),
  };
  module.exports = mockRedis;
} else {
  const redisClient = new Redis(process.env.REDIS_URI || {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true, // Không tự connect ngay khi khởi động
    connectTimeout: 2000, // 2 second timeout for connection
    commandTimeout: 2000, // 2 second timeout for commands
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis không khả dụng, bỏ qua cache...');
        return null;
      }
      return Math.min(times * 50, 2000);
    }
  });
=======
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
>>>>>>> c33f51f15b30425ad7de6561161aed0bef962723

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
}