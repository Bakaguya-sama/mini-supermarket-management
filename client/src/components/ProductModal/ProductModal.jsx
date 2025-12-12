import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductModal.css";

const ProductModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen || !product) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditClick = () => {
    onClose();
    navigate(`/products/edit/${product._id}`);
  };

  // Format price
  const formatPrice = (price) => {
    return `$${parseFloat(price || 0).toFixed(2)}`;
  };

  // Get supplier name
  const getSupplierName = () => {
    if (typeof product.supplier_id === "object" && product.supplier_id.name) {
      return product.supplier_id.name;
    }
    return "N/A";
  };

  // Get stock status
  const getStockStatus = () => {
    if (product.current_stock === 0) {
      return "Out of Stock";
    } else if (product.current_stock <= product.minimum_stock_level) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  return (
    <div className="product-modal-overlay" onClick={handleOverlayClick}>
      <div className="product-modal-content">
        {/* Modal Header */}
        <div className="product-modal-header">
          <div className="product-modal-info">
            <h2 className="product-modal-name">{product.name}</h2>
            <p className="product-modal-category">{product.category}</p>
          </div>
          <button className="product-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Product Image */}
        <div className="product-modal-image-section">
          <img
            src={product.image_link || "https://placehold.co/400"}
            alt={product.name}
            className="product-modal-image"
            onError={(e) => {
              e.target.src = "https://placehold.co/400";
            }}
          />
        </div>

        {/* Modal Body */}
        <div className="product-modal-body">
          <div className="product-modal-info-grid">
            {/* Basic Information */}
            <div className="product-modal-info-row">
              <div className="product-modal-info-item">
                <label>Product ID</label>
                <p>{product._id || "N/A"}</p>
              </div>
              <div className="product-modal-info-item">
                <label>Unit</label>
                <p>{product.unit || "N/A"}</p>
              </div>
            </div>

            <div className="product-modal-info-row">
              <div className="product-modal-info-item">
                <label>Price</label>
                <p>{formatPrice(product.price)}</p>
              </div>
              <div className="product-modal-info-item">
                <label>Current Stock</label>
                <p>{product.current_stock || 0} {product.unit}</p>
              </div>
            </div>

            <div className="product-modal-info-row">
              <div className="product-modal-info-item">
                <label>Supplier</label>
                <p>{getSupplierName()}</p>
              </div>
              <div className="product-modal-info-item">
                <label>Minimum Stock</label>
                <p>{product.minimum_stock_level || "N/A"}</p>
              </div>
            </div>

            <div className="product-modal-info-row">
              <div className="product-modal-info-item">
                <label>Status</label>
                <span
                  className={`product-modal-status-badge ${getStockStatus()
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {getStockStatus()}
                </span>
              </div>
            </div>

            <div className="product-modal-info-row">
              <div className="product-modal-info-item product-modal-full-width">
                <label>Description</label>
                <p>{product.description || "No description"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="product-modal-footer">
          <button className="product-modal-edit-btn" onClick={handleEditClick}>
            <span>✏️</span>
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
