// middleware/tracing.js
// ============================================================
// CUSTOM BUSINESS TRACING HELPERS
//
// Mục đích: tạo các Span CỤ THỂ cho nghiệp vụ, thay vì chỉ dùng
// auto-instrumentation (vốn chỉ cho thấy "POST /api/orders").
//
// 3 Feature được trace:
//   1. auth.login     → mất bao lâu, thành công/thất bại, role
//   2. order.checkout → mất bao lâu từng bước, tổng tiền, promo
//   3. product.search → query gì, bao nhiêu kết quả, pagination
//
// Cách dùng: import { withSpan, tracing } from '../middleware/tracing'
// ============================================================

let tracer;
let SpanStatusCode;
try {
  ({ tracer, SpanStatusCode } = require('../config/tracer'));
} catch (err) {
  // Fallback no-op tracer for test environments or missing telemetry packages
  tracer = {
    startSpan: () => ({
      setStatus: () => {},
      recordException: () => {},
      end: () => {}
    })
  };
  SpanStatusCode = { OK: 1, ERROR: 2 };
}

// ─────────────────────────────────────────────────────────────────
// withSpan: helper wrap bất kỳ async fn nào trong 1 named span
// Nếu fn throw error → span ghi lại lỗi rồi rethrow
// ─────────────────────────────────────────────────────────────────
const withSpan = async (spanName, attributes = {}, fn) => {
  const span = tracer.startSpan(spanName, { attributes });
  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
    span.recordException(err);
    throw err;
  } finally {
    span.end();
  }
};

// ─────────────────────────────────────────────────────────────────
// FEATURE 1: auth.login
// Trace toàn bộ luồng đăng nhập:
//   Span gốc: "auth.login"
//   ├─ Attribute: username, role, ip, user_agent
//   └─ Nếu thất bại: ghi exception + reason
//
// Ví dụ output trên Jaeger:
//   auth.login [200ms]
//     └── mongoose.find (accounts) [45ms]   ← auto-instrumented
// ─────────────────────────────────────────────────────────────────
const traceLogin = async (username, ip, userAgent, fn) => {
  return withSpan(
    'auth.login',
    {
      'auth.username':   username,
      'http.client_ip':  ip  || 'unknown',
      'http.user_agent': userAgent || 'unknown',
      'span.kind':       'server',
    },
    async (span) => {
      const result = await fn();
      // Ghi thêm thông tin khi login thành công
      span.setAttributes({
        'auth.role':      result.account?.role    || 'unknown',
        'auth.success':   true,
        'auth.account_id': String(result.account?._id || ''),
      });
      return result;
    }
  );
};

// ─────────────────────────────────────────────────────────────────
// FEATURE 2: order.checkout
// Trace toàn bộ luồng tạo đơn hàng - chia thành 3 child span:
//
//   order.checkout [850ms]                ← span cha
//     ├── order.checkout.validate [30ms]  ← validate customer + cart
//     ├── order.checkout.create   [400ms] ← write order + items vào DB
//     └── order.checkout.invoice  [200ms] ← tạo invoice
//
// Attribute hữu ích:
//   customer_id, cart_item_count, total_amount, promo_discount, points_used
// ─────────────────────────────────────────────────────────────────
const traceCheckout = async (customerId, cartId, fn) => {
  return withSpan(
    'order.checkout',
    {
      'order.customer_id': String(customerId || ''),
      'order.cart_id':     String(cartId     || ''),
      'span.kind':         'server',
    },
    async (span) => {
      const result = await fn({
        // callback dùng để ghi thêm attributes sau khi tính xong
        setOrderAttributes: ({ itemCount, totalAmount, promoDiscount, pointsRedeemed }) => {
          span.setAttributes({
            'order.item_count':      itemCount       || 0,
            'order.total_amount':    totalAmount     || 0,
            'order.promo_discount':  promoDiscount   || 0,
            'order.points_redeemed': pointsRedeemed  || 0,
          });
        },
      });
      return result;
    }
  );
};

// Child span cho từng bước bên trong checkout
const traceCheckoutStep = async (stepName, attributes, fn) => {
  return withSpan(`order.checkout.${stepName}`, attributes, fn);
};

// ─────────────────────────────────────────────────────────────────
// FEATURE 3: product.search
// Trace query tìm kiếm sản phẩm:
//
//   product.search [65ms]
//     └── mongoose.find (products) [58ms]  ← auto-instrumented
//
// Attribute hữu ích để phân tích hiệu năng:
//   keyword, page, limit, result_count, has_filter
// ─────────────────────────────────────────────────────────────────
const traceProductSearch = async (query, fn) => {
  const { search = '', page = 1, limit = 20, category, status } = query;
  return withSpan(
    'product.search',
    {
      'search.keyword':    search,
      'search.page':       Number(page),
      'search.limit':      Number(limit),
      'search.has_filter': Boolean(category || status),
      'search.category':   category || '',
      'span.kind':         'server',
    },
    async (span) => {
      const result = await fn();
      // Ghi lại số kết quả trả về
      span.setAttributes({
        'search.result_count': result?.total || 0,
        'search.page_count':   result?.pages || 0,
      });
      return result;
    }
  );
};

// ─────────────────────────────────────────────────────────────────
// Express Middleware: gắn trace_id vào response header
// Giúp QA/Dev lấy trace_id từ Network tab để tìm trên Jaeger
// ─────────────────────────────────────────────────────────────────
const attachTraceId = (req, res, next) => {
  const { trace, context } = require('@opentelemetry/api');
  const span = trace.getActiveSpan();
  if (span) {
    const traceId = span.spanContext().traceId;
    res.setHeader('X-Trace-Id', traceId);
    req.traceId = traceId;
  }
  next();
};

module.exports = {
  withSpan,
  traceLogin,
  traceCheckout,
  traceCheckoutStep,
  traceProductSearch,
  attachTraceId,
};
