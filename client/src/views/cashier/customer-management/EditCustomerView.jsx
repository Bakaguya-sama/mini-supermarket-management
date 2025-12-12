import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaSave } from "react-icons/fa";
import { customerService } from "../../../services/customerService";
import { useNotification } from "../../../hooks/useNotification";
import SuccessNotification from "../../../components/Notification/SuccessNotification";
import ErrorNotification from "../../../components/Notification/ErrorNotification";
import "./EditCustomerView.css";

const EditCustomerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    successNotification, 
    errorNotification, 
    showSuccess, 
    showError, 
    hideSuccess, 
    hideError 
  } = useNotification();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    membership_type: "Standard",
    notes: "",
  });

  const [customerInfo, setCustomerInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customer data on mount
  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      const response = await customerService.getById(id);

      if (response.success && response.data) {
        const customer = response.data;
        console.log('✅ Customer loaded:', customer);

        // Set form data from customer
        setFormData({
          full_name: customer.account_id?.full_name || '',
          email: customer.account_id?.email || '',
          phone: customer.account_id?.phone || '',
          address: customer.account_id?.address || '',
          membership_type: customer.membership_type || 'Standard',
          notes: customer.notes || '',
        });

        // Store customer info for display
        setCustomerInfo(customer);
      } else {
        showError('Error!', response.message || 'Failed to load customer');
        navigate('/customer');
      }
    } catch (err) {
      console.error('❌ Error fetching customer:', err);
      showError('Error!', 'Error loading customer');
      navigate('/customer');
    } finally {
      setIsLoading(false);
    }
  };

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
      showError('Validation Error', 'Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🛒 Updating customer:', id, formData);

      const response = await customerService.update(id, {
        membership_type: formData.membership_type,
        notes: formData.notes
      });

      if (response.success) {
        showSuccess('Success!', 'Customer updated successfully');
        setTimeout(() => {
          navigate('/customer');
        }, 1500);
      } else {
        showError('Error!', response.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error("❌ Error updating customer:", error);
      showError('Error!', error.message || 'Error updating customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/customer');
  };

  if (isLoading) {
    return (
      <div className="edit-customer-view">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading customer information...</p>
        </div>
      </div>
    );
  }

  if (!customerInfo) {
    return (
      <div className="edit-customer-view">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Customer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-customer-view">
      {/* Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Edit Customer</h1>
      </div>

      {/* Info Box */}
      <div style={{
        backgroundColor: '#f3e5f5',
        border: '1px solid #9c27b0',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '20px',
        marginLeft: '20px',
        marginRight: '20px'
      }}>
        <p style={{ margin: 0, color: '#6a1b9a' }}>
          💡 Note: Account information (email, phone, address) is read-only. Update membership and notes only.
        </p>
      </div>

      {/* Main Content */}
      <div className="edit-customer-content">
        {/* Form Container */}
        <div className="customer-form-container">
          <form id="customer-form" onSubmit={handleSubmit}>
            {/* Account Information Section - Read Only */}
            <div className="customer-form-section">
              <h2 className="customer-section-title">Account Information (Read-Only)</h2>

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
                    disabled
                    className="customer-form-input"
                  />
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
                    disabled
                    className="customer-form-input"
                  />
                </div>
              </div>

              <div className="customer-form-row">
                <div className="customer-form-group">
                  <label htmlFor="phone" className="customer-form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    disabled
                    className="customer-form-input"
                  />
                </div>
                <div className="customer-form-group">
                  <label htmlFor="address" className="customer-form-label">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    disabled
                    className="customer-form-input"
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
                    className="customer-form-textarea"
                    rows="6"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Customer Stats */}
        <div className="customer-stats-section">
          <div className="customer-stats-item">
            <label className="customer-stats-label">Customer ID</label>
            <span className="customer-stats-value">{customerInfo._id?.substring(0, 8) || 'N/A'}</span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Total Purchases</label>
            <span className="customer-stats-value">
              ₫{customerInfo.total_spent?.toLocaleString() || '0'}
            </span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Loyalty Points</label>
            <span className="customer-stats-value">{customerInfo.points_balance || '0'}</span>
          </div>

          <div className="customer-stats-item">
            <label className="customer-stats-label">Membership Since</label>
            <span className="customer-stats-value">
              {customerInfo.registered_at
                ? new Date(customerInfo.registered_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'N/A'}
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

      {/* Notification Components */}
      <SuccessNotification
        isVisible={successNotification.isVisible}
        title={successNotification.title}
        message={successNotification.message}
        onClose={hideSuccess}
      />
      <ErrorNotification
        isVisible={errorNotification.isVisible}
        title={errorNotification.title}
        message={errorNotification.message}
        onClose={hideError}
      />
    </div>
  );
};

export default EditCustomerView;
