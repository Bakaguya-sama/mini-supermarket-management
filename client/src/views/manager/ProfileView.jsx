import React, { useState, useEffect } from "react";
import "./product-management/ProductListView.css";

const ProfileView = () => {
  const [user, setUser] = useState({
    username: "Loading...",
    role: "Loading...",
    email: "admin@minisupermarket.com",
    fullName: "Nguyễn Văn Admin"
  });

  useEffect(() => {
    // Thử lấy từ localStorage nếu có
    try {
      const storedUser = localStorage.getItem("account");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser({
          username: parsed.username || "manager1",
          role: parsed.role || "Manager",
          email: parsed.email || "manager@minisupermarket.com",
          fullName: parsed.full_name || "Quản lý Cửa hàng"
        });
      }
    } catch (e) {}
  }, []);

  return (
    <div className="product-list-view">
      <div className="product-page-header">
        <h1 className="page-title">Hồ sơ Quản trị viên</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <div style={{
          background: "#1e293b",
          borderRadius: "16px",
          padding: "3rem",
          border: "1px solid #334155",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          color: "white"
        }}>
          <div style={{
            width: "120px", height: "120px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            margin: "0 auto 1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "3rem",
            fontWeight: "bold",
            border: "4px solid #0f172a"
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          
          <h2 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>{user.fullName}</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", margin: "0 0 2rem 0", textTransform: "uppercase", letterSpacing: "2px" }}>
            {user.role}
          </p>

          <div style={{ background: "#0f172a", borderRadius: "8px", padding: "1.5rem", textAlign: "left", border: "1px solid #334155" }}>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Tài khoản:</span>
              <span style={{ fontWeight: "bold" }}>{user.username}</span>
            </div>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Email:</span>
              <span style={{ fontWeight: "bold" }}>{user.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8" }}>Trạng thái:</span>
              <span className="status-badge status-approved">Đang hoạt động</span>
            </div>
          </div>

          <button className="add-product-btn" style={{ marginTop: "2rem", width: "100%", padding: "1rem" }}>
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
