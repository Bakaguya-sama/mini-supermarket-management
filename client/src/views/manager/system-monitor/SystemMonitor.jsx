import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiRefreshCw, FiCpu, FiHardDrive, FiActivity, FiLayers } from "react-icons/fi";
import "./SystemMonitor.css";

const SystemMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/metrics?format=json");
      setMetrics(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError("Failed to fetch system metrics. Ensure the backend server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const findMetric = (name) => metrics?.find(m => m.name === name);

  if (loading && !metrics) {
    return (
      <div className="system-monitor-container">
        <div className="loading-container">
          <span className="loader"></span>
        </div>
      </div>
    );
  }

  const memResident = findMetric('process_resident_memory_bytes')?.values[0]?.value;
  const heapUsed = findMetric('nodejs_heap_size_used_bytes')?.values[0]?.value;
  const cpuUser = findMetric('process_cpu_user_seconds_total')?.values[0]?.value;
  const eventLoopLag = findMetric('nodejs_eventloop_lag_seconds')?.values[0]?.value;
  const activeResources = findMetric('nodejs_active_resources')?.values || [];
  const activeHandles = findMetric('nodejs_active_handles')?.values || [];

  return (
    <div className="system-monitor-container">
      <div className="monitor-header">
        <div>
          <h1>System Health Monitor</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            <span className="status-indicator status-online"></span>
            Real-time infrastructure analytics • Last updated: {lastUpdated}
          </p>
        </div>
        <button className="refresh-button" onClick={fetchMetrics} disabled={loading}>
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div className="metrics-grid">
        {/* RAM Metric */}
        <div className="metric-card">
          <div className="metric-label">
            <FiHardDrive style={{ marginRight: '8px' }} />
            Memory Usage (RSS)
          </div>
          <div className="metric-value">{formatBytes(memResident || 0)}</div>
          <div className="metric-subtext">Total memory allocated to process</div>
        </div>

        {/* Heap Metric */}
        <div className="metric-card">
          <div className="metric-label">
            <FiLayers style={{ marginRight: '8px' }} />
            Node.js Heap Used
          </div>
          <div className="metric-value">{formatBytes(heapUsed || 0)}</div>
          <div className="metric-subtext">Active objects in memory</div>
        </div>

        {/* CPU Metric */}
        <div className="metric-card">
          <div className="metric-label">
            <FiCpu style={{ marginRight: '8px' }} />
            Total CPU Time
          </div>
          <div className="metric-value">{(cpuUser || 0).toFixed(2)}s</div>
          <div className="metric-subtext">Total user-mode CPU time spent</div>
        </div>

        {/* Event Loop Metric */}
        <div className="metric-card">
          <div className="metric-label">
            <FiActivity style={{ marginRight: '8px' }} />
            Event Loop Lag
          </div>
          <div className="metric-value">{(eventLoopLag || 0).toFixed(4)}s</div>
          <div className="metric-subtext">Latency in processing events</div>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginTop: '1.5rem' }}>
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
        <h3 style={{ marginBottom: '1rem', color: '#f1f5f9' }}>Raw Metrics JSON</h3>
        <pre>{JSON.stringify(metrics, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SystemMonitor;
