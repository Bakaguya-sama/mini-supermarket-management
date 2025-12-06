import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaSave } from "react-icons/fa";
import staffService from "../../../services/staffService";
import { useNotification } from "../../../hooks/useNotification";
import "./EditStaffView.css";

const EditStaffView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    position: "",
    employmentType: "",
    isActive: true,
    annualSalary: "",
    hireDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await staffService.getById(id);
        if (response.success && response.data) {
          const staff = response.data;
          setFormData({
            fullName: staff.fullName || "",
            email: staff.email || "",
            phone: staff.phone || "",
            dateOfBirth: staff.dateOfBirth || "",
            address: staff.address || "",
            position: staff.position || "",
            employmentType: staff.employmentType || "",
            isActive: staff.isActive !== false,
            annualSalary: staff.annualSalary || "",
            hireDate: staff.hireDate || "",
            notes: staff.notes || "",
          });
        }
      } catch (error) {
        console.error("Error loading staff:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

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
      const response = await staffService.update(id, formData);
      if (response.success) {
        showSuccess("Success", "Staff updated successfully!");
        navigate("/staff");
      } else {
        showError("Error", response.message || "Failed to update staff");
      }
    } catch (error) {
      showError("Error", error.message || "Error updating staff");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/staff");
  };

  return (
    <div className="edit-staff-view">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Edit Staff</h1>
      </div>

      {/* Main Content */}
      <div className="edit-staff-content">
        {/* Form Container */}
        <div className="form-container">
          <form id="staff-form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="form-section">
              <h2 className="section-title">Basic Information</h2>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter staff name"
                    className="form-input"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="staff@gmail.com"
                    className="form-input"
                    readOnly
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className="form-input"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    className="form-input"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    className="form-textarea"
                    rows="4"
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Employment Details Section */}
            <div className="form-section">
              <h2 className="section-title">Employment Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="position" className="form-label">
                    Position
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select position</option>
                    <option value="Store manager">Store manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Stock Manager">Stock Manager</option>
                    <option value="Security">Security</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="employmentType" className="form-label">
                    Employment Type
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="annualSalary" className="form-label">
                    Annual Salary
                  </label>
                  <input
                    type="number"
                    id="annualSalary"
                    name="annualSalary"
                    value={formData.annualSalary}
                    onChange={handleInputChange}
                    placeholder="$35000"
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hireDate" className="form-label">
                    Hire Date
                  </label>
                  <input
                    type="text"
                    id="hireDate"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="form-section">
              <h2 className="section-title">Additional Information</h2>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="notes" className="form-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes about the staff member"
                    className="form-textarea"
                    rows="6"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Current Status Panel */}
        <div className="status-panel">
          <h2 className="status-title">Current Status</h2>

          <div className="status-item">
            <label className="status-label">Staff ID</label>
            <span className="status-value">{formData.staffId}</span>
          </div>

          <div className="status-item">
            <label className="status-label">Username</label>
            <span className="status-value">{formData.username}</span>
          </div>

          <div className="status-item">
            <label className="status-label">Current Salary</label>
            <span className="status-value">${formData.annualSalary}</span>
          </div>

          <div className="status-item">
            <label className="status-label">Created At</label>
            <span className="status-value">{formData.createdAt}</span>
          </div>

          <div className="status-item">
            <label className="status-label">Updated At</label>
            <span className="status-value">{formData.updatedAt}</span>
          </div>

          <div className="status-actions">
            <button
              type="submit"
              form="staff-form"
              className="update-staff-btn"
            >
              <FaSave className="update-icon" />
              Update Staff
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

export default EditStaffView;
