import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaSave } from "react-icons/fa";
import customerService from "../../../services/customerService";
import { useNotification } from "../../../hooks/useNotification";
import "./EditCustomerView.css";

const EditCustomerView = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const response = await customerService.getById(id);
        if (response.success && response.data) {
          const customer = response.data;
          setFormData({
            fullName: customer.fullName || "",
            email: customer.email || "",
            phone: customer.phone || "",
            dateOfBirth: customer.dateOfBirth || "",
            gender: customer.gender || "",
            address: customer.address || "",
            membershipType: customer.membershipType || "",
            isActive: customer.isActive !== false,
            notes: customer.notes || "",
          });
        } else {
          showError("Error", "Failed to load customer data");
        }
      } catch (error) {
        showError("Error", error.message || "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomerData();
  }, [id, showError]);

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
      const response = await customerService.update(id, formData);

      if (response.success) {
        showSuccess("Success", "Customer updated successfully!");
        navigate("/customers");
      } else {
        showError("Error", response.message || "Failed to update customer");
      }
    } catch (error) {
      showError("Error", error.message || "Error updating customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="edit-customer-view">
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
                  <label htmlFor="isActive" className="customer-form-label">
                    Status
                  </label>
                  <select
                    id="isActive"
                    name="isActive"
                    value={formData.isActive}
                    onChange={handleInputChange}
                    className="customer-form-input"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
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
