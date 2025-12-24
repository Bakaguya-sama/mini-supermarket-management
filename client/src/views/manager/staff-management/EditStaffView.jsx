import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditStaffView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import staffService from "../../../services/staffService";

const EditStaffView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
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
  const [currentAvatarLink, setCurrentAvatarLink] = useState(null);

  // Load staff on mount
  useEffect(() => {
    loadStaff();
  }, [id]);

  const loadStaff = async () => {
    try {
      setIsLoadingStaff(true);
      const result = await staffService.getById(id);

      console.log("Raw result from staffService.getById():", result);

      // Handle different response formats
      let staff = null;

      if (
        result &&
        result.data &&
        typeof result.data === "object" &&
        result.data._id
      ) {
        // Result is wrapped with data property
        staff = result.data;
      } else if (result && result._id) {
        // Result is directly the staff object
        staff = result;
      } else if (result && result.success === false) {
        // API returned error
        setErrorMessage(result.message || "Failed to load staff");
        return;
      }

      if (staff) {
        // Get account info from populated field
        const accountInfo = staff.account_id || {};

        // Format date for HTML date input (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        setFormData({
          full_name: accountInfo.full_name || "",
          email: accountInfo.email || "",
          phone: accountInfo.phone || "",
          address: accountInfo.address || "",
          date_of_birth: formatDateForInput(accountInfo.date_of_birth),
          position: staff.position || "",
          employment_type: staff.employment_type || "Full-time",
          annual_salary: staff.annual_salary || "",
          hire_date: formatDateForInput(staff.hire_date),
          notes: staff.notes || "",
          is_active: staff.is_active !== undefined ? staff.is_active : true,
        });

        if (accountInfo.avatar_link) {
          setImagePreview(accountInfo.avatar_link);
          setCurrentAvatarLink(accountInfo.avatar_link);
        }
      } else {
        setErrorMessage("No staff data found");
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      setErrorMessage(error.message || "Error loading staff");
    } finally {
      setIsLoadingStaff(false);
    }
  };

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
    if (!formData.full_name.trim()) {
      setErrorMessage("Full name is required");
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
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        date_of_birth: formData.date_of_birth,
        avatar_link:
          imagePreview && imagePreview !== currentAvatarLink
            ? imagePreview
            : undefined,
        position: formData.position,
        employment_type: formData.employment_type,
        annual_salary: formData.annual_salary
          ? parseFloat(formData.annual_salary)
          : 0,
        hire_date: formData.hire_date,
        notes: formData.notes,
        is_active: formData.is_active,
      };

      // Remove undefined properties
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      const result = await staffService.update(id, payload);

      console.log("Update result:", result);
      console.log(
        "Result.success:",
        result?.success,
        "Type:",
        typeof result?.success
      );
      console.log("Result.message:", result?.message);

      // Check if update was successful - handle different response formats
      let updateSuccess = false;

      // Check if success is true (as boolean)
      if (result && result.success === true) {
        updateSuccess = true;
      }
      // Check if success is string 'true'
      else if (result && result.success === "true") {
        updateSuccess = true;
      }
      // Check if we have message indicating success
      else if (
        result &&
        result.message &&
        (result.message.includes("successfully") ||
          result.message.includes("updated"))
      ) {
        updateSuccess = true;
      }
      // Check if we have data (assuming if data exists, update was successful)
      else if (result && result.data) {
        updateSuccess = true;
      }

      if (updateSuccess) {
        setSuccessMessage("Staff updated successfully!");
        setTimeout(() => {
          navigate("/staff");
        }, 1500);
      } else {
        const errorMsg = result?.message || "Failed to update staff";
        console.error("Update failed:", errorMsg, result);
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error("Update error:", error);
      setErrorMessage(error.message || "Error updating staff");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoadingStaff) {
    return (
      <div className="edit-staff-container">
        <p style={{ textAlign: "center", padding: "30px" }}>
          Loading staff information...
        </p>
      </div>
    );
  }

  return (
    <div className="edit-staff-container">
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
      <div className="edit-staff-header">
        <h1 className="edit-staff-title">Edit Staff Member</h1>
        <p className="edit-staff-breadcrumb">Staff Management / Edit Staff</p>
      </div>

      {/* Content Wrapper - 2 Column Layout */}
      <div className="edit-staff-content-wrapper">
        {/* Left Column - Form */}
        <div className="edit-staff-form-wrapper">
          <form onSubmit={handleSubmit} className="edit-staff-form">
            {/* Basic Information Section */}
            <div className="edit-staff-form-section">
              <h2 className="edit-staff-section-title">Basic Information</h2>

              <div className="edit-staff-form-group add-staff-form-group-full">
                <label htmlFor="full_name" className="edit-staff-form-label">
                  <span className="edit-staff-form-label-required">
                    Full Name
                  </span>
                </label>
                <input
                  disabled="true"
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="edit-staff-form-input"
                />
              </div>

              <div className="edit-staff-form-group">
                <label htmlFor="phone" className="edit-staff-form-label">
                  <span className="edit-staff-form-label-required">Phone</span>
                </label>
                <input
                  disabled="true"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="edit-staff-form-input"
                />
              </div>

              <div className="edit-staff-form-group">
                <label htmlFor="email" className="edit-staff-form-label">
                  <span className="edit-staff-form-label-required">Email</span>
                </label>
                <input
                  disabled="true"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="staff@example.com"
                  className="edit-staff-form-input"
                />
              </div>

              <div className="edit-staff-form-group">
                <label
                  htmlFor="date_of_birth"
                  className="edit-staff-form-label"
                >
                  Date of Birth
                </label>
                <input
                  disabled="true"
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="edit-staff-form-input"
                />
              </div>

              <div className="edit-staff-form-group add-staff-form-group-full">
                <label htmlFor="address" className="edit-staff-form-label">
                  Address
                </label>
                <textarea
                  disabled="true"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  className="edit-staff-form-textarea"
                  rows="3"
                />
              </div>
            </div>

            {/* Employment Details Section */}
            <div className="edit-staff-form-section">
              <h2 className="edit-staff-section-title">Employment Details</h2>

              <div className="edit-staff-form-group">
                <label htmlFor="position" className="edit-staff-form-label">
                  <span className="edit-staff-form-label-required">
                    Position
                  </span>
                </label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="edit-staff-form-input"
                >
                  <option value="">Select position</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Merchandise Supervisor">
                    Merchandise Supervisor
                  </option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>

              <div className="edit-staff-form-group">
                <label
                  htmlFor="employment_type"
                  className="edit-staff-form-label"
                >
                  Employment Type
                </label>
                <select
                  id="employment_type"
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                  className="edit-staff-form-input"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div className="edit-staff-form-group">
                <label htmlFor="hire_date" className="edit-staff-form-label">
                  Hire Date
                </label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  className="edit-staff-form-input"
                />
              </div>

              <div className="edit-staff-form-group">
                <label
                  htmlFor="annual_salary"
                  className="edit-staff-form-label"
                >
                  Annual Salary
                </label>
                <input
                  type="number"
                  id="annual_salary"
                  name="annual_salary"
                  value={formData.annual_salary}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="edit-staff-form-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="edit-staff-form-section">
              <h2 className="edit-staff-section-title">
                Additional Information
              </h2>

              <div className="edit-staff-form-group add-staff-form-group-full">
                <label htmlFor="notes" className="edit-staff-form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes"
                  className="edit-staff-form-textarea"
                  rows="4"
                />
              </div>

              <div className="edit-staff-form-group add-staff-form-group-full">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span className="edit-staff-form-label" style={{ margin: 0 }}>
                    Staff is Active
                  </span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="edit-staff-form-actions">
              <button
                type="submit"
                className="edit-staff-btn-submit"
                disabled={isLoading}
              >
                {isLoading ? "Updating Staff..." : "Update Staff"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="edit-staff-btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Avatar Upload */}
        <div className="edit-staff-image-section">
          <h2 className="edit-staff-section-title">Staff Avatar</h2>
          <div
            className="edit-staff-image-upload-area"
            onClick={() => document.getElementById("avatar-input").click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Avatar preview"
                className="edit-staff-image-preview-img"
              />
            ) : (
              <div className="edit-staff-image-upload-placeholder">
                <div className="edit-staff-image-upload-icon">👤</div>
                <p>Click to upload avatar</p>
                <span className="edit-staff-image-upload-hint">
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
          {imagePreview && imagePreview !== currentAvatarLink && (
            <button
              type="button"
              onClick={() => {
                setImagePreview(currentAvatarLink);
                setStaffImage(null);
              }}
              className="edit-staff-image-remove-btn"
            >
              Remove Changes
            </button>
          )}
          <p className="edit-staff-image-info">
            Avatar will be compressed to 800x800px (80% quality)
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditStaffView;
