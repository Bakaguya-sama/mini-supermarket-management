import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditSupplierView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import supplierService from "../../../services/supplierService";

const EditSupplierView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Load supplier on mount
  useEffect(() => {
    loadSupplier();
  }, [id]);

  const loadSupplier = async () => {
    try {
      setIsLoading(true);
      const response = await supplierService.getById(id);
      
      if (response.success && response.data) {
        const supplier = response.data;
        setFormData({
          supplierName: supplier.name || "",
          contactPerson: supplier.contact_person_name || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          website: supplier.website || "",
          address: supplier.address || "",
          taxId: supplier.tax_id || "",
          note: supplier.note || "",
          isActive: supplier.is_active !== false,
        });
        if (supplier.image_link) {
          setImagePreview(supplier.image_link);
        }
      } else {
        setErrorMessage("Failed to load supplier");
      }
    } catch (error) {
      console.error("Error loading supplier:", error);
      setErrorMessage(error.message || "Failed to load supplier");
    } finally {
      setIsLoading(false);
    }
  };

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

    setIsSubmitting(true);
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

      if (imagePreview && imagePreview.startsWith('data:')) {
        payload.image_link = imagePreview;
      }

      const response = await supplierService.update(id, payload);

      if (response.success) {
        setSuccessMessage("Supplier updated successfully!");
        setTimeout(() => {
          navigate("/suppliers");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Failed to update supplier");
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      setErrorMessage(error.message || "Failed to update supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/suppliers");
  };

  if (isLoading) {
    return (
      <div className="edit-supplier-container">
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="edit-supplier-container">
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      <div className="edit-supplier-header">
        <div>
          <h1 className="edit-supplier-title">Edit Supplier</h1>
          <p className="edit-supplier-breadcrumb">
            <span onClick={handleCancel} style={{ cursor: "pointer", color: "#667eea" }}>
              ← Back to Suppliers
            </span>
          </p>
        </div>
      </div>

      <div className="edit-supplier-content-wrapper">
        <div className="edit-supplier-form-wrapper">
          <form onSubmit={handleSubmit} className="edit-supplier-form">
            <div className="edit-supplier-form-section">
              <h2 className="edit-supplier-section-title">Basic Information</h2>

              <div className="edit-supplier-form-group edit-supplier-form-group-full">
                <label className="edit-supplier-form-label edit-supplier-form-label-required">
                  Supplier Name
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="edit-supplier-form-input"
                  required
                />
              </div>

              <div className="edit-supplier-form-group">
                <label className="edit-supplier-form-label edit-supplier-form-label-required">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                  className="edit-supplier-form-input"
                  required
                />
              </div>

              <div className="edit-supplier-form-group">
                <label className="edit-supplier-form-label edit-supplier-form-label-required">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="edit-supplier-form-input"
                  required
                />
              </div>

              <div className="edit-supplier-form-group">
                <label className="edit-supplier-form-label edit-supplier-form-label-required">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="edit-supplier-form-input"
                  required
                />
              </div>

              <div className="edit-supplier-form-group">
                <label className="edit-supplier-form-label">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Enter website URL"
                  className="edit-supplier-form-input"
                />
              </div>

              <div className="edit-supplier-form-group edit-supplier-form-group-full">
                <label className="edit-supplier-form-label">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter supplier address"
                  className="edit-supplier-form-textarea"
                  rows="3"
                />
              </div>

              <div className="edit-supplier-form-group">
                <label className="edit-supplier-form-label">
                  Tax ID
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="Enter tax ID"
                  className="edit-supplier-form-input"
                />
              </div>

              <div className="edit-supplier-form-group edit-supplier-form-group-full">
                <label className="edit-supplier-form-label">
                  Notes
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Enter additional notes"
                  className="edit-supplier-form-textarea"
                  rows="3"
                />
              </div>

              <div className="edit-supplier-form-checkbox-group">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="edit-supplier-form-checkbox-input"
                />
                <label htmlFor="isActive" className="edit-supplier-form-checkbox-label">
                  Active Supplier
                </label>
              </div>
            </div>

            <div className="edit-supplier-form-actions">
              <button
                type="submit"
                className="edit-supplier-btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Supplier"}
              </button>
              <button
                type="button"
                className="edit-supplier-btn-cancel"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="edit-supplier-image-section">
          <h2 className="edit-supplier-section-title">Supplier Image</h2>
          
          <div
            className="edit-supplier-image-upload-area"
            onClick={() => document.getElementById("supplierImage").click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Supplier preview" className="edit-supplier-image-preview-img" />
            ) : (
              <div className="edit-supplier-image-upload-placeholder">
                <div className="edit-supplier-image-upload-icon">📸</div>
                <p>Click to upload</p>
                <span className="edit-supplier-image-upload-hint">PNG, JPG up to 2MB</span>
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
              className="edit-supplier-image-remove-btn"
              onClick={() => {
                setImagePreview(null);
                setSupplierImage(null);
              }}
            >
              Remove Image
            </button>
          )}

          <p className="edit-supplier-image-info">
            Max file size: 2MB. Recommended: 800x800px
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditSupplierView;
