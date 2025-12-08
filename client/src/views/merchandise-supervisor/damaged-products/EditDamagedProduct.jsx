import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimes,
  FaBox,
  FaExclamationTriangle,
  FaEdit,
} from "react-icons/fa";
import ResolvedConfirmationModal from "../../../components/DamagedProduct/ResolvedConfirmationModal";
import "./EditDamagedProduct.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const EditDamagedProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showResolvedModal, setShowResolvedModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sample damaged product data
  const [formData, setFormData] = useState({
    productId: "P001",
    productName: "Coca Cola 330ml",
    supplier: "Beverage Co.",
    shelfLocation: "A1",
    section: "A",
    slot: "12",
    currentStock: "45",
    damagedQty: "3",
    reason: "expired",
    customReason: "",
    reportedDate: "Nov 25, 2025",
    reportedBy: "John Doe",
    status: "Pending", // Pending, Resolved
    lastUpdated: "Nov 25, 2025",
  });

  const reasonOptions = [
    { value: "expired", label: "Expired" },
    { value: "damaged", label: "Damaged" },
    { value: "other", label: "Other reason" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      reason: value,
      customReason: value !== "other" ? "" : prev.customReason,
    }));
  };

  const handleMarkResolved = () => {
    setShowResolvedModal(true);
  };

  const handleConfirmResolved = () => {
    const updatedData = {
      ...formData,
      status: "Resolved",
      lastUpdated: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };

    console.log("Marking as resolved:", updatedData);
    setFormData(updatedData);
    // Có thể thêm API call ở đây
    // navigate(-1); // Nếu muốn quay lại sau khi mark resolved
  };

  const handleUpdate = () => {
    const updatedData = {
      ...formData,
      lastUpdated: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };

    console.log("Updating damaged product:", updatedData);
    setSuccessMessage("Damaged product information has been updated!");
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="edit-damaged-product-view">
      <SuccessMessage
        message={successMessage}
        onClose={() => {
          setSuccessMessage("");
        }}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => {
          setErrorMessage("");
        }}
      />
      {/* Header */}
      <div className="edit-damaged-product-page-header">
        <h1 className="edit-damaged-product-page-title">
          Edit Damaged Product
        </h1>
        <p className="edit-damaged-product-page-subtitle">
          Review and update damaged product information
        </p>
      </div>

      {/* Main Content */}
      <div className="edit-damaged-product-content">
        {/* Form Container */}
        <div className="edit-damaged-product-form-container">
          <form id="damaged-product-form">
            {/* Product Information Section */}
            <div className="edit-damaged-product-form-section">
              <h2 className="edit-damaged-product-section-title">
                <FaBox className="edit-damaged-product-section-icon" />
                Product Information
              </h2>

              <div className="edit-damaged-product-form-row">
                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="productId"
                    className="edit-damaged-product-form-label"
                  >
                    Product ID
                  </label>
                  <input
                    type="text"
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    readOnly
                    className="edit-damaged-product-form-input readonly"
                  />
                </div>

                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="productName"
                    className="edit-damaged-product-form-label"
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    readOnly
                    className="edit-damaged-product-form-input readonly"
                  />
                </div>
              </div>

              <div className="edit-damaged-product-form-row">
                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="supplier"
                    className="edit-damaged-product-form-label"
                  >
                    Supplier
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    readOnly
                    className="edit-damaged-product-form-input readonly"
                  />
                </div>

                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="currentStock"
                    className="edit-damaged-product-form-label"
                  >
                    Current Stock
                  </label>
                  <input
                    type="number"
                    id="currentStock"
                    name="currentStock"
                    value={formData.currentStock}
                    readOnly
                    className="edit-damaged-product-form-input readonly"
                  />
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="edit-damaged-product-form-section">
              <h2 className="edit-damaged-product-section-title">
                <FaBox className="edit-damaged-product-section-icon" />
                Shelf Location
              </h2>

              <div className="edit-damaged-product-form-row">
                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="shelfLocation"
                    className="edit-damaged-product-form-label"
                  >
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    id="shelfLocation"
                    name="shelfLocation"
                    value={formData.shelfLocation}
                    readOnly
                    className="edit-damaged-product-form-input readonly"
                  />
                </div>

                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="section"
                    className="edit-damaged-product-form-label"
                  >
                    Section
                  </label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    readOnly
                    className="edit-damaged-product-form-input readonly"
                  />
                </div>

                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="slot"
                    className="edit-damaged-product-form-label"
                  >
                    Slot
                  </label>
                  <input
                    type="text"
                    id="slot"
                    name="slot"
                    value={formData.slot}
                    readOnly
                    className="edit-damaged-product-form-input readonly"
                  />
                </div>
              </div>
            </div>

            {/* Damage Information Section */}
            <div className="edit-damaged-product-form-section">
              <h2 className="edit-damaged-product-section-title">
                <FaExclamationTriangle className="edit-damaged-product-section-icon damage-icon" />
                Damage Information
              </h2>

              <div className="edit-damaged-product-form-row">
                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="damagedQty"
                    className="edit-damaged-product-form-label"
                  >
                    Damaged Quantity
                  </label>
                  <input
                    type="number"
                    id="damagedQty"
                    name="damagedQty"
                    value={formData.damagedQty}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.currentStock}
                    className="edit-damaged-product-form-input"
                  />
                </div>

                <div className="edit-damaged-product-form-group">
                  <label
                    htmlFor="reason"
                    className="edit-damaged-product-form-label"
                  >
                    Reason
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleReasonChange}
                    className="edit-damaged-product-form-select"
                  >
                    <option value="">Select reason...</option>
                    {reasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.reason === "other" && (
                <div className="edit-damaged-product-form-row">
                  <div className="edit-damaged-product-form-group edit-damaged-product-full-width">
                    <label
                      htmlFor="customReason"
                      className="edit-damaged-product-form-label"
                    >
                      Custom Reason
                    </label>
                    <textarea
                      id="customReason"
                      name="customReason"
                      value={formData.customReason}
                      onChange={handleInputChange}
                      placeholder="Please describe the specific reason..."
                      className="edit-damaged-product-form-textarea"
                      rows="3"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Status & Actions Sidebar */}
        <div className="edit-damaged-product-sidebar">
          {/* Status Information Section */}
          <div className="edit-damaged-product-status-section">
            <h3 className="edit-damaged-product-status-title">
              Status Information
            </h3>

            <div className="edit-damaged-product-status-item">
              <label className="edit-damaged-product-status-label">
                Reported Date
              </label>
              <span className="edit-damaged-product-status-value">
                {formData.reportedDate}
              </span>
            </div>

            <div className="edit-damaged-product-status-item">
              <label className="edit-damaged-product-status-label">
                Reported By
              </label>
              <span className="edit-damaged-product-status-value">
                {formData.reportedBy}
              </span>
            </div>

            <div className="edit-damaged-product-status-item">
              <label className="edit-damaged-product-status-label">
                Last Updated
              </label>
              <span className="edit-damaged-product-status-value">
                {formData.lastUpdated}
              </span>
            </div>
          </div>

          {/* Actions Section */}
          <div className="edit-damaged-product-actions-section">
            <h3 className="edit-damaged-product-actions-title">Actions</h3>

            <div className="edit-damaged-product-status-actions">
              {formData.status === "Pending" && (
                <button
                  onClick={handleMarkResolved}
                  className="edit-damaged-product-resolve-btn"
                >
                  <FaCheckCircle className="edit-damaged-product-resolve-icon" />
                  Mark as Resolved
                </button>
              )}

              <button
                onClick={handleUpdate}
                className="edit-damaged-product-update-btn"
              >
                <FaEdit className="edit-damaged-product-update-icon" />
                Update
              </button>

              <button
                onClick={handleCancel}
                className="edit-damaged-product-cancel-btn"
              >
                <FaTimes className="edit-damaged-product-cancel-icon" />
                Cancel
              </button>
            </div>

            {formData.status === "Resolved" && (
              <div className="edit-damaged-product-resolved-notice">
                <FaCheckCircle className="edit-damaged-product-resolved-icon" />
                <span>This issue has been resolved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolved Confirmation Modal */}
      <ResolvedConfirmationModal
        isOpen={showResolvedModal}
        onClose={() => setShowResolvedModal(false)}
        onConfirm={handleConfirmResolved}
        productName={formData.productName}
      />
    </div>
  );
};

export default EditDamagedProduct;
