import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductModal.css";
import productService from "../../services/productService";
import BatchListModal from "./BatchListModal";

const ProductModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Load batches helper so we can call it on demand
  const loadBatches = async () => {
    if (!isOpen || !product?._id) return;
    try {
      setIsLoadingBatches(true);
      const resp = await productService.getBatchesByProduct(product._id);
      // Normalize various response shapes:
      // - { success: true, data: { batches: [...] } }
      // - { product: {...}, total_quantity, batches: [...] }
      // - { batches: [...] }
      // - [] (array)
      const rawData =
        resp?.data?.data?.batches ||
        resp?.data?.batches ||
        resp?.data ||
        resp?.batches ||
        resp ||
        [];

      const data = Array.isArray(rawData)
        ? rawData
        : rawData && Array.isArray(rawData.batches)
        ? rawData.batches
        : [];

      setBatches(data);
      console.debug(
        `Loaded ${data.length} batches for product ${product._id}`,
        rawData
      );
    } catch (err) {
      console.warn("Failed to load batches in modal", err);
      setBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [isOpen, product]);

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
    return `${parseFloat(price || 0).toLocaleString("vi-VN")}VNĐ`;
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

  // Batch summary
  const distinctExpiryCount = new Set(
    batches.map((b) =>
      b.expiry_date ? new Date(b.expiry_date).toISOString().slice(0, 10) : null
    )
  ).size;
  const now = new Date();
  const expiredTotalQuantity = batches.reduce((s, b) => {
    if (b.expiry_date && new Date(b.expiry_date) < now)
      return s + (b.totalQuantity || b.quantity || 0);
    return s;
  }, 0);

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
                <p>
                  {product.current_stock || 0} {product.unit}
                </p>
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

              {/* Batch summary area */}
              <div className="product-modal-info-item">
                <label>Batches</label>
                <div>
                  {isLoadingBatches ? (
                    <p>Loading batches...</p>
                  ) : (
                    <>
                      <p>Distinct Expiries: {distinctExpiryCount}</p>
                      {expiredTotalQuantity > 0 && (
                        <p className="expired-indicator">
                          Expired qty: {expiredTotalQuantity}
                        </p>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="view-batches-btn"
                          onClick={async () => {
                            await loadBatches();
                            setIsBatchModalOpen(true);
                          }}
                        >
                          View Batches
                        </button>
                        <button
                          className="refresh-batches-btn"
                          onClick={() => loadBatches()}
                          title="Reload batches from server"
                        >
                          Refresh
                        </button>
                      </div>
                    </>
                  )}
                </div>
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

        {/* Embedded Batch Modal */}
        <BatchListModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          product={product}
          batches={batches}
        />
      </div>
    </div>
  );
};

export default ProductModal;
