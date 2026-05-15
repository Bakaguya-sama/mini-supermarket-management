import React from "react";
import { FaDollarSign, FaBox, FaUsers, FaExclamationTriangle } from "react-icons/fa";
import "./product-management/ProductListView.css";

const ReportView = () => {
  const stats = [
    { title: "Doanh thu tháng", value: "145.5M VNĐ", icon: <FaDollarSign />, type: "value" },
    { title: "Đơn hàng mới", value: "1,245", icon: <FaBox />, type: "total" },
    { title: "Khách hàng mới", value: "324", icon: <FaUsers />, type: "total" },
    { title: "Cảnh báo kho", value: "12", icon: <FaExclamationTriangle />, type: "danger" },
  ];

  return (
    <div className="product-list-view">
      {/* Header */}
      <div className="product-page-header">
        <h1 className="page-title">Báo cáo Kinh doanh</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div className="stat-card" key={idx}>
              <div className={`stat-icon ${stat.type}`}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-number">{stat.value}</div>
                <div className="stat-label">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "40px", marginTop: "40px", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h2 style={{ color: "#1e293b", marginBottom: "30px", fontSize: "1.5rem" }}>Biểu đồ Doanh thu (6 tháng gần nhất)</h2>
        
        {/* CSS Bar Chart */}
        <div style={{ display: "flex", alignItems: "flex-end", height: "300px", gap: "2rem", paddingBottom: "20px", borderBottom: "2px solid #e2e8f0" }}>
          {[
            { month: "T1", value: 45, label: "45M" },
            { month: "T2", value: 65, label: "65M" },
            { month: "T3", value: 50, label: "50M" },
            { month: "T4", value: 90, label: "90M" },
            { month: "T5", value: 120, label: "120M" },
            { month: "T6", value: 145.5, label: "145.5M" }
          ].map((bar, idx) => {
            const heightPercent = (bar.value / 150) * 100; // max value 150M
            return (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ color: "#64748b", marginBottom: "10px", fontWeight: "bold" }}>{bar.label}</div>
                <div style={{
                  width: "100%",
                  height: `${heightPercent}%`,
                  background: "linear-gradient(to top, #3b82f6, #60a5fa)",
                  borderRadius: "8px 8px 0 0",
                  transition: "height 1s ease-out",
                  boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)"
                }}></div>
                <div style={{ marginTop: "15px", fontWeight: "bold", color: "#475569" }}>{bar.month}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
