import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddSupplierView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import supplierService from "../../../services/supplierService";

const AddSupplierView = () => {
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    taxId: "",
    note: "",
    isActive: true,
  });

  const [supplierImage, setSupplierImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      setSupplierImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
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
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressedImage);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.supplierName.trim()) {
      setErrorMessage("Supplier name is required");
      return false;
    }
    if (!formData.contactPerson.trim()) {
      setErrorMessage("Contact person is required");
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Phone number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.supplierName,
        contact_person_name: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        website: formData.website || "",
        address: formData.address || "",
        tax_id: formData.taxId || "",
        note: formData.note || "",
        is_active: formData.isActive,
      };

      if (imagePreview) {
        payload.image_link = imagePreview;
      }

      const response = await supplierService.create(payload);

      if (response.success) {
        setSuccessMessage("Supplier created successfully!");
        setTimeout(() => {
          navigate("/suppliers");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Failed to create supplier");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      setErrorMessage(error.message || "Failed to create supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/suppliers");
  };

  return (
    <div className="add-supplier-container">
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      <div className="add-supplier-header">
        <div>
          <h1 className="add-supplier-title">Add New Supplier</h1>
          <p className="add-supplier-breadcrumb">
            <span onClick={handleCancel} style={{ cursor: "pointer", color: "#667eea" }}>
              ← Back to Suppliers
            </span>
          </p>
        </div>
      </div>

      <div className="add-supplier-content-wrapper">
        <div className="add-supplier-form-wrapper">
          <form onSubmit={handleSubmit} className="add-supplier-form">
            <div className="add-supplier-form-section">
              <h2 className="add-supplier-section-title">Basic Information</h2>

              <div className="add-supplier-form-group add-supplier-form-group-full">
                <label className="add-supplier-form-label add-supplier-form-label-required">
                  Supplier Name
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="add-supplier-form-input"
                  required
                />
              </div>

              <div className="add-supplier-form-group">
                <label className="add-supplier-form-label add-supplier-form-label-required">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                  className="add-supplier-form-input"
                  required
                />
              </div>

              <div className="add-supplier-form-group">
                <label className="add-supplier-form-label add-supplier-form-label-required">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="add-supplier-form-input"
                  required
                />
              </div>

              <div className="add-supplier-form-group">
                <label className="add-supplier-form-label add-supplier-form-label-required">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="add-supplier-form-input"
                  required
                />
              </div>

              <div className="add-supplier-form-group">
                <label className="add-supplier-form-label">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Enter website URL"
                  className="add-supplier-form-input"
                />
              </div>

              <div className="add-supplier-form-group add-supplier-form-group-full">
                <label className="add-supplier-form-label">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter supplier address"
                  className="add-supplier-form-textarea"
                  rows="3"
                />
              </div>

              <div className="add-supplier-form-group">
                <label className="add-supplier-form-label">
                  Tax ID
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="Enter tax ID"
                  className="add-supplier-form-input"
                />
              </div>

              <div className="add-supplier-form-group add-supplier-form-group-full">
                <label className="add-supplier-form-label">
                  Notes
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Enter additional notes"
                  className="add-supplier-form-textarea"
                  rows="3"
                />
              </div>

              <div className="add-supplier-form-checkbox-group">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="add-supplier-form-checkbox-input"
                />
                <label htmlFor="isActive" className="add-supplier-form-checkbox-label">
                  Active Supplier
                </label>
              </div>
            </div>

            <div className="add-supplier-form-actions">
              <button
                type="submit"
                className="add-supplier-btn-submit"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Supplier"}
              </button>
              <button
                type="button"
                className="add-supplier-btn-cancel"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="add-supplier-image-section">
          <h2 className="add-supplier-section-title">Supplier Image</h2>
          
          <div
            className="add-supplier-image-upload-area"
            onClick={() => document.getElementById("supplierImage").click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Supplier preview" className="add-supplier-image-preview-img" />
            ) : (
              <div className="add-supplier-image-upload-placeholder">
                <div className="add-supplier-image-upload-icon">📸</div>
                <p>Click to upload</p>
                <span className="add-supplier-image-upload-hint">PNG, JPG up to 2MB</span>
              </div>
            )}
          </div>

          <input
            type="file"
            id="supplierImage"
            name="supplierImage"
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: "none" }}
          />

          {imagePreview && (
            <button
              type="button"
              className="add-supplier-image-remove-btn"
              onClick={() => {
                setImagePreview(null);
                setSupplierImage(null);
              }}
            >
              Remove Image
            </button>
          )}

          <p className="add-supplier-image-info">
            Max file size: 2MB. Recommended: 800x800px
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierView;
