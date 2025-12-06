import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBox, FaSave, FaUpload } from "react-icons/fa";
import productService from "../../../services/productService";
import { useNotification } from "../../../hooks/useNotification";
import "./EditProductView.css";

const EditProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    supplier: "",
    origin: "",
    description: "",
    price: "0.00",
    unit: "",
    stockQuantity: "0",
    lowStockThreshold: "10",
    highStockThreshold: "0",
    storageLocation: "",
  });

  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("https://placehold.co/400");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await productService.getById(id);
        if (response.success && response.data) {
          const product = response.data;
          setFormData({
            productName: product.productName || "",
            category: product.category || "",
            supplier: product.supplier || "",
            origin: product.origin || "",
            description: product.description || "",
            price: product.price || "0.00",
            unit: product.unit || "",
            stockQuantity: product.stockQuantity || "0",
            lowStockThreshold: product.lowStockThreshold || "10",
            highStockThreshold: product.highStockThreshold || "0",
            storageLocation: product.storageLocation || "",
          });
          if (product.imageUrl) {
            setImagePreview(product.imageUrl);
          }
        } else {
          showError("Error", "Failed to load product data");
        }
      } catch (error) {
        showError("Error", error.message || "Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id, showError]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const response = await productService.update(id, formData);

      if (response.success) {
        showSuccess("Success", "Product updated successfully!");
        navigate("/products");
      } else {
        showError("Error", response.message || "Failed to update product");
      }
    } catch (error) {
      showError("Error", error.message || "Error updating product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const generateBarcode = () => {
    // Generate random barcode - this can be improved with actual barcode generation
    const barcode = Math.floor(Math.random() * 1000000000000).toString();
    console.log("Generated barcode:", barcode);
  };

  return (
    <div className="edit-product-view">
      {/* Header */}
      <div className="edit-product-page-header">
        <h1 className="edit-product-page-title">Edit Product</h1>
      </div>

      {/* Main Content */}
      <div className="edit-product-content">
        {/* Form Container */}
        <div className="edit-product-form-container">
          <form id="product-form" onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="edit-product-form-section">
              <h2 className="edit-product-section-title">Basic Information</h2>

              <div className="edit-product-form-row">
                <div className="edit-product-form-group edit-product-full-width">
                  <label
                    htmlFor="productName"
                    className="edit-product-form-label"
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
                    className="edit-product-form-input"
                    required
                  />
                </div>
              </div>

              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label htmlFor="category" className="edit-product-form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="edit-product-form-select"
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
                <div className="edit-product-form-group">
                  <label htmlFor="supplier" className="edit-product-form-label">
                    Supplier
                  </label>
                  <select
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="edit-product-form-select"
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

              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label htmlFor="origin" className="edit-product-form-label">
                    Origin
                  </label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Enter the origin of product"
                    className="edit-product-form-input"
                  />
                </div>
              </div>

              <div className="edit-product-form-row">
                <div className="edit-product-form-group edit-product-full-width">
                  <label
                    htmlFor="description"
                    className="edit-product-form-label"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    className="edit-product-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock Section */}
            <div className="edit-product-form-section">
              <h2 className="edit-product-section-title">Pricing & Stock</h2>

              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label htmlFor="price" className="edit-product-form-label">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="$0.00"
                    className="edit-product-form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="edit-product-form-group">
                  <label htmlFor="unit" className="edit-product-form-label">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="edit-product-form-select"
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

              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label
                    htmlFor="stockQuantity"
                    className="edit-product-form-label"
                  >
                    Current Stock
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="edit-product-form-input"
                    min="0"
                    required
                  />
                </div>
                <div className="edit-product-form-group">
                  <label
                    htmlFor="lowStockThreshold"
                    className="edit-product-form-label"
                  >
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="edit-product-form-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label
                    htmlFor="highStockThreshold"
                    className="edit-product-form-label"
                  >
                    Maximum Stock Level
                  </label>
                  <input
                    type="number"
                    id="highStockThreshold"
                    name="highStockThreshold"
                    value={formData.highStockThreshold}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="edit-product-form-input"
                    min="0"
                  />
                </div>
                <div className="edit-product-form-group">
                  <label
                    htmlFor="storageLocation"
                    className="edit-product-form-label"
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
                    className="edit-product-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="edit-product-form-section">
              <h2 className="edit-product-section-title">Product Details</h2>

              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label htmlFor="sku" className="edit-product-form-label">
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Stock Keeping Unit"
                    className="edit-product-form-input"
                  />
                </div>
                <div className="edit-product-form-group edit-product-barcode-group">
                  <label htmlFor="barcode" className="edit-product-form-label">
                    Barcode
                  </label>
                  <div className="edit-product-barcode-input-group">
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="Enter or generate..."
                      className="edit-product-form-input"
                    />
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="edit-product-generate-btn"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Product Image & Status Panel */}
        <div className="edit-product-sidebar">
          {/* Product Image Section */}
          <div className="edit-product-image-section">
            <h3 className="edit-product-image-title">Product Image</h3>
            <div className="edit-product-image-upload-container">
              <div className="edit-product-image-preview">
                <img
                  src={imagePreview || "https://placehold.co/400"}
                  alt="Product preview"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/400";
                  }}
                />
              </div>
              <input
                type="file"
                id="productImage"
                accept="image/*"
                onChange={handleImageChange}
                className="edit-product-file-input"
              />
              <label
                htmlFor="productImage"
                className="edit-product-change-image-btn"
              >
                Change Image
              </label>
            </div>
          </div>

          {/* Current Status Panel */}
          <div className="edit-product-status-panel">
            <h2 className="edit-product-status-title">Current Status</h2>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">
                Last Restocked
              </label>
              <span className="edit-product-status-value">
                {formData.lastRestocked}
              </span>
            </div>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">Product ID</label>
              <span className="edit-product-status-value">
                {formData.productId}
              </span>
            </div>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">Current Price</label>
              <span className="edit-product-status-value">
                ${formData.price}
              </span>
            </div>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">Created At</label>
              <span className="edit-product-status-value">
                {formData.createdAt}
              </span>
            </div>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">Updated At</label>
              <span className="edit-product-status-value">
                {formData.updatedAt}
              </span>
            </div>

            <div className="edit-product-status-actions">
              <button
                type="submit"
                form="product-form"
                className="edit-product-update-product-btn"
              >
                <FaSave className="edit-product-update-icon" />
                Update Product
              </button>
              <button
                onClick={handleCancel}
                className="edit-product-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductView;
