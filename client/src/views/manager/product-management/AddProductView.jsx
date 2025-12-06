import React, { useState } from "react";
import { FaBox, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import productService from "../../../services/productService";
import { useNotification } from "../../../hooks/useNotification";
import "./AddProductView.css";

const AddProductView = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    supplier: "",
    origin: "",
    description: "",
    price: "",
    unit: "",
    stockQuantity: "",
    lowStockThreshold: "",
    highStockThreshold: "",
    storageLocation: "",
    sku: "",
    barcode: "",
  });

  const [productImage, setProductImage] = useState(null);
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
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateBarcode = () => {
    const barcode = Math.floor(Math.random() * 1000000000000).toString();
    setFormData((prev) => ({
      ...prev,
      barcode: barcode,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await productService.create(formData);
      if (response.success) {
        showSuccess("Success", "Product created successfully");
        navigate("/products");
      } else {
        showError("Error", response.message || "Failed to create product");
      }
    } catch (err) {
      showError("Error", err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="add-product-view">
      {/* Header */}
      <div className="add-product-page-header">
        <h1 className="add-product-page-title">Add New Product</h1>
      </div>

      {/* Main Content */}
      <div className="add-product-content">
        {/* Form Container */}
        <div className="add-product-form-container">
          <form id="product-form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="add-product-form-section">
              <h2 className="add-product-section-title">Basic Information</h2>

              <div className="add-product-form-row">
                <div className="add-product-form-group add-product-full-width">
                  <label
                    htmlFor="productName"
                    className="add-product-form-label"
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="add-product-form-input"
                    required
                  />
                </div>
              </div>

              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label htmlFor="category" className="add-product-form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="add-product-form-select"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Fruits & Vegetables">
                      Fruits & Vegetables
                    </option>
                    <option value="Bakery">Bakery</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Frozen Foods">Frozen Foods</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Household">Household</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="add-product-form-group">
                  <label htmlFor="supplier" className="add-product-form-label">
                    Supplier
                  </label>
                  <select
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="add-product-form-select"
                    required
                  >
                    <option value="">Select supplier</option>
                    <option value="FreshMart Suppliers">
                      FreshMart Suppliers
                    </option>
                    <option value="GreenField Co.">GreenField Co.</option>
                    <option value="Ocean Fresh">Ocean Fresh</option>
                    <option value="Daily Dairy">Daily Dairy</option>
                    <option value="Global Foods Inc.">Global Foods Inc.</option>
                  </select>
                </div>
              </div>

              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label htmlFor="origin" className="add-product-form-label">
                    Origin
                  </label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Enter the origin of product"
                    className="add-product-form-input"
                  />
                </div>
              </div>

              <div className="add-product-form-row">
                <div className="add-product-form-group add-product-full-width">
                  <label
                    htmlFor="description"
                    className="add-product-form-label"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    className="add-product-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock Section */}
            <div className="add-product-form-section">
              <h2 className="add-product-section-title">Pricing & Stock</h2>

              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label htmlFor="price" className="add-product-form-label">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="$0.00"
                    className="add-product-form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="add-product-form-group">
                  <label htmlFor="unit" className="add-product-form-label">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="add-product-form-select"
                    required
                  >
                    <option value="">Select unit</option>
                    <option value="Kilogram (kg)">Kilogram (kg)</option>
                    <option value="Gram (g)">Gram (g)</option>
                    <option value="Piece">Piece</option>
                    <option value="Pack">Pack</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Can">Can</option>
                    <option value="Box">Box</option>
                    <option value="Liter (L)">Liter (L)</option>
                  </select>
                </div>
              </div>

              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label
                    htmlFor="currentStock"
                    className="add-product-form-label"
                  >
                    Current Stock
                  </label>
                  <input
                    type="number"
                    id="currentStock"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="add-product-form-input"
                    min="0"
                    required
                  />
                </div>
                <div className="add-product-form-group">
                  <label
                    htmlFor="minimumStockLevel"
                    className="add-product-form-label"
                  >
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    id="minimumStockLevel"
                    name="minimumStockLevel"
                    value={formData.minimumStockLevel}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="add-product-form-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label
                    htmlFor="maximumStockLevel"
                    className="add-product-form-label"
                  >
                    Maximum Stock Level
                  </label>
                  <input
                    type="number"
                    id="maximumStockLevel"
                    name="maximumStockLevel"
                    value={formData.maximumStockLevel}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="add-product-form-input"
                    min="0"
                  />
                </div>
                <div className="add-product-form-group">
                  <label
                    htmlFor="storageLocation"
                    className="add-product-form-label"
                  >
                    Storage Location
                  </label>
                  <input
                    type="text"
                    id="storageLocation"
                    name="storageLocation"
                    value={formData.storageLocation}
                    onChange={handleInputChange}
                    placeholder="Warehouse A"
                    className="add-product-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="add-product-form-section">
              <h2 className="add-product-section-title">Product Details</h2>

              <div className="add-product-form-row">
                <div className="add-product-form-group">
                  <label htmlFor="sku" className="add-product-form-label">
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Stock Keeping Unit"
                    className="add-product-form-input"
                  />
                </div>
                <div className="add-product-form-group barcode-group">
                  <label htmlFor="barcode" className="add-product-form-label">
                    Barcode
                  </label>
                  <div className="add-product-barcode-input-group">
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="Enter or generate..."
                      className="add-product-form-input"
                    />
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="add-product-generate-btn"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Product Image & Action Panel */}
        <div className="add-product-sidebar">
          {/* Product Image Section */}
          <div className="add-product-image-section">
            <h3 className="add-product-image-title">Product Image</h3>
            <div className="add-product-image-upload-container">
              {imagePreview ? (
                <div className="add-product-image-preview">
                  <img src={imagePreview} alt="Product preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setProductImage(null);
                      setImagePreview(null);
                    }}
                    className="add-product-remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="add-product-upload-placeholder">
                  <FaUpload className="add-product-upload-icon" />
                  <p>Click to upload or drag and drop</p>
                  <p className="add-product-file-info">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={handleImageChange}
                className="add-product-file-input"
              />
              <label htmlFor="productImage" className="add-product-file-label">
                Choose File
              </label>
            </div>
          </div>

          {/* Action Panel */}
          <div className="add-product-action-panel">
            <button
              type="submit"
              form="product-form"
              className="add-product-btn"
            >
              <FaBox className="add-product-add-icon" />
              Add Product
            </button>
            <button onClick={handleCancel} className="add-product-cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductView;
