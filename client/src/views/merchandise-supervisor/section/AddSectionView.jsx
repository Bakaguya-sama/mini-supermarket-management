import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLayerGroup } from "react-icons/fa";
import "./AddSectionView.css";
import sectionService from "../../../services/sectionService";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const AddSectionView = () => {
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    sectionName: "",
    shelfCount: "",
    note: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.sectionName.trim()) {
      setErrorMessage("Section name is required");
      return false;
    }
    if (!formData.shelfCount || formData.shelfCount < 0) {
      setErrorMessage("Valid shelf count is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    setErrorMessage("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const sectionData = {
        section_name: formData.sectionName.trim(),
        shelf_count: parseInt(formData.shelfCount) || 0,
        note: formData.note.trim(),
      };

      const response = await sectionService.create(sectionData);

      if (response.success) {
        setSuccessMessage("Section created successfully!");

        // Wait a bit to show success message, then navigate
        setTimeout(() => {
          navigate("/sections");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Failed to create section");
      }
    } catch (error) {
      console.error("Error creating section:", error);
      setErrorMessage(
        error.message || "An error occurred while creating section"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/sections");
  };

  return (
    <div className="add-section-view">
      {/* Messages */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {/* Header */}
      <div className="add-section-page-header">
        <h1 className="add-section-page-title">Add New Section</h1>
      </div>

      {/* Content */}
      <div className="add-section-content">
        {/* Form Container */}
        <div className="add-section-form-container">
          <form id="section-form" onSubmit={handleSubmit}>
            {/* Section Information */}
            <div className="add-section-form-section">
              <h2 className="add-section-section-title">Section Information</h2>

              <div className="add-section-form-row">
                <div className="add-section-form-group">
                  <label
                    htmlFor="sectionName"
                    className="add-section-form-label"
                  >
                    Section Name
                  </label>
                  <input
                    type="text"
                    id="sectionName"
                    name="sectionName"
                    value={formData.sectionName}
                    onChange={handleInputChange}
                    placeholder="Enter section name"
                    className="add-section-form-input"
                    required
                  />
                </div>

                <div className="add-section-form-group">
                  <label
                    htmlFor="shelfCount"
                    className="add-section-form-label"
                  >
                    Number of Shelves
                  </label>
                  <input
                    type="number"
                    id="shelfCount"
                    name="shelfCount"
                    value={formData.shelfCount}
                    onChange={handleInputChange}
                    placeholder="Enter number of shelves"
                    className="add-section-form-input"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="add-section-form-row">
                <div className="add-section-form-group add-section-full-width">
                  <label htmlFor="note" className="add-section-form-label">
                    Note
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Additional notes about this section..."
                    className="add-section-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="add-section-sidebar">
          {/* Action Panel */}
          <div className="add-section-action-panel">
            <button
              type="submit"
              form="section-form"
              className="add-section-btn"
              disabled={isLoading}
            >
              <FaLayerGroup className="add-section-add-icon" />
              {isLoading ? "Creating..." : "Add Section"}
            </button>
            <button
              onClick={handleCancel}
              className="add-section-cancel-btn"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSectionView;
