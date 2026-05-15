// config/tracer.js
// ============================================================
// OPENTELEMETRY TRACER - PHẢI ĐƯỢC REQUIRE ĐẦU TIÊN
// Đây là file bootstrap cho Distributed Tracing (Telemetry Trụ cột 3).
//
// Nó tự động instrument:
//   - express  → mỗi HTTP request = 1 Span
//   - mongoose → mỗi DB query    = 1 Child Span
//   - http     → mỗi outbound call = 1 Child Span
//
// Traces được export ra console (dev) hoặc OTLP endpoint (prod/Jaeger)
// ============================================================

'use strict';

const { NodeSDK }           = require('@opentelemetry/sdk-node');
const { Resource }          = require('@opentelemetry/resources');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor, InMemorySpanExporter } = require('@opentelemetry/sdk-trace-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Exporter để lưu trace trên RAM, phục vụ UI Demo
const memoryExporter = new InMemorySpanExporter();

// ─── Resource: định danh service trên Jaeger/Zipkin ───────────────────────
const resource = new Resource({
  'service.name':    process.env.OTEL_SERVICE_NAME || 'mini-supermarket-api',
  'service.version': '1.0.0',
  'deployment.environment': process.env.NODE_ENV || 'development',
});

// ─── Chọn Exporter theo môi trường ────────────────────────────────────────
// DEV  : in ra console để xem ngay (dễ học/debug)
// PROD : gửi tới Jaeger/Zipkin qua OTLP HTTP
const isDev = (process.env.NODE_ENV !== 'production');

// Sử dụng SimpleSpanProcessor kết hợp với custom Exporter để gửi tới cả Console và Memory
class MultiExporter {
  export(spans, resultCallback) {
    if (isDev) {
      new ConsoleSpanExporter().export(spans, () => {});
    }
    memoryExporter.export(spans, resultCallback);
  }
  shutdown() {
    return memoryExporter.shutdown();
  }
}

const spanProcessor = new SimpleSpanProcessor(new MultiExporter());

// ─── Khởi tạo SDK ─────────────────────────────────────────────────────────
const sdk = new NodeSDK({
  resource,
  spanProcessor,
  // Auto-instrument Express, Mongoose, HTTP, DNS, Net, ...
  // Filter bỏ route /metrics và /health để không spam traces
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        ignoreIncomingRequestHook: (req) => {
          const ignorePaths = ['/metrics', '/api/health', '/status'];
          return ignorePaths.some((p) => req.url?.startsWith(p));
        },
      },
      '@opentelemetry/instrumentation-fs': { enabled: false }, // tắt fs traces (quá nhiều)
    }),
  ],
});

// ─── Start SDK trước khi bất kỳ module nào được load ─────────────────────
sdk.start();

// ─── Graceful shutdown ─────────────────────────────────────────────────────
process.on('SIGTERM', () => sdk.shutdown());
process.on('SIGINT',  () => sdk.shutdown());

// Export tracer để tạo Custom Spans trong business code
const { trace, context, SpanStatusCode } = require('@opentelemetry/api');
const tracer = trace.getTracer('mini-supermarket-api', '1.0.0');

module.exports = { tracer, trace, context, SpanStatusCode, memoryExporter };
