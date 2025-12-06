import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBox,
  FaDollarSign,
  FaExclamationTriangle,
} from "react-icons/fa";
import { TbBoxOff } from "react-icons/tb";
import ProductModal from "../../../components/ProductModal/ProductModal";
import DeleteProductConfirmationModal from "../../../components/ProductModal/DeleteProductConfirmationModal";
import productService from "../../../services/productService";
import { useNotification } from "../../../hooks/useNotification";
import "./ProductListView.css";

const ProductListView = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // State for data
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [stockFilter, setStockFilter] = useState("All stock");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const itemsPerPage = 10;

  // Fetch product data from API
  useEffect(() => {
    fetchProductData();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Add search if provided
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Add category filter if not "All categories"
      if (categoryFilter !== "All categories") {
        params.category = categoryFilter;
      }

      const response = await productService.getAll(params);
      
      if (response.success) {
        setProductData(response.data || []);
      } else {
        setError(response.message || "Failed to fetch products");
        showError("Error", response.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage = err.message || "Failed to fetch products";
      setError(errorMessage);
      showError("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter data client-side for stock filter
  const filteredData = productData.filter((product) => {
    const matchesStock =
      stockFilter === "All stock" ||
      (stockFilter === "In Stock" && product.stockQuantity > product.lowStockThreshold) ||
      (stockFilter === "Low Stock" && product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold) ||
      (stockFilter === "Out of Stock" && product.stockQuantity === 0);
    return matchesStock;
  });

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Calculate stats from API data
  const totalProducts = productData.length;
  const lowStockProducts = productData.filter(
    (product) => product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold
  ).length;
  const outOfStockProducts = productData.filter(
    (product) => product.stockQuantity === 0
  ).length;
  const totalValue = productData.reduce(
    (sum, product) => sum + (product.price || 0) * product.stockQuantity,
    0
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter]);

  // Event handlers
  const handleAddProduct = () => {
    navigate("/products/add");
  };

  const handleEdit = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

  const handleView = (productId) => {
    const product = productData.find((p) => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (productId) => {
    const product = productData.find((p) => p._id === productId);
    if (product) {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        setLoading(true);
        await productService.delete(productToDelete._id);
        showSuccess("Success", "Product deleted successfully");
        // Refresh product list
        await fetchProductData();
        setProductToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (err) {
        showError("Error", err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const getStockBadgeClass = (product) => {
    if (product.stockQuantity > product.lowStockThreshold) {
      return "status-approved";
    } else if (product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold) {
      return "status-pending";
    } else {
      return "status-declined";
    }
  };

  return (
    <div className="product-list-view">
      {/* Header */}
      <div className="product-page-header">
        <h1 className="page-title">Product Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaBox />
            </div>
            <div className="stat-content">
              <div className="stat-number">{totalProducts}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon value">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-number">${totalValue.toLocaleString()}</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-number">{lowStockProducts}</div>
              <div className="stat-label">Low Stock</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">
              <TbBoxOff />
            </div>
            <div className="stat-content">
              <div className="stat-number">{outOfStockProducts}</div>
              <div className="stat-label">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="product-filters-section">
        <div className="left-filters">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="dropdown">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All categories">All categories</option>
              <option value="Beverages">Beverages</option>
              <option value="Bakery">Bakery</option>
              <option value="Dairy">Dairy</option>
              <option value="Fruits">Fruits</option>
              <option value="Meat">Meat</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Grains">Grains</option>
              <option value="Household">Household</option>
              <option value="Vegetables">Vegetables</option>
            </select>
          </div>

          <div className="dropdown">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All stock">All stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="right-actions">
          <button onClick={handleAddProduct} className="add-product-btn">
            <FaPlus />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category & Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  Loading products...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "red" }}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && paginatedData.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No products found
                </td>
              </tr>
            )}
            {paginatedData.map((product) => (
              <tr key={product._id}>
                <td className="product-id-cell">{product._id?.slice(-6) || product.id}</td>
                <td className="product-name-cell">{product.productName || product.name}</td>
                <td>
                  <div className="product-category">
                    <div className="category">{product.category}</div>
                    <div className="brand">{product.brand}</div>
                  </div>
                </td>
                <td className="product-price">${(product.price || 0).toFixed(2)}</td>
                <td>
                  <div className="stock-info">
                    <div className="stock-number">{product.stockQuantity} units</div>
                    <div className="stock-threshold">
                      Min: {product.lowStockThreshold}
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge ${getStockBadgeClass(product)}`}
                  >
                    {product.stockQuantity > product.lowStockThreshold
                      ? "In Stock"
                      : product.stockQuantity > 0
                      ? "Low Stock"
                      : "Out of Stock"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleView(product._id)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(product._id)}
                      title="Edit Product"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(product._id)}
                      title="Delete Product"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="product-pagination-section">
        <div className="product-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="product-pagination-controls">
          <button
            className="product-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="product-page-numbers">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;

              if (totalPages <= 3) {
                // If total pages is 3 or less, show all pages
                pageNum = i + 1;
              } else if (currentPage === 1) {
                // If current page is 1, show pages 1, 2, 3
                pageNum = i + 1;
              } else if (currentPage === totalPages) {
                // If current page is the last page, show last-2, last-1, last
                pageNum = totalPages - 2 + i;
              } else {
                // Otherwise, show current-1, current, current+1
                pageNum = currentPage - 1 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`product-page-number ${
                    currentPage === pageNum ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="product-pagination-btn"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            title="Next page"
          >
            ›
          </button>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteProductConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ProductListView;
