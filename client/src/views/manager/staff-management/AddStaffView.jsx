import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddStaffView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import staffService from "../../../services/staffService";

const AddStaffView = () => {
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    full_name: "",
    phone: "",
    address: "",
    date_of_birth: "",
    position: "",
    employment_type: "Full-time",
    annual_salary: "",
    hire_date: "",
    notes: "",
    is_active: true,
  });

  const [staffImage, setStaffImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file");
        return;
      }
      setStaffImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxSize = 800;
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedImage = canvas.toDataURL("image/jpeg", 0.8);
          setImagePreview(compressedImage);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setErrorMessage("Username is required");
      return false;
    }
    if (!formData.password.trim()) {
      setErrorMessage("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email");
      return false;
    }
    if (!formData.full_name.trim()) {
      setErrorMessage("Full name is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Phone number is required");
      return false;
    }
    if (!formData.position.trim()) {
      setErrorMessage("Position is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        avatar_link: imagePreview || null,
        position: formData.position,
        employment_type: formData.employment_type,
        annual_salary: formData.annual_salary ? parseFloat(formData.annual_salary) : 0,
        hire_date: formData.hire_date || new Date().toISOString().split("T")[0],
        notes: formData.notes,
        is_active: formData.is_active,
      };

      const result = await staffService.create(payload);

      if (result.success) {
        setSuccessMessage("Staff created successfully!");
        setTimeout(() => {
          navigate("/staff");
        }, 1500);
      } else {
        setErrorMessage(result.message || "Failed to create staff");
      }
    } catch (error) {
      setErrorMessage(error.message || "Error creating staff");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="add-staff-container">
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
      <div className="add-staff-header">
        <h1 className="add-staff-title">Add New Staff Member</h1>
        <p className="add-staff-breadcrumb">Staff Management / Add New Staff</p>
      </div>

      {/* Content Wrapper - 2 Column Layout */}
      <div className="add-staff-content-wrapper">
        {/* Left Column - Form */}
        <div className="add-staff-form-wrapper">
          <form onSubmit={handleSubmit} className="add-staff-form">
            {/* Account Information Section */}
            <div className="add-staff-form-section">
              <h2 className="add-staff-section-title">Account Information</h2>

              <div className="add-staff-form-group add-staff-form-group-full">
                <label htmlFor="username" className="add-staff-form-label">
                  <span className="add-staff-form-label-required">Username</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  className="add-staff-form-input"
                />
              </div>

              <div className="add-staff-form-group add-staff-form-group-full">
                <label htmlFor="password" className="add-staff-form-label">
                  <span className="add-staff-form-label-required">Password</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 6 characters)"
                  className="add-staff-form-input"
                />
              </div>

              <div className="add-staff-form-group add-staff-form-group-full">
                <label htmlFor="email" className="add-staff-form-label">
                  <span className="add-staff-form-label-required">Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="staff@example.com"
                  className="add-staff-form-input"
                />
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="add-staff-form-section">
              <h2 className="add-staff-section-title">Basic Information</h2>

              <div className="add-staff-form-group add-staff-form-group-full">
                <label htmlFor="full_name" className="add-staff-form-label">
                  <span className="add-staff-form-label-required">Full Name</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="add-staff-form-input"
                />
              </div>

              <div className="add-staff-form-group">
                <label htmlFor="phone" className="add-staff-form-label">
                  <span className="add-staff-form-label-required">Phone</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="add-staff-form-input"
                />
              </div>

              <div className="add-staff-form-group">
                <label htmlFor="date_of_birth" className="add-staff-form-label">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="add-staff-form-input"
                />
              </div>

              <div className="add-staff-form-group add-staff-form-group-full">
                <label htmlFor="address" className="add-staff-form-label">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  className="add-staff-form-textarea"
                  rows="3"
                />
              </div>
            </div>

            {/* Employment Details Section */}
            <div className="add-staff-form-section">
              <h2 className="add-staff-section-title">Employment Details</h2>

              <div className="add-staff-form-group">
                <label htmlFor="position" className="add-staff-form-label">
                  <span className="add-staff-form-label-required">Position</span>
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="add-staff-form-input"
                >
                  <option value="">Select position</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Merchandise">Merchandise</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>

              <div className="add-staff-form-group">
                <label htmlFor="employment_type" className="add-staff-form-label">
                  Employment Type
                </label>
                <select
                  id="employment_type"
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                  className="add-staff-form-input"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div className="add-staff-form-group">
                <label htmlFor="hire_date" className="add-staff-form-label">
                  Hire Date
                </label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  className="add-staff-form-input"
                />
              </div>

              <div className="add-staff-form-group">
                <label htmlFor="annual_salary" className="add-staff-form-label">
                  Annual Salary
                </label>
                <input
                  type="number"
                  id="annual_salary"
                  name="annual_salary"
                  value={formData.annual_salary}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="add-staff-form-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="add-staff-form-section">
              <h2 className="add-staff-section-title">Additional Information</h2>

              <div className="add-staff-form-group add-staff-form-group-full">
                <label htmlFor="notes" className="add-staff-form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes"
                  className="add-staff-form-textarea"
                  rows="4"
                />
              </div>

              <div className="add-staff-form-group add-staff-form-group-full">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span className="add-staff-form-label" style={{ margin: 0 }}>Staff is Active</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="add-staff-form-actions">
              <button
                type="submit"
                className="add-staff-btn-submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating Staff..." : "Create Staff"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="add-staff-btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Avatar Upload */}
        <div className="add-staff-image-section">
          <h2 className="add-staff-section-title">Staff Avatar</h2>
          <div
            className="add-staff-image-upload-area"
            onClick={() => document.getElementById("avatar-input").click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Avatar preview" className="add-staff-image-preview-img" />
            ) : (
              <div className="add-staff-image-upload-placeholder">
                <div className="add-staff-image-upload-icon">👤</div>
                <p>Click to upload avatar</p>
                <span className="add-staff-image-upload-hint">
                  JPG, PNG (Max 2MB)
                </span>
              </div>
            )}
          </div>
          <input
            type="file"
            id="avatar-input"
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setStaffImage(null);
              }}
              className="add-staff-image-remove-btn"
            >
              Remove Avatar
            </button>
          )}
          <p className="add-staff-image-info">
            Avatar will be compressed to 800x800px (80% quality)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddStaffView;
