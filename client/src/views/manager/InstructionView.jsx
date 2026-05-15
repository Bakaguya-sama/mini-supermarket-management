import React, { useState } from "react";
import { FaSearch, FaBook, FaArrowRight } from "react-icons/fa";
import "./product-management/ProductListView.css";

const InstructionView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const manuals = [
    { title: "Hướng dẫn nhập kho", desc: "Cách nhập số lượng sản phẩm từ nhà cung cấp vào hệ thống.", category: "Inventory" },
    { title: "Xử lý hàng cận date", desc: "Quy trình giảm giá hoặc tiêu hủy hàng sắp hết hạn.", category: "Inventory" },
    { title: "Quy trình thanh toán", desc: "Hướng dẫn xử lý lỗi khi khách hàng quét mã QR thất bại.", category: "Cashier" },
    { title: "Giám sát Telemetry", desc: "Cách đọc các thông số CPU, RAM và giải quyết khi Server Lag.", category: "System" }
  ];

  return (
    <div className="product-list-view">
      {/* Header */}
      <div className="product-page-header">
        <h1 className="page-title">Trung tâm Trợ giúp & Tài liệu</h1>
      </div>

      {/* Filters */}
      <div className="product-filters-section">
        <div className="left-filters" style={{ width: "100%" }}>
          <div className="search-container" style={{ width: "500px", maxWidth: "100%" }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm hướng dẫn (VD: Nhập kho, Lỗi thanh toán)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th><FaBook /> Tài liệu</th>
              <th>Mô tả chi tiết</th>
              <th>Phân loại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {manuals.map((item, idx) => (
              <tr key={idx} style={{ cursor: "pointer" }} className="hover-row">
                <td className="product-name-cell" style={{ fontWeight: 'bold' }}>{item.title}</td>
                <td style={{ color: "#64748b" }}>{item.desc}</td>
                <td>
                  <span className="status-badge status-default">{item.category}</span>
                </td>
                <td>
                  <button className="action-btn view-btn" style={{ width: 'auto', padding: '0 10px' }}>
                    Đọc <FaArrowRight style={{ marginLeft: '5px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructionView;
