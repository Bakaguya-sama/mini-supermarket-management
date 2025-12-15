import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaKey,
} from "react-icons/fa";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import "./CustomerProfilePage.css";

const CustomerProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("Profile updated successfully!");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setErrorMessage("New passwords do not match!");
      return;
    }
    if (passwordData.new.length < 6) {
      setErrorMessage("Password must be at least 6 characters!");
      return;
    }
    setSuccessMessage("Password changed successfully!");
    setShowPasswordDialog(false);
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="customer-profile">
      <div className="customer-profile-container">
        {/* Header */}
        <div className="customer-profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div>
            <h2>
              {formData.firstName} {formData.lastName}
            </h2>
            <p>{formData.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="customer-profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="customer-form-group">
                <label htmlFor="firstName">
                  <FaUser /> First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="customer-form-group">
                <label htmlFor="lastName">
                  <FaUser /> Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="customer-form-group">
              <label htmlFor="email">
                <FaEnvelope /> Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="customer-form-group">
              <label htmlFor="phone">
                <FaPhone /> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Address</h3>
            <div className="customer-form-group">
              <label htmlFor="address">
                <FaMapMarkerAlt /> Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-grid">
              <div className="customer-form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="customer-form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="customer-form-group">
                <label htmlFor="zipCode">Zip Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowPasswordDialog(true)}
              className="change-password-btn"
            >
              <FaKey /> Change Password
            </button>
            <button type="submit" className="save-profile-btn">
              <FaSave /> Save Changes
            </button>
          </div>
        </form>

        {/* Password Change Dialog */}
        {showPasswordDialog && (
          <div
            className="password-dialog-overlay"
            onClick={() => setShowPasswordDialog(false)}
          >
            <div
              className="password-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dialog-header">
                <h3>Change Password</h3>
                <button
                  onClick={() => setShowPasswordDialog(false)}
                  className="close-dialog-btn"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="customer-form-group">
                  <label htmlFor="current">Current Password</label>
                  <input
                    type="password"
                    id="current"
                    name="current"
                    value={passwordData.current}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="customer-form-group">
                  <label htmlFor="new">New Password</label>
                  <input
                    type="password"
                    id="new"
                    name="new"
                    value={passwordData.new}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="customer-form-group">
                  <label htmlFor="confirm">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm"
                    name="confirm"
                    value={passwordData.confirm}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="dialog-actions">
                  <button
                    type="button"
                    onClick={() => setShowPasswordDialog(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-password-btn">
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
    </div>
  );
};

export default CustomerProfilePage;
