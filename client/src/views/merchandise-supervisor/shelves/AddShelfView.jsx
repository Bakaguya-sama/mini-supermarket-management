import React, { useState, useEffect } from "react";
import sectionService from "../../../services/sectionService";
import { useNavigate } from "react-router-dom";
import { FaBox, FaUpload } from "react-icons/fa";
import "./AddShelfView.css";
import shelfService from "../../../services/shelfService";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const AddShelfView = () => {
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    shelfNumber: "",
    category: "",
    capacity: "",
    location: "",
    note: "",
    section: "",
  });

  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await sectionService.getAll();
        if (response.success && response.data) {
          setSections(response.data);
        }
      } catch (error) {
        console.error("Error loading sections:", error);
      }
    };
    fetchSections();
  }, []);

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
        current_capacity: 0,
        isfull: false,
        location: formData.location,
        note: formData.note,
        section: formData.section,
      };

      const response = await shelfService.create(shelfData);

      if (response.success) {
        setSuccessMessage("Shelf created successfully!");
        setTimeout(() => {
          navigate("/shelves");
        }, 1500);
      } else {
        setErrorMessage(response.message || "Failed to create shelf");
      }
    } catch (error) {
      console.error("Error creating shelf:", error);
      setErrorMessage(error.message || "Failed to create shelf");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/shelves");
  };

  return (
    <div className="add-shelf-view">
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
      <div className="add-shelf-page-header">
        <h1 className="add-shelf-page-title">Add New Shelf</h1>
      </div>

      {/* Content */}
      <div className="add-shelf-content">
        {/* Form Container */}
        <div className="add-shelf-form-container">
          <form id="shelf-form" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="add-shelf-form-section">
              <h2 className="add-shelf-section-title">Basic Information</h2>

              <div className="add-shelf-form-row">
                <div className="add-shelf-form-group">
                  <label htmlFor="section" className="add-shelf-form-label">
                    Section
                  </label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="add-shelf-form-select"
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
                <div className="add-shelf-form-group">
                  <label htmlFor="shelfNumber" className="add-shelf-form-label">
                    Shelf Number
                  </label>
                  <input
                    type="text"
                    id="shelfNumber"
                    name="shelfNumber"
                    value={formData.shelfNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., A1, B2, C3"
                    className="add-shelf-form-input"
                    required
                  />
                </div>

                <div className="add-shelf-form-group">
                  <label htmlFor="category" className="add-shelf-form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="add-shelf-form-select"
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

              <div className="add-shelf-form-row">
                <div className="add-shelf-form-group">
                  <label htmlFor="capacity" className="add-shelf-form-label">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Maximum number of items"
                    className="add-shelf-form-input"
                    min="1"
                    required
                  />
                </div>

                <div className="add-shelf-form-group">
                  <label htmlFor="location" className="add-shelf-form-label">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Main aisle, left side"
                    className="add-shelf-form-input"
                    required
                  />
                </div>
              </div>

              <div className="add-shelf-form-row">
                <div className="add-shelf-form-group add-shelf-full-width">
                  <label htmlFor="note" className="add-shelf-form-label">
                    Note
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Additional notes about this shelf..."
                    className="add-shelf-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="add-shelf-sidebar">
          {/* Action Panel */}
          <div className="add-shelf-action-panel">
            <button
              type="submit"
              form="shelf-form"
              className="add-shelf-btn"
              disabled={isLoading}
            >
              <FaBox className="add-shelf-add-icon" />
              {isLoading ? "Creating..." : "Add Shelf"}
            </button>
            <button
              onClick={handleCancel}
              className="add-shelf-cancel-btn"
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

export default AddShelfView;
