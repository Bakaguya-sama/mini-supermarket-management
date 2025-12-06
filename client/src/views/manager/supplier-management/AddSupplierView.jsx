import React, { useState } from "react";
import { FaBuilding, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import supplierService from "../../../services/supplierService";
import { useNotification } from "../../../hooks/useNotification";
import "./AddSupplierView.css";

const AddSupplierView = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    category: "",
    isActive: true,
    taxId: "",
    paymentTerms: "",
    bankName: "",
    accountNumber: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await supplierService.create(formData);
      if (response.success) {
        showSuccess("Success", "Supplier created successfully");
        navigate("/supplier");
      } else {
        showError("Error", response.message || "Failed to create supplier");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to create supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="add-supplier-view">
      {/* Header */}
      <div className="supplier-page-header">
        <h1 className="supplier-page-title">Create New Supplier</h1>
      </div>

      {/* Main Content */}
      <div className="add-supplier-content">
        {/* Form Container */}
        <div className="supplier-form-container">
          <form id="supplier-form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="supplier-form-section">
              <h2 className="supplier-section-title">Basic Information</h2>

              <div className="supplier-form-row">
                <div className="supplier-form-group supplier-full-width">
                  <label htmlFor="supplierName" className="supplier-form-label">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    id="supplierName"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleInputChange}
                    placeholder="Enter supplier name"
                    className="supplier-form-input"
                    required
                  />
                </div>
              </div>

              <div className="supplier-form-row">
                <div className="supplier-form-group">
                  <label
                    htmlFor="contactPerson"
                    className="supplier-form-label"
                  >
                    Contact Person
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Enter contact person name"
                    className="supplier-form-input"
                    required
                  />
                </div>
                <div className="supplier-form-group">
                  <label htmlFor="category" className="supplier-form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="supplier-form-select"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household Items">Household Items</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Office Supplies">Office Supplies</option>
                  </select>
                </div>
              </div>

              <div className="supplier-form-row">
                <div className="supplier-form-group">
                  <label htmlFor="email" className="supplier-form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="supplier@gmail.com"
                    className="supplier-form-input"
                    required
                  />
                </div>
                <div className="supplier-form-group">
                  <label htmlFor="phone" className="supplier-form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="supplier-form-input"
                    required
                  />
                </div>
              </div>

              <div className="supplier-form-row">
                <div className="supplier-form-group supplier-full-width">
                  <label htmlFor="website" className="supplier-form-label">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.supplier.com"
                    className="supplier-form-input"
                  />
                </div>
              </div>

              <div className="supplier-form-row">
                <div className="supplier-form-group supplier-full-width">
                  <label htmlFor="address" className="supplier-form-label">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    className="supplier-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Business & Payment Details Section */}
            <div className="supplier-form-section">
              <h2 className="supplier-section-title">
                Business & Payment Details
              </h2>

              <div className="supplier-form-row">
                <div className="supplier-form-group">
                  <label htmlFor="taxId" className="supplier-form-label">
                    Tax ID / Business Number
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="Enter tax ID"
                    className="supplier-form-input"
                  />
                </div>
                <div className="supplier-form-group">
                  <label htmlFor="paymentTerms" className="supplier-form-label">
                    Payment Terms
                  </label>
                  <select
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    className="supplier-form-select"
                  >
                    <option value="">Select payment terms</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 7">Net 7</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="2/10 Net 30">2/10 Net 30</option>
                  </select>
                </div>
              </div>

              <div className="supplier-form-row">
                <div className="supplier-form-group">
                  <label htmlFor="bankName" className="supplier-form-label">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter bank name"
                    className="supplier-form-input"
                  />
                </div>
                <div className="supplier-form-group">
                  <label
                    htmlFor="accountNumber"
                    className="supplier-form-label"
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="supplier-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="supplier-form-section">
              <h2 className="supplier-section-title">Additional Information</h2>

              <div className="supplier-form-row">
                <div className="supplier-form-group supplier-full-width">
                  <label htmlFor="notes" className="supplier-form-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes about the supplier"
                    className="supplier-form-textarea"
                    rows="6"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Panel */}
        <div className="supplier-action-panel">
          <div className="supplier-status-section">
            <h3 className="supplier-status-title">Status & Settings</h3>
            <div className="supplier-status-group">
              <label htmlFor="status" className="supplier-status-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="supplier-status-select"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button
              type="submit"
              form="supplier-form"
              className="create-supplier-btn"
            >
              Create Supplier
            </button>
            <button onClick={handleCancel} className="supplier-cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierView;
