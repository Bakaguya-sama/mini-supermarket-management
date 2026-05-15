import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiCpu,
  FiHardDrive,
  FiActivity,
  FiLayers,
  FiList,
  FiClock,
} from "react-icons/fi";
import "./SystemMonitor.css";

const SystemMonitor = () => {
  const [activeTab, setActiveTab] = useState("metrics"); // 'metrics' or 'traces'
  const [metrics, setMetrics] = useState(null);
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedTraceId, setSelectedTraceId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (activeTab === "metrics") {
        const response = await axios.get(
          "http://localhost:5000/metrics?format=json",
        );
        setMetrics(response.data);
      } else {
        const response = await axios.get(
          "http://localhost:5000/api/telemetry/traces",
        );
        setTraces(response.data.data || []);
      }

      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(
        `Failed to fetch ${activeTab}. Ensure the backend server is running.`,
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const findMetric = (name) => metrics?.find((m) => m.name === name);

  // Nhóm các Span thành Trace
  const groupedTraces = traces.reduce((acc, span) => {
    if (!acc[span.traceId]) {
      acc[span.traceId] = {
        traceId: span.traceId,
        spans: [],
        rootName: "",
        startTime: span.startTime,
        totalDuration: 0,
        status: "Success",
      };
    }
    acc[span.traceId].spans.push(span);
    if (!span.parentSpanId) {
      acc[span.traceId].rootName = span.name;
      acc[span.traceId].totalDuration = span.durationMs;
      acc[span.traceId].status = span.status.code === 2 ? "Error" : "Success";
    }
    return acc;
  }, {});

  const traceList = Object.values(groupedTraces).sort(
    (a, b) => b.startTime - a.startTime,
  );

  if (loading && !metrics && traces.length === 0) {
    return (
      <div className="system-monitor-container">
        <div className="loading-container">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  const memResident = findMetric("process_resident_memory_bytes")?.values[0]
    ?.value;
  const heapUsed = findMetric("nodejs_heap_size_used_bytes")?.values[0]?.value;
  const cpuUser = findMetric("process_cpu_user_seconds_total")?.values[0]
    ?.value;
  const eventLoopLag = findMetric("nodejs_eventloop_lag_seconds")?.values[0]
    ?.value;
  const activeResources = findMetric("nodejs_active_resources")?.values || [];
  const activeHandles = findMetric("nodejs_active_handles")?.values || [];

  return (
    <div className="system-monitor-container">
      <div className="monitor-header">
        <div>
          <h1>System Health & Telemetry</h1>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>
            <span className="status-indicator status-online"></span>
            Real-time observability • Last updated: {lastUpdated}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div
            className="tabs"
            style={{
              display: "flex",
              background: "#1e293b",
              borderRadius: "8px",
              padding: "4px",
            }}
          >
            <button
              className={activeTab === "metrics" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("metrics")}
              style={{
                padding: "8px 16px",
                background: activeTab === "metrics" ? "#3b82f6" : "transparent",
                border: "none",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Metrics
            </button>
            <button
              className={activeTab === "traces" ? "tab-btn active" : "tab-btn"}
              onClick={() => {
                setActiveTab("traces");
                setSelectedTraceId(null);
              }}
              style={{
                padding: "8px 16px",
                background: activeTab === "traces" ? "#3b82f6" : "transparent",
                border: "none",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Traces
            </button>
          </div>
          <button
            className="refresh-button"
            onClick={fetchData}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            color: "#ef4444",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          {error}
        </div>
      )}

      {activeTab === "metrics" ? (
        <>
          <div className="metrics-grid">
            {/* RAM Metric */}
            <div className="metric-card">
              <div className="metric-label">
                <FiHardDrive style={{ marginRight: "8px" }} />
                Memory Usage (RSS)
              </div>
              <div className="metric-value">
                {formatBytes(memResident || 0)}
              </div>
              <div className="metric-subtext">
                Total memory allocated to process
              </div>
            </div>

            {/* Heap Metric */}
            <div className="metric-card">
              <div className="metric-label">
                <FiLayers style={{ marginRight: "8px" }} />
                Node.js Heap Used
              </div>
              <div className="metric-value">{formatBytes(heapUsed || 0)}</div>
              <div className="metric-subtext">Active objects in memory</div>
            </div>

            {/* CPU Metric */}
            <div className="metric-card">
              <div className="metric-label">
                <FiCpu style={{ marginRight: "8px" }} />
                Total CPU Time
              </div>
              <div className="metric-value">{(cpuUser || 0).toFixed(2)}s</div>
              <div className="metric-subtext">
                Total user-mode CPU time spent
              </div>
            </div>

            {/* Event Loop Metric */}
            <div className="metric-card">
              <div className="metric-label">
                <FiActivity style={{ marginRight: "8px" }} />
                Event Loop Lag
              </div>
              <div className="metric-value">
                {(eventLoopLag || 0).toFixed(4)}s
              </div>
              <div className="metric-subtext">Latency in processing events</div>
            </div>
          </div>

          <div className="metrics-grid" style={{ marginTop: "1.5rem" }}>
            {/* Active Resources */}
            <div className="metric-card">
              <div className="metric-label">Active Resources</div>
              <div className="resources-list">
                {activeResources.map((res, idx) => (
                  <div key={idx} className="resource-item">
                    <span className="resource-name">{res.labels.type}</span>
                    <span className="resource-count">{res.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Handles */}
            <div className="metric-card">
              <div className="metric-label">Active Handles</div>
              <div className="resources-list">
                {activeHandles.map((handle, idx) => (
                  <div key={idx} className="resource-item">
                    <span className="resource-name">{handle.labels.type}</span>
                    <span className="resource-count">{handle.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="raw-json-container">
            <h3 style={{ marginBottom: "1rem", color: "#f1f5f9" }}>
              Raw Metrics JSON
            </h3>
            <pre>{JSON.stringify(metrics, null, 2)}</pre>
          </div>
        </>
      ) : (
        <div
          className="traces-container"
          style={{ display: "flex", gap: "2rem", height: "600px" }}
        >
          {/* List of Traces */}
          <div
            className="traces-list"
            style={{
              flex: 1,
              background: "#1e293b",
              borderRadius: "12px",
              padding: "1rem",
              overflowY: "auto",
            }}
          >
            <h3 style={{ color: "white", marginBottom: "1rem" }}>
              Recent Traces
            </h3>
            {traceList.map((trace) => (
              <div
                key={trace.traceId}
                onClick={() => setSelectedTraceId(trace.traceId)}
                style={{
                  background:
                    selectedTraceId === trace.traceId ? "#334155" : "#0f172a",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor:
                    selectedTraceId === trace.traceId
                      ? "#3b82f6"
                      : "transparent",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#38bdf8",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    {trace.rootName || "Unknown Operation"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                    <FiClock
                      style={{ display: "inline", marginRight: "4px" }}
                    />
                    {new Date(trace.startTime).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      background:
                        trace.status === "Error"
                          ? "rgba(239, 68, 68, 0.2)"
                          : "rgba(34, 197, 94, 0.2)",
                      color: trace.status === "Error" ? "#f87171" : "#4ade80",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    {trace.totalDuration.toFixed(2)} ms
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                    {trace.spans.length} spans
                  </div>
                </div>
              </div>
            ))}
            {traceList.length === 0 && (
              <div
                style={{
                  color: "#64748b",
                  textAlign: "center",
                  marginTop: "2rem",
                }}
              >
                No traces recorded yet.
              </div>
            )}
          </div>

          {/* Trace Detail Waterfall */}
          <div
            className="trace-detail"
            style={{
              flex: 2,
              background: "#1e293b",
              borderRadius: "12px",
              padding: "1rem",
              overflowY: "auto",
            }}
          >
            {selectedTraceId && groupedTraces[selectedTraceId] ? (
              <div>
                <h3 style={{ color: "white", marginBottom: "1.5rem" }}>
                  Trace Waterfall
                </h3>
                <div
                  style={{
                    background: "#0f172a",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                    Trace ID
                  </div>
                  <div style={{ color: "#f8fafc", fontFamily: "monospace" }}>
                    {selectedTraceId}
                  </div>
                </div>

                {groupedTraces[selectedTraceId].spans
                  .sort((a, b) => a.startTime - b.startTime)
                  .map((span) => {
                    const rootStart = groupedTraces[selectedTraceId].startTime;
                    const totalDur =
                      groupedTraces[selectedTraceId].totalDuration;

                    const offsetPercent =
                      ((span.startTime - rootStart) / totalDur) * 100;
                    const widthPercent = Math.max(
                      0.5,
                      (span.durationMs / totalDur) * 100,
                    );

                    return (
                      <div key={span.spanId} style={{ marginBottom: "1.5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#e2e8f0",
                            marginBottom: "4px",
                            fontSize: "0.9rem",
                          }}
                        >
                          <span style={{ fontWeight: "500" }}>{span.name}</span>
                          <span style={{ color: "#94a3b8" }}>
                            {span.durationMs.toFixed(2)} ms
                          </span>
                        </div>

                        {/* Timeline bar */}
                        <div
                          style={{
                            width: "100%",
                            background: "#334155",
                            height: "12px",
                            borderRadius: "6px",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: `${offsetPercent}%`,
                              width: `${widthPercent}%`,
                              height: "100%",
                              background:
                                span.status.code === 2 ? "#ef4444" : "#3b82f6",
                              borderRadius: "6px",
                            }}
                          ></div>
                        </div>

                        {/* Attributes */}
                        {span.attributes &&
                          Object.keys(span.attributes).length > 0 && (
                            <div
                              style={{
                                background: "#0f172a",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                marginTop: "0.5rem",
                              }}
                            >
                              <div
                                style={{
                                  color: "#64748b",
                                  fontSize: "0.8rem",
                                  marginBottom: "4px",
                                  fontWeight: "bold",
                                }}
                              >
                                Attributes:
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "0.5rem",
                                }}
                              >
                                {Object.entries(span.attributes).map(
                                  ([k, v]) => (
                                    <div key={k} style={{ fontSize: "0.8rem" }}>
                                      <span style={{ color: "#94a3b8" }}>
                                        {k}:{" "}
                                      </span>
                                      <span
                                        style={{
                                          color: "#e2e8f0",
                                          wordBreak: "break-all",
                                        }}
                                      >
                                        {String(v)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
              >
                Select a trace from the left to view the waterfall timeline.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor;
