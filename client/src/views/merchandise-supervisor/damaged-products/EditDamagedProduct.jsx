import React, { useState, useEffect } from "react";
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
import * as damagedProductService from "../../../services/damagedProductService";

const EditDamagedProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showResolvedModal, setShowResolvedModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Damaged product data from API
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    supplier: "",
    shelfLocation: "",
    section: "",
    slot: "",
    currentStock: "0",
    damagedQty: "0",
    reason: "",
    customReason: "",
    reportedDate: "",
    reportedBy: "",
    status: "reported",
    lastUpdated: "",
  });

  // Load damaged product data
  useEffect(() => {
    loadDamagedProduct();
  }, [id]);

  const loadDamagedProduct = async () => {
    try {
      setIsLoading(true);
      const response = await damagedProductService.getDamagedProductById(id);

      if (response.success && response.data) {
        const damaged = response.data;
        // Debug: show damaged payload to help diagnose missing shelf fields
        console.debug("EditDamagedProduct: damaged loaded", damaged);

        const product = damaged.product_id;
        const supplier = product?.supplier_id;
        const shelves = damaged.shelves || [];

        // Prefer explicit populated shelf on damaged doc; otherwise use first shelf mapping
        const shelfObj =
          damaged.shelf_id ||
          (shelves[0]?.shelf_id ? shelves[0].shelf_id : shelves[0]?.shelf) ||
          null;

        const shelfLocationVal = shelfObj?.shelf_number || "N/A";
        const sectionVal =
          shelfObj?.shelf_name ??
          shelfObj?.section_number ??
          shelfObj?.shelf_number?.charAt(0) ??
          "N/A";
        const slotVal =
          shelfObj?.section_number ??
          shelfObj?.slot_number ??
          shelfObj?.shelf_number?.slice(1) ??
          "N/A";

        setFormData({
          productId: product?._id || "",
          productName: product?.name || "Unknown Product",
          supplier: supplier?.name || "Unknown Supplier",
          shelfLocation: shelfLocationVal,
          section: sectionVal,
          slot: slotVal,
          currentStock:
            (product?.current_stock ?? product?.stock_quantity)?.toString() ||
            "0",
          damagedQty: damaged.damaged_quantity?.toString() || "0",
          reason: damaged.resolution_action || "",
          customReason: damaged.description || "",
          reportedDate: damaged.discovery_date
            ? new Date(damaged.discovery_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          reportedBy: damaged.reported_by || "System",
          status: damaged.status || "reported",
          lastUpdated: damaged.updatedAt
            ? new Date(damaged.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
        });
      } else {
        setErrorMessage(response.message || "Failed to load damaged product");
      }
    } catch (error) {
      console.error("Error loading damaged product:", error);
      setErrorMessage("Error loading damaged product data");
    } finally {
      setIsLoading(false);
    }
  };

  // Resolution action options - theo UI trong ảnh
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
      // Chỉ xóa customReason khi KHÔNG phải "other"
      customReason: value !== "other" ? "" : prev.customReason,
    }));
  };

  const handleMarkResolved = () => {
    setShowResolvedModal(true);
  };

  const handleConfirmResolved = async () => {
    try {
      setShowResolvedModal(false);
      setIsLoading(true);

      // Call API to adjust inventory and mark as resolved
      const response = await damagedProductService.adjustInventoryForDamaged(
        id,
        {
          inventory_adjusted: true,
        }
      );

      if (response.success) {
        setSuccessMessage(
          "Damaged product marked as resolved and inventory adjusted!"
        );

        // Update local state
        setFormData((prev) => ({
          ...prev,
          status: "resolved",
          lastUpdated: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        }));

        // Reload data to get fresh info
        setTimeout(() => loadDamagedProduct(), 1000);
      } else {
        setErrorMessage(response.message || "Failed to mark as resolved");
      }
    } catch (error) {
      console.error("Error marking as resolved:", error);
      setErrorMessage("Error marking damaged product as resolved");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      // Prepare update data - CHỈ UPDATE INFORMATION FIELDS
      // KHÔNG BAO GỒM: damaged_quantity, product_id, shelf_id
      const updateData = {};

      // resolution_action - expired/damaged/other
      if (formData.reason && formData.reason !== "") {
        updateData.resolution_action = formData.reason;
      }

      // description - nếu chọn "other" thì dùng customReason, nếu không thì dùng reason
      if (
        formData.reason === "other" &&
        formData.customReason &&
        formData.customReason.trim() !== ""
      ) {
        updateData.description = formData.customReason;
        updateData.notes = formData.customReason;
      } else if (formData.reason && formData.reason !== "other") {
        updateData.description = formData.reason;
      }

      // status - chỉ update nếu có giá trị hợp lệ
      if (formData.status && formData.status !== "") {
        updateData.status = formData.status;
      }

      console.log("Sending update data:", updateData);

      const response = await damagedProductService.updateDamagedProduct(
        id,
        updateData
      );

      if (response.success) {
        setSuccessMessage("Damaged product information has been updated!");
        setTimeout(() => navigate(-1), 1500);
      } else {
        setErrorMessage(response.message || "Failed to update damaged product");
      }
    } catch (error) {
      console.error("Error updating damaged product:", error);
      setErrorMessage("Error updating damaged product");
    } finally {
      setIsLoading(false);
    }
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
                    readOnly
                    className="edit-damaged-product-form-input readonly"
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

              {/* Custom Reason - chỉ hiển thị khi chọn "Other reason" */}
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
              {formData.status !== "resolved" &&
                formData.status !== "disposed" && (
                  <button
                    onClick={handleMarkResolved}
                    className="edit-damaged-product-resolve-btn"
                    disabled={isLoading}
                  >
                    <FaCheckCircle className="edit-damaged-product-resolve-icon" />
                    Mark as Resolved
                  </button>
                )}

              <button
                onClick={handleUpdate}
                className="edit-damaged-product-update-btn"
                disabled={isLoading}
              >
                <FaEdit className="edit-damaged-product-update-icon" />
                {isLoading ? "Updating..." : "Update"}
              </button>

              <button
                onClick={handleCancel}
                className="edit-damaged-product-cancel-btn"
                disabled={isLoading}
              >
                <FaTimes className="edit-damaged-product-cancel-icon" />
                Cancel
              </button>
            </div>

            {(formData.status === "resolved" ||
              formData.status === "disposed") && (
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
