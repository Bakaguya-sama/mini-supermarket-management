import React from "react";
import "./ErrorMessage.css";

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-message-overlay" onClick={onClose}>
      <div
        className="error-message-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="error-message-icon">⚠️</div>
        <div className="error-message-content">
          <h3 className="error-message-title">Sign In Error</h3>
          <p className="error-message-text">{message}</p>
        </div>
        <button className="error-message-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;
