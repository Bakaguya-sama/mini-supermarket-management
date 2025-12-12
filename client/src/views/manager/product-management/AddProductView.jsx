import React, { useState, useEffect } from "react";
import { FaBox, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AddProductView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import productService from "../../../services/productService";
import supplierService from "../../../services/supplierService";

const AddProductView = () => {
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    supplier_id: "",
    origin: "",
    description: "",
    price: "",
    unit: "",
    currentStock: "",
    minimumStockLevel: "",
    maximumStockLevel: "",
    storageLocation: "",
    sku: "",
    barcode: "",
  });

  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setIsLoadingSuppliers(true);
        const response = await supplierService.getAll({ limit: 100 });
        if (response.success && response.data) {
          setSuppliers(response.data);
        }
      } catch (error) {
        console.error("Error loading suppliers:", error);
        setErrorMessage("Failed to load suppliers");
      } finally {
        setIsLoadingSuppliers(false);
      }
    };
    loadSuppliers();
  }, []);

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
      // Validate file size (max 2MB for original)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 2MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file");
        return;
      }
      setProductImage(file);
      
      // Read and compress image
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image using canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large
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
          
          // Convert to base64 with compression
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          setImagePreview(compressedImage);
        };
        img.src = reader.result;
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

  const validateForm = () => {
    // Validate required fields
    if (!formData.productName.trim()) {
      setErrorMessage("Product name is required");
      return false;
    }
    if (!formData.category) {
      setErrorMessage("Category is required");
      return false;
    }
    if (!formData.supplier_id) {
      setErrorMessage("Supplier is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setErrorMessage("Valid price is required");
      return false;
    }
    if (!formData.unit) {
      setErrorMessage("Unit is required");
      return false;
    }
    if (formData.currentStock === "" || parseInt(formData.currentStock) < 0) {
      setErrorMessage("Valid current stock is required");
      return false;
    }

    // Validate stock levels
    const currentStock = parseInt(formData.currentStock);
    const minStock = parseInt(formData.minimumStockLevel) || 0;
    const maxStock = parseInt(formData.maximumStockLevel) || 0;

    if (maxStock > 0 && minStock > maxStock) {
      setErrorMessage("Minimum stock level cannot be greater than maximum");
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
      // Convert image to base64 if exists
      let image_link = null;
      if (imagePreview) {
        image_link = imagePreview; // Already in base64 format from FileReader
      }

      // Prepare payload
      const payload = {
        name: formData.productName,
        category: formData.category,
        supplier_id: formData.supplier_id,
        description: formData.description,
        price: formData.price,
        unit: formData.unit,
        currentStock: formData.currentStock,
        minimumStockLevel: formData.minimumStockLevel,
        maximumStockLevel: formData.maximumStockLevel,
        storageLocation: formData.storageLocation,
        image_link: image_link
      };

      console.log("Submitting product with name:", formData.productName);

      const response = await productService.create(payload);

      console.log("✅ Create response received:", response.success);

      if (response.success) {
        setSuccessMessage(`Product "${formData.productName}" created successfully!`);
        // Reset form
        setTimeout(() => {
          navigate("/products");
        }, 2000);
      } else {
        console.error("❌ Create failed:", response.message);
        setErrorMessage(response.message || "Failed to create product");
      }
    } catch (error) {
      console.error("❌ Error creating product:", error.message);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        "Failed to create product. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  return (
    <div className="add-product-view">
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
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                    className="add-product-form-select"
                    required
                    disabled={isLoadingSuppliers}
                  >
                    <option value="">
                      {isLoadingSuppliers ? "Loading suppliers..." : "Select supplier"}
                    </option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
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
              disabled={isLoading || isLoadingSuppliers}
            >
              <FaBox className="add-product-add-icon" />
              {isLoading ? "Creating..." : "Add Product"}
            </button>
            <button 
              onClick={handleCancel} 
              className="add-product-cancel-btn"
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

export default AddProductView;
