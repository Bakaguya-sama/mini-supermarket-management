const { memoryExporter } = require('../config/tracer');

exports.getTraces = async (req, res) => {
  try {
    // Lấy tất cả Spans đã hoàn thành
    const spans = memoryExporter.getFinishedSpans();
    
    // Format lại data cho dễ hiển thị trên UI Frontend
    const formattedSpans = spans.map(span => {
      // Chuyển hrTime (High Resolution Time của OTel) sang millisecond
      const startTimeMs = span.startTime[0] * 1000 + span.startTime[1] / 1000000;
      const endTimeMs = span.endTime[0] * 1000 + span.endTime[1] / 1000000;
      const durationMs = endTimeMs - startTimeMs;

      return {
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId,
        parentSpanId: span.parentSpanId,
        name: span.name,
        kind: span.kind,
        startTime: startTimeMs,
        endTime: endTimeMs,
        durationMs: durationMs,
        status: span.status,
        attributes: span.attributes,
      };
    });

    // Chỉ trả về 100 span gần nhất để tránh lag
    const recentSpans = formattedSpans.sort((a, b) => b.startTime - a.startTime).slice(0, 100);

    res.status(200).json({
      success: true,
      count: recentSpans.length,
      data: recentSpans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearTraces = async (req, res) => {
  try {
    memoryExporter.reset();
    res.status(200).json({ success: true, message: 'Traces cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
