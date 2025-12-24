import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTimes } from "react-icons/fa";
import { customerService } from "../../../services/customerService";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import "./AddCustomerView.css";

const AddCustomerView = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    full_name: "",
    address: "",
    membership_type: "Standard",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s+\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Phone format is invalid";
    }

    if (!formData.membership_type) {
      newErrors.membership_type = "Membership type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMessage("Validation Error", "Please fix the form errors");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🛒 Submitting customer form:", formData);

      // Prepare payload with account information and membership
      const customerData = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        membership_type: formData.membership_type,
        notes: formData.notes,
      };

      const response = await customerService.create(customerData);

      if (response.success) {
        setSuccessMessage("Customer created successfully");
        setTimeout(() => {
          navigate("/customer");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Failed to create customer");
      }
    } catch (error) {
      console.error("❌ Error adding customer:", error);
      setErrorMessage(error.message || "Error adding customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    navigate(-1);
  };

  return (
    <div className="add-customer-view">
      {/* Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Add New Customer</h1>
      </div>

      {/* Info Box */}
      <div
        style={{
          backgroundColor: "#e3f2fd",
          border: "1px solid #2196f3",
          borderRadius: "4px",
          padding: "12px",
          marginBottom: "20px",
          marginLeft: "20px",
          marginRight: "20px",
        }}
      >
        <p style={{ margin: 0, color: "#1976d2" }}>
          💡 Info: Fill in the account and membership information below. An
          account will be created automatically when you add the customer.
        </p>
      </div>

      {/* Main Content */}
      <div className="add-customer-content">
        {/* Form Container */}
        <div className="customer-form-container">
          <form id="customer-form" onSubmit={handleSubmit}>
            {/* Account Information Section */}
            <div className="customer-form-section">
              <h2 className="customer-section-title">Account Information</h2>

              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label htmlFor="username" className="customer-form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className={`customer-form-input ${
                      errors.username ? "error" : ""
                    }`}
                    required
                  />
                  {errors.username && (
                    <span className="add-customer-error">
                      {errors.username}
                    </span>
                  )}
                </div>
                <div className="customer-form-group">
                  <label htmlFor="email" className="customer-form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="customer@gmail.com"
                    className={`customer-form-input ${
                      errors.email ? "error" : ""
                    }`}
                    required
                  />
                  {errors.email && (
                    <span className="add-customer-error">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label htmlFor="full_name" className="customer-form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    className={`customer-form-input ${
                      errors.full_name ? "error" : ""
                    }`}
                    required
                  />
                  {errors.full_name && (
                    <span className="add-customer-error">
                      {errors.full_name}
                    </span>
                  )}
                </div>
                <div className="customer-form-group">
                  <label htmlFor="phone" className="customer-form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className={`customer-form-input ${
                      errors.phone ? "error" : ""
                    }`}
                    required
                  />
                  {errors.phone && (
                    <span className="add-customer-error">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="customer-form-row">
                <div className="customer-form-group customer-full-width">
                  <label htmlFor="address" className="customer-form-label">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    className="customer-form-textarea-add"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Membership & Status Section */}
            <div className="customer-form-section">
              <h2 className="customer-section-title">Membership & Status</h2>

              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label
                    htmlFor="membership_type"
                    className="customer-form-label"
                  >
                    Membership Type
                  </label>
                  <select
                    id="membership_type"
                    name="membership_type"
                    value={formData.membership_type}
                    onChange={handleInputChange}
                    className={`customer-form-select ${
                      errors.membership_type ? "error" : ""
                    }`}
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                  {errors.membership_type && (
                    <span className="add-customer-error">
                      {errors.membership_type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="customer-form-section">
              <h2 className="customer-section-title">Additional Information</h2>

              <div className="customer-form-row">
                <div className="customer-form-group customer-full-width">
                  <label htmlFor="notes" className="customer-form-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes about the customer"
                    className="customer-form-textarea-add"
                    rows="6"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Panel */}
        <div className="customer-action-panel">
          <button
            type="submit"
            form="customer-form"
            className="add-customer-btn"
            disabled={isSubmitting}
          >
            <FaUser className="add-icon" />
            {isSubmitting ? "Adding Customer..." : "Add Customer"}
          </button>
          <button onClick={handleCancel} className="cancel-btn">
            <FaTimes />
            Cancel
          </button>
        </div>
      </div>

      {/* Message Components */}
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    </div>
  );
};

export default AddCustomerView;
