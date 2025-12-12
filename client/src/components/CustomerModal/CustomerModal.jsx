import React from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerModal.css";

const CustomerModal = ({ customer, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen || !customer) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditClick = () => {
    onClose();
    navigate(`/customer/edit/${customer._id || customer.id}`);
  };

  return (
    <div className="customer-modal-overlay" onClick={handleOverlayClick}>
      <div className="customer-modal-content">
        {/* Modal Header */}
        <div className="customer-modal-header">
          <div className="customer-info">
            <h2 className="customer-name">{customer.name}</h2>
            <p className="customer-details">Customer Details</p>
          </div>
          <button className="customer-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="customer-modal-body">
          <div className="customer-info-grid">
            {/* Basic Information */}
            <div className="customer-info-row">
              <div className="customer-info-item">
                <label>Customer ID</label>
                <p>{customer.id?.substring(0, 8) || 'N/A'}</p>
              </div>
              <div className="customer-info-item">
                <label>Username</label>
                <p>{customer.username || "N/A"}</p>
              </div>
            </div>

            <div className="customer-info-row">
              <div className="customer-info-item">
                <label>Email</label>
                <p>{customer.email || 'N/A'}</p>
              </div>
              <div className="customer-info-item">
                <label>Phone</label>
                <p>{customer.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="customer-info-row">
              <div className="customer-info-item customer-full-width">
                <label>Address</label>
                <p>
                  {customer.address || "N/A"}
                </p>
              </div>
            </div>

            <div className="customer-info-row">
              <div className="customer-info-item">
                <label>Total Purchases</label>
                <p>{customer.totalPurchases || "₫0"}</p>
              </div>
              <div className="customer-info-item">
                <label>Loyalty Points</label>
                <p>{customer.loyaltyPoints || 0} points</p>
              </div>
            </div>

            <div className="customer-info-row">
              <div className="customer-info-item">
                <label>Registered At</label>
                <p>
                  {customer.registeredAt
                    ? new Date(customer.registeredAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : "N/A"}
                </p>
              </div>
              <div className="customer-info-item">
                <label>Membership Type</label>
                <p>{customer.membership || "Standard"}</p>
              </div>
            </div>

            <div className="customer-info-row">
              <div className="customer-info-item customer-full-width">
                <label>Membership Status</label>
                <span
                  className={`customer-membership-badge ${
                    customer.membership?.toLowerCase() || "standard"
                  }`}
                >
                  {customer.membership || "Standard"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="customer-modal-footer">
          {customer.isDelete ? (
            <div style={{
              padding: '12px 16px',
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ⚠️ This customer has been deleted and cannot be edited
            </div>
          ) : (
            <button className="edit-customer-btn" onClick={handleEditClick}>
              <span>✏️</span>
              Edit Customer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
