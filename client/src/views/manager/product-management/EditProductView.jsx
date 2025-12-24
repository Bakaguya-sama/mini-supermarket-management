import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaBox, FaSave, FaUpload } from "react-icons/fa";
import "./EditProductView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import productService from "../../../services/productService";
import supplierService from "../../../services/supplierService";

const EditProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [productData, setProductData] = useState(null);

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

  // Load suppliers and product on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load suppliers
        setIsLoadingSuppliers(true);
        const suppliersResponse = await supplierService.getAll({ limit: 100 });
        if (suppliersResponse.success && suppliersResponse.data) {
          setSuppliers(suppliersResponse.data);
        }

        // Load product details
        const productResponse = await productService.getById(id);
        if (productResponse.success && productResponse.data) {
          const product = productResponse.data;
          setProductData(product);

          // Populate form with product data
          setFormData({
            productName: product.name || "",
            category: product.category || "",
            supplier_id: product.supplier_id?._id || product.supplier_id || "",
            origin: product.origin || "",
            description: product.description || "",
            price: product.price || "",
            unit: product.unit || "",
            currentStock: product.current_stock || "",
            minimumStockLevel: product.minimum_stock_level || "",
            maximumStockLevel: product.maximum_stock_level || "",
            storageLocation: product.storage_location || "",
            sku: product.sku || "",
            barcode: product.barcode || "",
          });

          // Set image preview
          if (product.image_link) {
            setImagePreview(product.image_link);
          }
        } else {
          setErrorMessage("Failed to load product details");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setErrorMessage(error.message || "Failed to load product");
      } finally {
        setIsLoading(false);
        setIsLoadingSuppliers(false);
      }
    };

    loadData();
  }, [id]);

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
          const canvas = document.createElement("canvas");
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
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedImage = canvas.toDataURL("image/jpeg", 0.8);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Convert image to base64 if new image selected
      let image_link = productData?.image_link || null;
      if (imagePreview && imagePreview !== productData?.image_link) {
        image_link = imagePreview;
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
        image_link: image_link,
      };

      console.log("Updating product with name:", formData.productName);

      const response = await productService.update(id, payload);

      console.log("✅ Update response received:", response.success);

      if (response.success) {
        setSuccessMessage(
          `Product "${formData.productName}" updated successfully!`
        );
        // Navigate back to products list
        setTimeout(() => {
          navigate("/products");
        }, 2000);
      } else {
        console.error("❌ Update failed:", response.message);
        setErrorMessage(response.message || "Failed to update product");
      }
    } catch (error) {
      console.error("❌ Error updating product:", error.message);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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

    // Ensure current stock does not exceed maximum stock level
    if (maxStock > 0 && currentStock > maxStock) {
      setErrorMessage(
        "Current stock cannot be greater than maximum stock level"
      );
      return false;
    }

    return true;
  };

  const handleCancel = () => {
    navigate("/products");
  };

  if (isLoading) {
    return (
      <div className="edit-product-view">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-view">
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
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                    className="edit-product-form-select"
                    required
                    disabled={isLoadingSuppliers}
                  >
                    <option value="">
                      {isLoadingSuppliers
                        ? "Loading suppliers..."
                        : "Select supplier"}
                    </option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
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
                    <option value="túi">Túi</option>
                    <option value="hộp">Hộp</option>
                    <option value="lon">Lon</option>
                    <option value="vỉ">Vỉ</option>
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
                    htmlFor="currentStock"
                    className="edit-product-form-label"
                  >
                    Current Stock
                  </label>
                  <input
                    disabled="true"
                    type="number"
                    id="currentStock"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="edit-product-form-input"
                    min="0"
                    required
                  />
                </div>
                <div className="edit-product-form-group">
                  <label
                    htmlFor="minimumStockLevel"
                    className="edit-product-form-label"
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
                    className="edit-product-form-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="edit-product-form-row">
                <div className="edit-product-form-group">
                  <label
                    htmlFor="maximumStockLevel"
                    className="edit-product-form-label"
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
              <label className="edit-product-status-label">Product ID</label>
              <span className="edit-product-status-value">
                {productData?._id || "N/A"}
              </span>
            </div>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">Current Price</label>
              <span className="edit-product-status-value">
                {formData.price
                  ? `$${parseFloat(formData.price).toFixed(2)}`
                  : "$0.00"}
              </span>
            </div>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">Created At</label>
              <span className="edit-product-status-value">
                {productData?.createdAt
                  ? new Date(productData.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="edit-product-status-item">
              <label className="edit-product-status-label">Updated At</label>
              <span className="edit-product-status-value">
                {productData?.updatedAt
                  ? new Date(productData.updatedAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="edit-product-status-actions">
              <button
                type="submit"
                form="product-form"
                className="edit-product-update-product-btn"
                disabled={isSubmitting || isLoadingSuppliers}
              >
                <FaSave className="edit-product-update-icon" />
                {isSubmitting ? "Updating..." : "Update Product"}
              </button>
              <button
                onClick={handleCancel}
                className="edit-product-cancel-btn"
                disabled={isSubmitting}
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
