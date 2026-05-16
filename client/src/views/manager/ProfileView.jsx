import React from "react";
import "./product-management/ProductListView.css";

const readProfileFromStorage = () => {
  const userRole = localStorage.getItem("userRole") || "manager";
  const userName = localStorage.getItem("userName") || "User";
  const userUsername = localStorage.getItem("userUsername") || "unknown";
  const userEmail = localStorage.getItem("userEmail") || "N/A";
  const userId = localStorage.getItem("userId") || "N/A";
  const isManager = localStorage.getItem("isManager") === "true";

  return {
    username: userUsername,
    fullName: userName,
    role: userRole,
    email: userEmail,
    userId,
    staffId: localStorage.getItem("staffId") || "N/A",
    position: localStorage.getItem("position") || "N/A",
    managerId: localStorage.getItem("managerId") || "N/A",
    accessLevel: localStorage.getItem("accessLevel") || "N/A",
    isSuperuser: localStorage.getItem("isSuperuser") === "true",
    isManager,
  };
};

const getRoleLabel = (user) => {
  if (user.role === "admin") {
    return user.isManager ? "Manager" : "Admin";
  }

  if (user.role === "staff") {
    return user.position !== "N/A" ? user.position : "Staff";
  }

  if (user.role === "customer") {
    return "Customer";
  }

  return "User";
};

const ProfileView = () => {
  const user = readProfileFromStorage();
  const roleLabel = getRoleLabel(user);
  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="product-list-view">
      <div className="product-page-header">
        <h1 className="page-title">Hồ sơ tài khoản</h1>
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
            {initials || "U"}
          </div>
          
          <h2 style={{ fontSize: "2rem", margin: "0 0 0.5rem 0", fontWeight: "700" }}>{user.fullName}</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", margin: "0 0 2rem 0", textTransform: "uppercase", letterSpacing: "2px" }}>
            {roleLabel}
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
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Mã tài khoản:</span>
              <span style={{ fontWeight: "bold" }}>{user.userId}</span>
            </div>
            {user.role === "staff" || user.role === "admin" ? (
              <>
                <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "#94a3b8" }}>Vị trí:</span>
                  <span style={{ fontWeight: "bold" }}>{roleLabel}</span>
                </div>
                <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "#94a3b8" }}>Staff ID:</span>
                  <span style={{ fontWeight: "bold" }}>{user.staffId}</span>
                </div>
                <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
                  <span style={{ color: "#94a3b8" }}>Quản lý:</span>
                  <span style={{ fontWeight: "bold" }}>{user.isManager ? "Có" : "Không"}</span>
                </div>
                {user.isManager && (
                  <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
                    <span style={{ color: "#94a3b8" }}>Access level:</span>
                    <span style={{ fontWeight: "bold" }}>{user.accessLevel}</span>
                  </div>
                )}
              </>
            ) : null}
            {user.role === "customer" ? (
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8" }}>Membership:</span>
                <span style={{ fontWeight: "bold" }}>{localStorage.getItem("membershipType") || "N/A"}</span>
              </div>
            ) : null}
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
