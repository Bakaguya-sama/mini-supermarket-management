import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTimes } from "react-icons/fa";
import customerService from "../../../services/customerService";
import { useNotification } from "../../../hooks/useNotification";
import "./AddCustomerView.css";

const AddCustomerView = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    membershipType: "",
    isActive: true,
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
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Phone format is invalid";
    }

    if (!formData.membershipType) {
      newErrors.membershipType = "Membership type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await customerService.create(formData);

      if (response.success) {
        showSuccess("Success", "Customer added successfully!");
        navigate("/customers");
      } else {
        showError("Error", response.message || "Failed to add customer");
      }
    } catch (error) {
      showError("Error", error.message || "Error adding customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    navigate(-1); // Navigate back to previous page
  };

  return (
    <div className="add-customer-view">
      {/* Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Add New Customer</h1>
      </div>

      {/* Main Content */}
      <div className="add-customer-content">
        {/* Form Container */}
        <div className="customer-form-container">
          <form id="customer-form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="customer-form-section">
              <h2 className="customer-section-title">Basic Information</h2>

              <div className="customer-form-row">
                <div className="customer-form-group customer-full-width">
                  <label htmlFor="fullName" className="customer-form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    className={`customer-form-input ${
                      errors.fullName ? "error" : ""
                    }`}
                    required
                  />
                  {errors.fullName && (
                    <span className="add-customer-error">
                      {errors.fullName}
                    </span>
                  )}
                </div>
              </div>

              <div className="customer-form-row">
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
                <div className="customer-form-group">
                  <label htmlFor="dateOfBirth" className="customer-form-label">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    className={`customer-form-input ${
                      errors.dateOfBirth ? "error" : ""
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <span className="add-customer-error">
                      {errors.dateOfBirth}
                    </span>
                  )}
                </div>
                <div className="customer-form-group">
                  <label htmlFor="gender" className="customer-form-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`customer-form-select ${
                      errors.gender ? "error" : ""
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <span className="add-customer-error">{errors.gender}</span>
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
                    className={`customer-form-textarea ${
                      errors.address ? "error" : ""
                    }`}
                    rows="4"
                  />
                  {errors.address && (
                    <span className="add-customer-error">{errors.address}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Membership & Status Section */}
            <div className="customer-form-section">
              <h2 className="customer-section-title">Membership & Status</h2>

              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label
                    htmlFor="membershipType"
                    className="customer-form-label"
                  >
                    Membership Type
                  </label>
                  <select
                    id="membershipType"
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleInputChange}
                    className={`customer-form-select ${
                      errors.membershipType ? "error" : ""
                    }`}
                    required
                  >
                    <option value="">Select membership type</option>
                    <option value="Regular">Regular</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                  {errors.membershipType && (
                    <span className="add-customer-error">
                      {errors.membershipType}
                    </span>
                  )}
                </div>

                <div className="customer-form-group">
                  <label htmlFor="status" className="customer-form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="customer-form-select"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
                    className="customer-form-textarea"
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
    </div>
  );
};

export default AddCustomerView;
