import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBox } from "react-icons/fa";
import "./EditShelfProduct.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import * as productShelfService from "../../../services/productShelfService";

const EditShelfProduct = () => {
  const { id } = useParams(); // Product-Shelf mapping ID
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product and current shelf info
  const [productInfo, setProductInfo] = useState(null);
  const [currentShelf, setCurrentShelf] = useState(null);
  const [mappingQuantity, setMappingQuantity] = useState(0);

  // Available shelves
  const [shelves, setShelves] = useState([]);
  const [selectedNewShelf, setSelectedNewShelf] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadProductShelfData();
  }, [id]);

  const loadProductShelfData = async () => {
    try {
      setIsLoading(true);

      // Get current mapping
      const mappingResponse = await productShelfService.getProductShelfById(id);

      if (mappingResponse.success && mappingResponse.data) {
        const mapping = mappingResponse.data;
        setProductInfo(mapping.product_id);
        setCurrentShelf(mapping.shelf_id);
        setMappingQuantity(mapping.quantity);
      } else {
        setErrorMessage("Failed to load product-shelf mapping");
        return;
      }

      // Load all shelves using shelf service
      const shelfService = (await import("../../../services/shelfService"))
        .default;
      const shelvesResp = await shelfService.getAll({ limit: 100 });
      if (shelvesResp && shelvesResp.success && shelvesResp.data) {
        setShelves(shelvesResp.data || []);
      } else {
        console.warn("Failed to load shelves list", shelvesResp);
        setShelves([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setErrorMessage("Error loading product shelf data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveProduct = async () => {
    if (!selectedNewShelf) {
      setErrorMessage("Please select a shelf to move the product to");
      return;
    }

    try {
      setIsSubmitting(true);

      // Call move API
      const response = await productShelfService.moveProductToShelf(id, {
        new_shelf_id: selectedNewShelf._id,
      });

      if (response.success) {
        setSuccessMessage(
          `Successfully moved ${mappingQuantity} units to ${selectedNewShelf.shelf_number}!`
        );
        setTimeout(() => navigate("/shelf-product"), 1500);
      } else {
        setErrorMessage(response.message || "Failed to move product");
      }
    } catch (error) {
      console.error("Error moving product:", error);
      setErrorMessage("Error moving product to new shelf");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-shelf-product-view">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div
            className="spinner"
            style={{
              margin: "0 auto",
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ marginTop: "1rem", color: "#64748b" }}>
            Loading product data...
          </p>
        </div>
      </div>
    );
  }

  if (!productInfo || !currentShelf) {
    return (
      <div className="edit-shelf-product-view">
        <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>
          Product or shelf information not found
        </div>
      </div>
    );
  }

  // Filter out current shelf from available shelves
  const availableShelves = shelves.filter(
    (shelf) => shelf._id !== currentShelf._id
  );

  return (
    <div className="edit-shelf-product-view">
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {/* Header */}
      <div className="edit-shelf-header">
        <button
          className="edit-shelf-back-btn"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          <FaArrowLeft className="back-icon" />
          Back
        </button>
        <div>
          <h1 className="edit-shelf-page-title">Update Location</h1>
          <p className="edit-shelf-page-subtitle">
            Move product to a different shelf
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="edit-shelf-main-content">
        {/* Left Panel - Product Information */}
        <div className="edit-shelf-left-panel">
          <div className="product-info-card">
            <h2 className="card-title">
              <FaBox className="title-icon" />
              {productInfo.name}
            </h2>
            <p className="product-category">{productInfo.category}</p>

            <div className="product-details-grid">
              <div className="detail-item">
                <label>Product ID</label>
                <span>
                  {productInfo._id?.slice(-6) || productInfo.sku || "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <label>Section</label>
                <span>{currentShelf.shelf_name || "N/A"}</span>
              </div>

              <div className="detail-item">
                <label>Shelf Location</label>
                <span>{currentShelf.shelf_number || "N/A"}</span>
              </div>

              <div className="detail-item">
                <label>Slot</label>
                <span>{currentShelf.section_number || "N/A"}</span>
              </div>

              <div className="detail-item">
                <label>Supplier</label>
                <span>{productInfo.supplier_id?.name || "Unknown"}</span>
              </div>

              <div className="detail-item">
                <label>Quantity</label>
                <span className="quantity-value">{mappingQuantity}</span>
              </div>
            </div>

            <div className="status-section">
              <label>Status</label>
              <span className="status-badge in-stock">In Stock</span>
            </div>

            <div className="description-section">
              <label>Description</label>
              <p>{productInfo.description || "No description available"}</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Select Shelf */}
        <div className="edit-shelf-right-panel">
          <h2 className="panel-title">Select Shelf</h2>

          {availableShelves.length === 0 ? (
            <div className="no-shelves-message">
              <p>No other shelves available</p>
            </div>
          ) : (
            <div className="shelves-list">
              {availableShelves.map((shelf) => {
                const isSelected = selectedNewShelf?._id === shelf._id;
                const currentQty = shelf.current_quantity || 0;
                // Use capacity from shelf data (no hard-coded default)
                const capacity = shelf.capacity ?? 0;
                const available = capacity - currentQty;
                const utilization =
                  capacity > 0 ? (currentQty / capacity) * 100 : 0;
                const canFit = available >= mappingQuantity;

                return (
                  <div
                    key={shelf._id}
                    className={`shelf-card ${isSelected ? "selected" : ""} ${
                      !canFit ? "insufficient-space" : ""
                    }`}
                    onClick={() => canFit && setSelectedNewShelf(shelf)}
                  >
                    <div className="shelf-card-header">
                      <input
                        type="radio"
                        name="selectedShelf"
                        checked={isSelected}
                        onChange={() => canFit && setSelectedNewShelf(shelf)}
                        disabled={!canFit}
                        className="shelf-radio"
                      />
                      <div className="shelf-info">
                        <h3 className="shelf-id">{shelf.shelf_number}</h3>
                        <p className="shelf-name">
                          {shelf.description || `Shelf ${shelf.shelf_name}`}
                        </p>
                      </div>
                    </div>

                    <div className="shelf-details">
                      <div className="detail-row">
                        <span>Location:</span>
                        <span className="detail-value">
                          {shelf.shelf_number}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Section:</span>
                        <span className="detail-value">{shelf.shelf_name}</span>
                      </div>
                      <div className="detail-row">
                        <span>Slot:</span>
                        <span className="detail-value">
                          {shelf.section_number}
                        </span>
                      </div>
                    </div>

                    <div className="capacity-info">
                      <div className="capacity-header">
                        <span>Capacity</span>
                        <span className="capacity-text">
                          {currentQty}/{capacity}
                        </span>
                      </div>
                      <div className="capacity-bar-container">
                        <div
                          className="capacity-bar-fill"
                          style={{ width: `${utilization}%` }}
                        ></div>
                      </div>
                      <div className="available-space">
                        <span>Available: </span>
                        <span
                          className={`available-value ${
                            canFit ? "positive" : "negative"
                          }`}
                        >
                          {available}
                        </span>
                        {!canFit && (
                          <span className="insufficient-label">
                            Insufficient space
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button */}
          {selectedNewShelf && (
            <div className="action-bar">
              <button
                className="move-product-btn"
                onClick={handleMoveProduct}
                disabled={isSubmitting}
              >
                <FaArrowLeft
                  className="btn-icon"
                  style={{ transform: "rotate(180deg)" }}
                />
                {isSubmitting
                  ? "Moving..."
                  : `Move product to ${selectedNewShelf.shelf_number}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditShelfProduct;
