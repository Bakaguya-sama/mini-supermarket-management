import React from "react";
import "./ResolvedConfirmationModal.css";

const ResolvedConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="resolved-modal-overlay" onClick={handleOverlayClick}>
      <div className="resolved-modal-content">
        {/* Header */}
        <div className="resolved-modal-header">
          <h2>Mark as Resolved</h2>
        </div>

        {/* Body */}
        <div className="resolved-modal-body">
          <div className="resolved-warning-icon">
            <div className="resolved-triangle-warning">
              <span>!</span>
            </div>
          </div>
          <div className="resolved-message">
            <p>
              Are you sure you want to mark this damaged product as resolved?
            </p>
            {productName && (
              <span className="resolved-product-name">{productName}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="resolved-modal-footer">
          <button className="resolved-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="resolved-btn-confirm" onClick={handleConfirm}>
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolvedConfirmationModal;
