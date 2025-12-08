import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaSave } from "react-icons/fa";
import "./EditCustomerView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const EditCustomerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "David Wilson",
    email: "customer@gmail.com",
    phone: "+1234567890",
    dateOfBirth: "1985-03-20",
    gender: "Male",
    address: "654 Maple Drive, Greenfield, CA 94005",
    membershipType: "Regular",
    status: "Active",
    notes: "",
    customerId: "CUS001",
    username: "davidwilson",
    totalPurchases: "3200.00",
    loyaltyPoints: "320",
    lastPurchase: "Oct 31, 2025",
    membershipSince: "Feb 28, 2024",
    createdAt: "Feb 28, 2024",
    updatedAt: "Nov 26, 2025",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Customer data updated:", formData);

      // Show success message and redirect
      setSuccessMessage("Customer updated successfully!");
      setTimeout(() => {
        navigate("/customer");
      }, 2000);
    } catch (error) {
      console.error("Error updating customer:", error);
      setErrorMessage("Error updating customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="edit-customer-view">
      <SuccessMessage
        message={successMessage}
        onClose={() => {
          setSuccessMessage("");
        }}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => {
          setErrorMessage("");
        }}
      />
      {/* Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Edit Customer</h1>
      </div>

      {/* Main Content */}
      <div className="edit-customer-content">
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
                    <span className="edit-customer-error">
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
                    <span className="edit-customer-error">{errors.email}</span>
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
                    <span className="edit-customer-error">{errors.phone}</span>
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
                    <span className="edit-customer-error">
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
                    <span className="edit-customer-error">{errors.gender}</span>
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
                    <span className="edit-customer-error">
                      {errors.address}
                    </span>
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
                  <input
                    type="text"
                    id="membershipType"
                    name="membershipType"
                    value={formData.membershipType}
                    className="customer-form-input readonly"
                    readOnly
                  />
                  {errors.membershipType && (
                    <span className="edit-customer-error">
                      {errors.membershipType}
                    </span>
                  )}
                </div>

                <div className="customer-form-group">
                  <label htmlFor="status" className="customer-form-label">
                    Status
                  </label>
                  <input
                    type="text"
                    id="status"
                    name="status"
                    value={formData.status}
                    className="customer-form-input readonly"
                    readOnly
                  />
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

        {/* Customer Stats Panel */}
        <div className="customer-stats-panel">
          <h2 className="customer-stats-title">Customer Stats</h2>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Customer ID</label>
            <span className="customer-stats-value">{formData.customerId}</span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Username</label>
            <span className="customer-stats-value">{formData.username}</span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Total Purchases</label>
            <span className="customer-stats-value">
              ${formData.totalPurchases}
            </span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Loyalty Points</label>
            <span className="customer-stats-value">
              {formData.loyaltyPoints}
            </span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Last Purchase</label>
            <span className="customer-stats-value">
              {formData.lastPurchase}
            </span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Membership Since</label>
            <span className="customer-stats-value">
              {formData.membershipSince}
            </span>
          </div>

          <div className="customer-stats-actions">
            <button
              type="submit"
              form="customer-form"
              className="update-customer-btn"
              disabled={isSubmitting}
            >
              <FaSave className="update-icon" />
              {isSubmitting ? "Updating Customer..." : "Update Customer"}
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerView;
