import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import "./product-management/ProductListView.css";

const PromotionView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/promotions");
      if (response.data.success) {
        setPromotions(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải khuyến mãi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/promotions/${id}`);
        fetchPromotions(); // Refresh list
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  // Mock array for fallback if backend returns empty (for demo purposes)
  const displayPromos = promotions.length > 0 ? promotions : [
    { _id: 1, name: "Siêu Sale Cuối Tuần (Demo)", discount_value: 20, discount_type: "percentage", status: "Đang diễn ra", end_date: "2026-05-20" },
    { _id: 2, name: "Tháng Hành Động Vì Sức Khỏe (Demo)", discount_value: 50000, discount_type: "fixed_amount", status: "Sắp tới", end_date: "2026-06-30" },
  ];

  return (
    <div className="product-list-view">
      {/* Header */}
      <div className="product-page-header">
        <h1 className="page-title">Quản lý Khuyến mãi</h1>
      </div>

      {/* Filters and Actions */}
      <div className="product-filters-section">
        <div className="left-filters">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm chiến dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="dropdown">
            <select className="filter-select">
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Đang diễn ra</option>
              <option value="Upcoming">Sắp tới</option>
            </select>
          </div>
        </div>

        <div className="right-actions">
          <button className="add-product-btn">
            + Thêm Khuyến mãi
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Tên chiến dịch</th>
              <th>Mức giảm</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {displayPromos.map((promo) => (
              <tr key={promo._id}>
                <td className="product-name-cell" style={{ fontWeight: 'bold' }}>{promo.name}</td>
                <td className="product-price">
                  {promo.discount_type === 'percentage' ? `Giảm ${promo.discount_value}%` : `Giảm ${promo.discount_value.toLocaleString()}đ`}
                </td>
                <td>{promo.end_date ? new Date(promo.end_date).toLocaleDateString() : "Vô thời hạn"}</td>
                <td>
                  <span className={`status-badge ${promo.status === 'Đang diễn ra' ? 'status-approved' : 'status-pending'}`}>
                    {promo.status || "Đang diễn ra"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view-btn"><FaEye /></button>
                    <button className="action-btn edit-btn"><FaEdit /></button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(promo._id)}><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionView;
