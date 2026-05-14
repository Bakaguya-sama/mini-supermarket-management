const client = require('prom-client');

// Khởi tạo một Registry để chứa các metrics
const register = new client.Registry();

// Thêm một nhãn mặc định (default label) cho tất cả các metrics
register.setDefaultLabels({
  app: 'mini-supermarket-api',
  env: process.env.NODE_ENV || 'development'
});

// Thu thập các metrics hệ thống cơ bản: CPU, RAM, Event Loop, ...
// Đây chính là cơ sở cho việc Cảnh báo (Alerting) và Dự báo tải (Capacity Planning)
client.collectDefaultMetrics({ register });

// Hàm middleware để theo dõi HTTP request duration (tùy chọn mở rộng)
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

module.exports = {
  register,
  httpRequestDurationMicroseconds
};
