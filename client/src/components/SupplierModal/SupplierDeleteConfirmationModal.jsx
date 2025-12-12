import React, { useState } from "react";
import "./SupplierDeleteConfirmationModal.css";

const SupplierDeleteConfirmationModal = ({
  supplier,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !supplier) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="supplier-delete-overlay" onClick={handleOverlayClick}>
      <div className="supplier-delete-content">
        {/* Header */}
        <div className="supplier-delete-header">
          <h2>Delete Supplier</h2>
          <button
            className="supplier-delete-close-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="supplier-delete-body">
          <div className="supplier-warning-icon">
            <span>⚠️</span>
          </div>
          <div className="supplier-delete-message">
            <p>Are you sure you want to delete the supplier:</p>
            <p className="supplier-delete-name">
              <strong>{supplier.name}</strong>
            </p>
            <p className="supplier-delete-warning">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="supplier-delete-footer">
          <button
            className="supplier-btn-no"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="supplier-btn-yes"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDeleteConfirmationModal;
