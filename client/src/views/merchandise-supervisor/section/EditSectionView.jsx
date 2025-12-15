import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaLayerGroup } from "react-icons/fa";
import "./EditSectionView.css";
import sectionService from "../../../services/sectionService";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const EditSectionView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    sectionName: "",
    shelfCount: "",
    note: "",
  });

  // Load section data on component mount
  useEffect(() => {
    const loadSectionData = async () => {
      try {
        setIsLoadingData(true);
        const response = await sectionService.getById(id);

        if (response.success && response.data) {
          const section = response.data;
          setFormData({
            sectionName: section.section_name || "",
            shelfCount: section.shelf_count || 0,
            note: section.note || "",
          });
        } else {
          setErrorMessage("Failed to load section data");
        }
      } catch (error) {
        console.error("Error loading section:", error);
        setErrorMessage(error.message || "Failed to load section data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadSectionData();
  }, [id]);

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
    if (formData.shelfCount === "" || formData.shelfCount < 0) {
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

      const response = await sectionService.update(id, sectionData);

      if (response.success) {
        setSuccessMessage("Section updated successfully!");

        // Wait a bit to show success message, then navigate
        setTimeout(() => {
          navigate("/sections");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Failed to update section");
      }
    } catch (error) {
      console.error("Error updating section:", error);
      setErrorMessage(
        error.message || "An error occurred while updating section"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/sections");
  };

  if (isLoadingData) {
    return (
      <div className="edit-section-view">
        <div className="edit-section-header">
          <h1 className="edit-section-title">Edit Section</h1>
        </div>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading section data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-section-view">
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
      <div className="edit-section-page-header">
        <h1 className="edit-section-page-title">Edit Section</h1>
      </div>

      {/* Content */}
      <div className="edit-section-content">
        {/* Form Container */}
        <div className="edit-section-form-container">
          <form id="section-form" onSubmit={handleSubmit}>
            {/* Section Information */}
            <div className="edit-section-form-section">
              <h2 className="edit-section-section-title">
                Section Information
              </h2>

              <div className="edit-section-form-row">
                <div className="edit-section-form-group">
                  <label
                    htmlFor="sectionName"
                    className="edit-section-form-label"
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
                    className="edit-section-form-input"
                    required
                  />
                </div>

                <div className="edit-section-form-group">
                  <label
                    htmlFor="shelfCount"
                    className="edit-section-form-label"
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
                    className="edit-section-form-input"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="edit-section-form-row">
                <div className="edit-section-form-group edit-section-full-width">
                  <label htmlFor="note" className="edit-section-form-label">
                    Note
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Additional notes about this section..."
                    className="edit-section-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="edit-section-sidebar">
          {/* Action Panel */}
          <div className="edit-section-action-panel">
            <button
              type="submit"
              form="section-form"
              className="edit-section-btn"
              disabled={isLoading}
            >
              <FaLayerGroup className="edit-section-add-icon" />
              {isLoading ? "Updating..." : "Update Section"}
            </button>
            <button
              onClick={handleCancel}
              className="edit-section-cancel-btn"
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

export default EditSectionView;
