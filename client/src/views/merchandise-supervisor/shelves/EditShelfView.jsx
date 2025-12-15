import React, { useState, useEffect } from "react";
import sectionService from "../../../services/sectionService";
import { useNavigate, useParams } from "react-router-dom";
import { FaBox } from "react-icons/fa";
import "./EditShelfView.css";
import shelfService from "../../../services/shelfService";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const EditShelfView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    shelfNumber: "",
    category: "",
    capacity: "",
    currentCapacity: "",
    location: "",
    note: "",
    section: "",
  });

  const [sections, setSections] = useState([]);

  // Load shelf data on component mount
  useEffect(() => {
    const loadShelfData = async () => {
      try {
        setIsLoadingData(true);
        const [shelfRes, sectionRes] = await Promise.all([
          shelfService.getById(id),
          sectionService.getAll(),
        ]);
        if (sectionRes.success && sectionRes.data) {
          setSections(sectionRes.data);
        }
        if (shelfRes.success && shelfRes.data) {
          const shelf = shelfRes.data;
          setFormData({
            shelfNumber: shelf.shelf_number || "",
            category: shelf.category || "",
            capacity: shelf.capacity || "",
            currentCapacity: shelf.current_capacity || 0,
            location: shelf.location || "",
            note: shelf.note || "",
            section: shelf.section?._id || "",
          });
        } else {
          setErrorMessage("Failed to load shelf data");
        }
      } catch (error) {
        console.error("Error loading shelf or sections:", error);
        setErrorMessage(error.message || "Failed to load shelf data");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadShelfData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.shelfNumber.trim()) {
      setErrorMessage("Shelf number is required");
      return false;
    }
    if (!formData.category) {
      setErrorMessage("Category is required");
      return false;
    }
    if (!formData.capacity || formData.capacity <= 0) {
      setErrorMessage("Valid capacity is required");
      return false;
    }
    if (!formData.location.trim()) {
      setErrorMessage("Location is required");
      return false;
    }
    if (!formData.section) {
      setErrorMessage("Section is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const shelfData = {
        shelf_number: formData.shelfNumber,
        category: formData.category,
        capacity: parseInt(formData.capacity),
        location: formData.location,
        note: formData.note,
        section: formData.section,
      };

      const response = await shelfService.update(id, shelfData);

      if (response.success) {
        setSuccessMessage("Shelf updated successfully!");
        setTimeout(() => {
          navigate("/shelves");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Failed to update shelf");
      }
    } catch (error) {
      console.error("Error updating shelf:", error);
      setErrorMessage(error.message || "Failed to update shelf");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/shelves");
  };

  if (isLoadingData) {
    return (
      <div className="edit-shelf-view">
        <div className="edit-shelf-page-header">
          <h1 className="edit-shelf-page-title">Edit Shelf</h1>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          <p>Loading shelf data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-shelf-view">
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
      <div className="edit-shelf-page-header">
        <h1 className="edit-shelf-page-title">Edit Shelf</h1>
      </div>

      {/* Content */}
      <div className="edit-shelf-content">
        {/* Form Container */}
        <div className="edit-shelf-form-container">
          <form id="shelf-form" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="edit-shelf-form-section">
              <h2 className="edit-shelf-section-title">Basic Information</h2>

              <div className="edit-shelf-form-row">
                <div className="edit-shelf-form-group">
                  <label htmlFor="section" className="edit-shelf-form-label">
                    Section
                  </label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="edit-shelf-form-select"
                    required
                  >
                    <option value="">Select section</option>
                    {sections.map((section) => (
                      <option key={section._id} value={section._id}>
                        {section.section_name || section.name || section._id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="edit-shelf-form-group">
                  <label
                    htmlFor="shelfNumber"
                    className="edit-shelf-form-label"
                  >
                    Shelf Number
                  </label>
                  <input
                    type="text"
                    id="shelfNumber"
                    name="shelfNumber"
                    value={formData.shelfNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., A1, B2, C3"
                    className="edit-shelf-form-input"
                    required
                  />
                </div>

                <div className="edit-shelf-form-group">
                  <label htmlFor="category" className="edit-shelf-form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="edit-shelf-form-select"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Meat">Meat</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household">Household</option>
                    <option value="Grains">Grains</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Frozen Foods">Frozen Foods</option>
                    <option value="Canned Foods">Canned Foods</option>
                    <option value="Condiments">Condiments</option>
                    <option value="Pet Supplies">Pet Supplies</option>
                    <option value="Baby Products">Baby Products</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="edit-shelf-form-row">
                <div className="edit-shelf-form-group">
                  <label htmlFor="capacity" className="edit-shelf-form-label">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Maximum number of items"
                    className="edit-shelf-form-input"
                    min="1"
                    required
                  />
                </div>

                <div className="edit-shelf-form-group">
                  <label
                    htmlFor="currentCapacity"
                    className="edit-shelf-form-label"
                  >
                    Current Capacity
                  </label>
                  <input
                    type="number"
                    id="currentCapacity"
                    name="currentCapacity"
                    value={formData.currentCapacity}
                    className="edit-shelf-form-input"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="edit-shelf-form-row">
                <div className="edit-shelf-form-group edit-shelf-full-width">
                  <label htmlFor="location" className="edit-shelf-form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main aisle, left side"
                    className="edit-shelf-form-input"
                    required
                  />
                </div>
              </div>

              <div className="edit-shelf-form-row">
                <div className="edit-shelf-form-group edit-shelf-full-width">
                  <label htmlFor="note" className="edit-shelf-form-label">
                    Note
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Additional notes about this shelf..."
                    className="edit-shelf-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="edit-shelf-sidebar">
          {/* Action Panel */}
          <div className="edit-shelf-action-panel">
            <button
              type="submit"
              form="shelf-form"
              className="edit-shelf-btn"
              disabled={isLoading}
            >
              <FaBox className="edit-shelf-save-icon" />
              {isLoading ? "Updating..." : "Update Shelf"}
            </button>
            <button
              onClick={handleCancel}
              className="edit-shelf-cancel-btn"
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

export default EditShelfView;
