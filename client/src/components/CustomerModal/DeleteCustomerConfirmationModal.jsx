import React from "react";
import "./DeleteCustomerConfirmationModal.css";

const DeleteCustomerConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div className="delete-customer-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-customer-modal-content">
        {/* Header */}
        <div className="delete-customer-modal-header">
          <h2>Delete Customer</h2>
        </div>

        {/* Body */}
        <div className="delete-customer-modal-body">
          <div className="customer-warning-icon">
            <div className="customer-triangle-warning">
              <span>!</span>
            </div>
          </div>
          <div className="delete-customer-message">
            <p>Are you sure you want to delete this customer?</p>
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
              This action will soft delete the customer record. Their data will be preserved in the system.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="delete-customer-modal-footer">
          <button 
            className="delete-customer-btn-no" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="delete-customer-btn-yes" 
            onClick={handleConfirm}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomerConfirmationModal;
