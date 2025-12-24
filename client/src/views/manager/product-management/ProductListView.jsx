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
import "./ProductListView.css";
import productService from "../../../services/productService";

const ProductListView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [stockFilter, setStockFilter] = useState("All stock");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productService.getAll({
        limit: 100,
        page: 1,
      });

      console.log("🔍 Full response:", response);
      console.log("📦 Response data type:", typeof response.data);
      console.log("📦 Response data:", response.data);

      if (response.success && response.data) {
        console.log("✅ Setting products:", response.data);
        setProducts(response.data);
        calculateStats(response.data);
      } else {
        console.warn("❌ Response not successful:", response);
        setError("Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError(error.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (productList) => {
    try {
      // Validate input
      if (!Array.isArray(productList)) {
        console.error("productList is not an array:", productList);
        throw new Error("Invalid product list format");
      }

      if (productList.length === 0) {
        setStats({
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        });
        return;
      }

      const totalProducts = productList.length;

      const totalValue = productList.reduce((sum, product) => {
        if (!product || typeof product !== "object") {
          console.warn("Invalid product object:", product);
          return sum;
        }
        const price = parseFloat(product.price) || 0;
        const stock = parseInt(product.current_stock) || 0;
        return sum + price * stock;
      }, 0);

      const lowStockCount = productList.filter((product) => {
        if (!product) return false;
        const current = parseInt(product.current_stock) || 0;
        const minimum = parseInt(product.minimum_stock_level) || 0;
        return current > 0 && current <= minimum;
      }).length;

      const outOfStockCount = productList.filter((product) => {
        if (!product) return false;
        return parseInt(product.current_stock) === 0;
      }).length;

      console.log("✅ Stats calculated:", {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
      });

      setStats({
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
      });
    } catch (error) {
      console.error("❌ Error calculating stats:", error);
      setStats({
        totalProducts: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
      });
    }
  };

  // Pagination logic
  const itemsPerPage = 10;

  // Filter and search logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All categories" ||
      product.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "In Stock") {
      matchesStock = product.current_stock > product.minimum_stock_level;
    } else if (stockFilter === "Low Stock") {
      matchesStock =
        product.current_stock > 0 &&
        product.current_stock <= product.minimum_stock_level;
    } else if (stockFilter === "Out of Stock") {
      matchesStock = product.current_stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Event handlers
  const handleAddProduct = () => {
    navigate("/products/add");
  };

  const handleEdit = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        const response = await productService.delete(productToDelete._id);
        if (response.success) {
          // Reload products to get updated data with isDelete = true
          await loadProducts();
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        } else {
          setError(response.message || "Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        setError(error.message || "Failed to delete product");
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

  const getStockStatus = (product) => {
    if (product.current_stock === 0) {
      return "Out of Stock";
    } else if (product.current_stock <= product.minimum_stock_level) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const getStockBadgeClass = (status) => {
    switch (status) {
      case "In Stock":
        return "status-approved";
      case "Low Stock":
        return "status-pending";
      case "Out of Stock":
        return "status-declined";
      default:
        return "status-default";
    }
  };

  if (isLoading) {
    return (
      <div className="product-list-view">
        <div className="product-page-header">
          <h1 className="page-title">Product Management</h1>
        </div>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

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
              <div className="stat-number">{stats.totalProducts}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon value">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                ${stats.totalValue.toLocaleString()}
              </div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.lowStockCount}</div>
              <div className="stat-label">Low Stock</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">
              <TbBoxOff />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.outOfStockCount}</div>
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
            Import/Export Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="product-table-container">
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
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
            {currentProducts.map((product) => (
              <tr
                key={product._id}
                style={{
                  textDecoration: product.isDelete ? "line-through" : "none",
                  opacity: product.isDelete ? 0.6 : 1,
                }}
              >
                <td>
                  <img
                    src={
                      product.image_link ||
                      "https://placehold.co/80x80/e2e8f0/64748b?text=No+Image"
                    }
                    alt={product.name}
                    className="product-image-cell"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/80x80/e2e8f0/64748b?text=No+Image";
                    }}
                  />
                </td>
                <td className="product-id-cell">{product._id}</td>
                <td className="product-name-cell">{product.name}</td>
                <td>
                  <div className="product-category">
                    <div className="category">{product.category}</div>
                    {product.supplier_id && (
                      <div className="brand">
                        {typeof product.supplier_id === "string"
                          ? product.supplier_id
                          : product.supplier_id.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="product-price">${product.price.toFixed(2)}</td>
                <td>
                  <div className="stock-info">
                    <div className="stock-number">
                      {product.current_stock} {product.unit}
                    </div>
                    <div className="stock-threshold">
                      Min: {product.minimum_stock_level}
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge ${getStockBadgeClass(
                      getStockStatus(product)
                    )}`}
                  >
                    {product.isDelete ? "DELETED" : getStockStatus(product)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleView(product)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(product._id)}
                      title={
                        product.isDelete
                          ? "Cannot edit deleted item"
                          : "Edit Product"
                      }
                      disabled={product.isDelete}
                      style={{
                        opacity: product.isDelete ? 0.5 : 1,
                        cursor: product.isDelete ? "not-allowed" : "pointer",
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(product)}
                      title={
                        product.isDelete ? "Already deleted" : "Delete Product"
                      }
                      disabled={product.isDelete}
                      style={{
                        opacity: product.isDelete ? 0.5 : 1,
                        cursor: product.isDelete ? "not-allowed" : "pointer",
                      }}
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
          Showing {filteredProducts.length > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, filteredProducts.length)} of{" "}
          {filteredProducts.length}
        </div>
        <div className="product-pagination-controls">
          {" "}
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
