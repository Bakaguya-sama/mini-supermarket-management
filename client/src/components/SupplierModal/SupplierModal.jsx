import React from "react";
import { useNavigate } from "react-router-dom";
import "./SupplierModal.css";

const SupplierModal = ({ supplier, onClose }) => {
  const navigate = useNavigate();
  if (!supplier) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditClick = () => {
    onClose();
    navigate(`/suppliers/edit/${supplier._id}`);
  };

  return (
    <div className="supplier-modal-overlay" onClick={handleOverlayClick}>
      <div className="supplier-modal-content">
        {/* Modal Header */}
        <div className="supplier-modal-header">
          <div className="supplier-modal-info">
            <h2 className="supplier-modal-name">{supplier.name}</h2>
            <p className="supplier-modal-contact">{supplier.contact_person_name}</p>
          </div>
          <button className="supplier-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Supplier Image */}
        <div className="supplier-modal-image-section">
          <img
            src={supplier.image_link || "https://placehold.co/400"}
            alt={supplier.name}
            className="supplier-modal-image"
            onError={(e) => {
              e.target.src = "https://placehold.co/400";
            }}
          />
        </div>

        {/* Modal Body */}
        <div className="supplier-modal-body">
          <div className="supplier-modal-info-grid">
            {/* Basic Information */}
            <div className="supplier-modal-info-row">
              <div className="supplier-modal-info-item">
                <label>Supplier ID</label>
                <p>{supplier._id || "N/A"}</p>
              </div>
              <div className="supplier-modal-info-item">
                <label>Status</label>
                <p>
                  <span
                    className={`supplier-status-badge ${
                      supplier.is_active ? "active" : "inactive"
                    }`}
                  >
                    {supplier.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            <div className="supplier-modal-info-row">
              <div className="supplier-modal-info-item">
                <label>Email</label>
                <p>{supplier.email || "N/A"}</p>
              </div>
              <div className="supplier-modal-info-item">
                <label>Phone</label>
                <p>{supplier.phone || "N/A"}</p>
              </div>
            </div>

            <div className="supplier-modal-info-row">
              <div className="supplier-modal-info-item">
                <label>Website</label>
                <p>{supplier.website || "N/A"}</p>
              </div>
              <div className="supplier-modal-info-item">
                <label>Tax ID</label>
                <p>{supplier.tax_id || "N/A"}</p>
              </div>
            </div>

            <div className="supplier-modal-info-row">
              <div className="supplier-modal-info-item">
                <label>Contact Person</label>
                <p>{supplier.contact_person_name || "N/A"}</p>
              </div>
            </div>

            <div className="supplier-modal-info-row">
              <div className="supplier-modal-info-item supplier-modal-full-width">
                <label>Address</label>
                <p>{supplier.address || "N/A"}</p>
              </div>
            </div>

            {supplier.note && (
              <div className="supplier-modal-info-row">
                <div className="supplier-modal-info-item supplier-modal-full-width">
                  <label>Notes</label>
                  <p>{supplier.note}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="supplier-modal-footer">
          <button
            className="supplier-modal-btn-edit"
            onClick={handleEditClick}
          >
            ✏️ Edit Supplier
          </button>
          <button
            className="supplier-modal-btn-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
