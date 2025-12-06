import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBuilding, FaSave } from "react-icons/fa";
import supplierService from "../../../services/supplierService";
import { useNotification } from "../../../hooks/useNotification";
import "./EditSupplierView.css";

// Edit Supplier View Component
const EditSupplierView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setLoading(true);
        const response = await supplierService.getById(id);
        if (response.success && response.data) {
          const supplier = response.data;
          setFormData({
            supplierName: supplier.supplierName || "",
            contactPerson: supplier.contactPerson || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            website: supplier.website || "",
            address: supplier.address || "",
            category: supplier.category || "",
            isActive: supplier.isActive !== false,
            taxId: supplier.taxId || "",
            paymentTerms: supplier.paymentTerms || "",
            bankName: supplier.bankName || "",
            accountNumber: supplier.accountNumber || "",
            notes: supplier.notes || "",
          });
        } else {
          showError("Error", "Failed to load supplier data");
        }
      } catch (error) {
        showError("Error", error.message || "Failed to load supplier data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSupplierData();
  }, [id, showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const response = await supplierService.update(id, formData);

      if (response.success) {
        showSuccess("Success", "Supplier updated successfully!");
        navigate("/supplier");
      } else {
        showError("Error", response.message || "Failed to update supplier");
      }
    } catch (error) {
      showError("Error", error.message || "Error updating supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="edit-supplier-view">
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
              <label htmlFor="isActive" className="supplier-status-label">
                Status
              </label>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive}
                onChange={handleInputChange}
                className="supplier-status-select"
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
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
