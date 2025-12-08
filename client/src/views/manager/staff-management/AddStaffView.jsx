import React, { useState } from "react";
import { FaUser, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AddStaffView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const AddStaffView = () => {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    position: "",
    employmentType: "Full-time",
    status: "Active",
    annualSalary: "",
    hireDate: "",
    notes: "",
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
    console.log("Form submitted:", formData);
    // Add your form submission logic here
    // TODO: Implement success message here
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    navigate(-1); // Navigate back to previous page
  };

  return (
    <div className="add-staff-view">
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
      <div className="page-header">
        <h1 className="page-title">Add New Staff</h1>
      </div>

      {/* Main Content */}
      <div className="add-staff-content">
        {/* Form Container */}
        <div className="form-container">
          <form id="staff-form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="form-section">
              {/* Account Section */}
              <div className="form-section">
                <h2 className="section-title">Initial Account Information</h2>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="userName" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      placeholder="Enter initial username"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.Password}
                      onChange={handleInputChange}
                      placeholder="Enter initial password"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

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
                    required
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
                    required
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
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth" className="form-label">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    className="form-input"
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
                    placeholder="50.00"
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
                    type="date"
                    id="hireDate"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
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

        {/* Action Panel */}
        <div className="action-panel">
          <button type="submit" form="staff-form" className="add-staff-btn">
            <FaUser className="add-icon" />
            Add Staff
          </button>
          <button onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffView;
