import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBuilding, FaSave } from "react-icons/fa";
import "./EditSupplierView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

// Edit Supplier View Component
const EditSupplierView = () => {
  const { id } = useParams();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    supplierName: "Fresh Farm Produce Co.",
    contactPerson: "John Anderson",
    email: "supplier@gmail.com",
    phone: "+1234567890",
    website: "https://www.supplier.com",
    address: "123 Farm Road, Green Valley, CA 94123",
    category: "Fresh Produce",
    status: "Active",
    taxId: "TAX123456789",
    paymentTerms: "Net 30",
    bankName: "Valley Bank",
    accountNumber: "1234567890123",
    notes:
      "Reliable supplier for fresh produce with excellent quality standards.",
    supplierId: "SUP001",
    lastOrderDate: "Oct 31, 2025",
    createdAt: "Jan 10, 2023",
    updatedAt: "Oct 31, 2025",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form updated:", formData);
    // Add your form submission logic here
    // TODO: Implement success message here
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="edit-supplier-view">
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
      <div className="supplier-edit-page-header">
        <h1 className="supplier-edit-page-title">Edit Supplier</h1>
      </div>

      {/* Main Content */}
      <div className="edit-supplier-content">
        {/* Form Container */}
        <div className="supplier-edit-form-container">
          <form id="supplier-form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="supplier-edit-form-section">
              <h2 className="supplier-edit-section-title">Basic Information</h2>

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group supplier-edit-full-width">
                  <label
                    htmlFor="supplierName"
                    className="supplier-edit-form-label"
                  >
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    id="supplierName"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleInputChange}
                    placeholder="Enter supplier name"
                    className="supplier-edit-form-input"
                    required
                  />
                </div>
              </div>

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group">
                  <label
                    htmlFor="contactPerson"
                    className="supplier-edit-form-label"
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
                    className="supplier-edit-form-input"
                    required
                  />
                </div>
                <div className="supplier-edit-form-group">
                  <label
                    htmlFor="category"
                    className="supplier-edit-form-label"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="supplier-edit-form-select"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household Items">Household Items</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Office Supplies">Office Supplies</option>
                  </select>
                </div>
              </div>

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group">
                  <label htmlFor="email" className="supplier-edit-form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="supplier@gmail.com"
                    className="supplier-edit-form-input"
                    required
                  />
                </div>
                <div className="supplier-edit-form-group">
                  <label htmlFor="phone" className="supplier-edit-form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="supplier-edit-form-input"
                    required
                  />
                </div>
              </div>

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group supplier-edit-full-width">
                  <label htmlFor="website" className="supplier-edit-form-label">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.supplier.com"
                    className="supplier-edit-form-input"
                  />
                </div>
              </div>

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group supplier-edit-full-width">
                  <label htmlFor="address" className="supplier-edit-form-label">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    className="supplier-edit-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Business & Payment Details Section */}
            <div className="supplier-edit-form-section">
              <h2 className="supplier-edit-section-title">
                Business & Payment Details
              </h2>

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group">
                  <label htmlFor="taxId" className="supplier-edit-form-label">
                    Tax ID / Business Number
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="Enter tax ID"
                    className="supplier-edit-form-input"
                  />
                </div>
                <div className="supplier-edit-form-group">
                  <label
                    htmlFor="paymentTerms"
                    className="supplier-edit-form-label"
                  >
                    Payment Terms
                  </label>
                  <select
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    className="supplier-edit-form-select"
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

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group">
                  <label
                    htmlFor="bankName"
                    className="supplier-edit-form-label"
                  >
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter bank name"
                    className="supplier-edit-form-input"
                  />
                </div>
                <div className="supplier-edit-form-group">
                  <label
                    htmlFor="accountNumber"
                    className="supplier-edit-form-label"
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
                    className="supplier-edit-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="supplier-edit-form-section">
              <h2 className="supplier-edit-section-title">
                Additional Information
              </h2>

              <div className="supplier-edit-form-row">
                <div className="supplier-edit-form-group supplier-edit-full-width">
                  <label htmlFor="notes" className="supplier-edit-form-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes about the supplier"
                    className="supplier-edit-form-textarea"
                    rows="6"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Supplier Stats Panel */}
        <div className="supplier-stats-panel">
          <h2 className="supplier-stats-title">Supplier Stats</h2>

          <div className="supplier-stats-item">
            <label className="supplier-stats-label">Supplier ID</label>
            <span className="supplier-stats-value">{formData.supplierId}</span>
          </div>

          <div className="supplier-stats-item">
            <label className="supplier-stats-label">Last Updated Date</label>
            <span className="supplier-stats-value">{formData.updatedAt}</span>
          </div>

          <div className="supplier-stats-item">
            <label className="supplier-stats-label">Last Order Date</label>
            <span className="supplier-stats-value">
              {formData.lastOrderDate}
            </span>
          </div>

          <div className="supplier-stats-item">
            <label className="supplier-stats-label">Current Status</label>
            <span className="supplier-stats-value status-active">
              {formData.status}
            </span>
          </div>

          <div className="supplier-status-settings">
            <h3 className="supplier-status-settings-title">
              Status & Settings
            </h3>
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
          </div>

          <div className="supplier-stats-actions">
            <button
              type="submit"
              form="supplier-form"
              className="update-supplier-btn"
            >
              Update Supplier
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

export default EditSupplierView;
