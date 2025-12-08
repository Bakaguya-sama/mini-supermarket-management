import React from "react";
import "./SuccessMessage.css";

const SuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="success-message-overlay" onClick={onClose}>
      <div
        className="success-message-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-message-icon">✓</div>
        <div className="success-message-content">
          <h3 className="success-message-title">Success</h3>
          <p className="success-message-text">{message}</p>
        </div>
        <button className="success-message-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default SuccessMessage;
