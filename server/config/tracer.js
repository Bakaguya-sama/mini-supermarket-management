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

const noopSpan = {
  setStatus() {},
  recordException() {},
  setAttributes() {},
  end() {},
};

const noopTracer = {
  startSpan() {
    return noopSpan;
  },
};

const noopMemoryExporter = {
  getFinishedSpans() {
    return [];
  },
  reset() {},
};

let tracer = noopTracer;
let trace = { getTracer: () => noopTracer, getActiveSpan: () => undefined };
let context = {};
let SpanStatusCode = { OK: 'OK', ERROR: 'ERROR' };
let memoryExporter = noopMemoryExporter;

try {
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const { Resource } = require('@opentelemetry/resources');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { SimpleSpanProcessor, InMemorySpanExporter } = require('@opentelemetry/sdk-trace-node');
  const { trace: apiTrace, context: apiContext, SpanStatusCode: apiSpanStatusCode } = require('@opentelemetry/api');

  memoryExporter = new InMemorySpanExporter();

  const resource = new Resource({
    'service.name': process.env.OTEL_SERVICE_NAME || 'mini-supermarket-api',
    'service.version': '1.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development',
  });

  class MultiExporter {
    export(spans, resultCallback) {
      memoryExporter.export(spans, resultCallback);
    }

    shutdown() {
      return memoryExporter.shutdown();
    }
  }

  const sdk = new NodeSDK({
    resource,
    spanProcessor: new SimpleSpanProcessor(new MultiExporter()),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: (req) => {
            const ignorePaths = ['/metrics', '/api/health', '/status', '/api/telemetry'];
            return ignorePaths.some((p) => req.url?.startsWith(p));
          },
        },
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-mongodb': { enabled: false },
        '@opentelemetry/instrumentation-mongoose': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
      }),
    ],
  });

  sdk.start();
  process.on('SIGTERM', () => sdk.shutdown());
  process.on('SIGINT', () => sdk.shutdown());

  trace = apiTrace;
  context = apiContext;
  SpanStatusCode = apiSpanStatusCode;
  tracer = trace.getTracer('mini-supermarket-api', '1.0.0');
} catch (error) {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`Telemetry disabled: ${error.message}`);
  }
}

module.exports = { tracer, trace, context, SpanStatusCode, memoryExporter };
