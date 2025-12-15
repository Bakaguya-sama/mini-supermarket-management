import React from "react";
import "./ConfirmationMessage.css";

const ConfirmationMessage = ({
  message,
  onConfirm,
  onCancel,
  title = "Confirm Action",
}) => {
  if (!message) return null;

  return (
    <div className="confirmation-message-overlay" onClick={onCancel}>
      <div
        className="confirmation-message-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-message-icon">?</div>
        <div className="confirmation-message-content">
          <h3 className="confirmation-message-title">{title}</h3>
          <p className="confirmation-message-text">{message}</p>
          <div className="confirmation-message-actions">
            <button
              className="confirmation-btn confirmation-btn-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="confirmation-btn confirmation-btn-confirm"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
        <button className="confirmation-message-close" onClick={onCancel}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ConfirmationMessage;
