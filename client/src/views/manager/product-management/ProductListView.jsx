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
import BatchListModal from "../../../components/ProductModal/BatchListModal";
import "./ProductListView.css";
import "../../../components/ProductModal/BatchListModal.css";
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

  // Batches map: productId -> { batches: [], total_quantity, distinctExpiryCount, expiredTotalQuantity }
  const [batchesMap, setBatchesMap] = useState({});
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchModalProduct, setBatchModalProduct] = useState(null);

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
        // Load batch summaries for the loaded products (non-blocking)
        loadBatchSummaries(response.data);
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

  // Expiry & stock helpers (moved above filters to avoid "cannot access before initialization")
  const getExpiryStatus = (product) => {
    if (!product || !product.expiry_date) return null;
    const now = new Date();
    const exp = new Date(product.expiry_date);
    if (isNaN(exp)) return null;
    if (exp < now) return "Expired";
    const daysDiff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 30) return "Expiring Soon";
    return null;
  };

  const getStockStatus = (product) => {
    const expiry = getExpiryStatus(product);
    if (expiry === "Expired") return "Expired";
    if (expiry === "Expiring Soon") return "Expiring Soon";

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
      case "Expiring Soon":
        return "status-pending";
      case "Out of Stock":
      case "Expired":
        return "status-declined";
      default:
        return "status-default";
    }
  };

  // Normalize batch responses from various endpoints
  const extractBatchesFromResponse = (resp) => {
    try {
      const raw =
        resp?.data?.data?.batches ||
        resp?.data?.batches ||
        resp?.data ||
        resp?.batches ||
        resp ||
        [];
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.batches)) return raw.batches;
      return [];
    } catch (err) {
      console.warn("Failed to extract batches from response", err, resp);
      return [];
    }
  };

  // Helper to open batch modal and ensure batches are loaded
  const openBatchModal = async (productId) => {
    const product = products.find((p) => p._id === productId);

    // If we don't have batches loaded yet for this product, fetch now
    if (!batchesMap[productId]) {
      // optimistic placeholder
      setBatchesMap((prev) => ({
        ...prev,
        [productId]: {
          batches: [],
          distinctExpiryCount: 0,
          expiredTotalQuantity: 0,
          loading: true,
        },
      }));
      try {
        const resp = await productService.getBatchesByProduct(productId);
        const batches = extractBatchesFromResponse(resp);
        const now = new Date();
        const distinctExpiry = new Set(
          batches.map((b) =>
            b.expiry_date
              ? new Date(b.expiry_date).toISOString().slice(0, 10)
              : null
          )
        ).size;
        const expiredTotalQuantity = batches.reduce((s, b) => {
          if (b.expiry_date && new Date(b.expiry_date) < now)
            return s + (b.totalQuantity || b.quantity || 0);
          return s;
        }, 0);
        // representative expiry (earliest non-null expiry among batches)
        const expiryDates = batches
          .map((b) => b.expiry_date)
          .filter(Boolean)
          .map((d) => new Date(d).getTime());
        const representativeExpiry =
          expiryDates.length > 0
            ? new Date(Math.min(...expiryDates)).toISOString()
            : null;
        setBatchesMap((prev) => ({
          ...prev,
          [productId]: {
            batches,
            distinctExpiryCount: distinctExpiry,
            expiredTotalQuantity,
            representativeExpiry,
            loading: false,
          },
        }));
      } catch (err) {
        console.warn(
          "Failed to fetch batches when opening modal",
          productId,
          err
        );
        setBatchesMap((prev) => ({
          ...prev,
          [productId]: {
            batches: [],
            distinctExpiryCount: 0,
            expiredTotalQuantity: 0,
            loading: false,
          },
        }));
      }
    }

    setBatchModalProduct(product);
    setIsBatchModalOpen(true);
  };

  // Load batch summaries for a list of products
  const loadBatchSummaries = async (productList) => {
    if (!Array.isArray(productList) || productList.length === 0) return;
    const results = {};
    await Promise.all(
      productList.map(async (p) => {
        try {
          const resp = await productService.getBatchesByProduct(p._id);
          const batches = extractBatchesFromResponse(resp);
          // compute distinct expiry count and expired total qty
          const now = new Date();
          const distinctExpiry = new Set(
            batches.map((b) =>
              b.expiry_date
                ? new Date(b.expiry_date).toISOString().slice(0, 10)
                : null
            )
          ).size;
          const expiredTotalQuantity = batches.reduce((s, b) => {
            if (b.expiry_date && new Date(b.expiry_date) < now)
              return s + (b.totalQuantity || b.quantity || 0);
            return s;
          }, 0);

          // representative expiry (earliest non-null expiry among batches)
          const expiryDates = batches
            .map((b) => b.expiry_date)
            .filter(Boolean)
            .map((d) => new Date(d).getTime());
          const representativeExpiry =
            expiryDates.length > 0
              ? new Date(Math.min(...expiryDates)).toISOString()
              : null;

          results[p._id] = {
            batches,
            distinctExpiryCount: distinctExpiry,
            expiredTotalQuantity,
            representativeExpiry,
          };
        } catch (err) {
          // ignore per-product error
          console.warn("Failed to load batches for product", p._id, err);
          results[p._id] = {
            batches: [],
            distinctExpiryCount: 0,
            expiredTotalQuantity: 0,
          };
        }
      })
    );
    setBatchesMap(results);
  };

  // Listen to productBatchCreated events and refresh a single product's batches
  React.useEffect(() => {
    const handler = async (e) => {
      const productId = e?.detail?.productId;
      if (!productId) return;
      try {
        const resp = await productService.getBatchesByProduct(productId);
        const batches = extractBatchesFromResponse(resp);
        const now = new Date();
        const distinctExpiry = new Set(
          batches.map((b) =>
            b.expiry_date
              ? new Date(b.expiry_date).toISOString().slice(0, 10)
              : null
          )
        ).size;
        const expiredTotalQuantity = batches.reduce(
          (s, b) =>
            b.expiry_date && new Date(b.expiry_date) < now
              ? s + (b.totalQuantity || b.quantity || 0)
              : s,
          0
        );
        const expiryDates = batches
          .map((b) => b.expiry_date)
          .filter(Boolean)
          .map((d) => new Date(d).getTime());
        const representativeExpiry =
          expiryDates.length > 0
            ? new Date(Math.min(...expiryDates)).toISOString()
            : null;
        setBatchesMap((prev) => ({
          ...prev,
          [productId]: {
            batches,
            distinctExpiryCount: distinctExpiry,
            expiredTotalQuantity,
            representativeExpiry,
            loading: false,
          },
        }));
        // refresh products list to reflect updated current_stock
        await loadProducts();
      } catch (err) {
        console.warn(
          "Failed to refresh batches after productBatchCreated",
          err
        );
      }
    };
    window.addEventListener("productBatchCreated", handler);
    return () => window.removeEventListener("productBatchCreated", handler);
  }, []);

  // Filter and search logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "All categories" ||
      product.category === categoryFilter;

    let matchesStock = true;
    const expiryStatus = getExpiryStatus(product);
    if (stockFilter === "In Stock") {
      matchesStock =
        product.current_stock > product.minimum_stock_level && !expiryStatus;
    } else if (stockFilter === "Low Stock") {
      matchesStock =
        product.current_stock > 0 &&
        product.current_stock <= product.minimum_stock_level &&
        !expiryStatus;
    } else if (stockFilter === "Out of Stock") {
      matchesStock = product.current_stock === 0 && !expiryStatus;
    } else if (stockFilter === "Expiring Soon") {
      matchesStock = expiryStatus === "Expiring Soon";
    } else if (stockFilter === "Expired") {
      matchesStock = expiryStatus === "Expired";
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
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
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
              {/* <th>Product ID</th> */}
              <th>Product Name</th>
              <th>Category & Brand</th>
              <th>Expiry Date</th>
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
                {/* <td className="product-id-cell">{product._id}</td> */}
                <td className="product-name-cell">
                  {product.name}
                  {batchesMap[product._id] &&
                    batchesMap[product._id].distinctExpiryCount > 1 && (
                      <span
                        className="multi-expiry-badge"
                        title={`$${
                          batchesMap[product._id].distinctExpiryCount
                        } distinct expiry dates`}
                      >
                        {batchesMap[product._id].distinctExpiryCount} expiries
                      </span>
                    )}
                  {batchesMap[product._id] &&
                    batchesMap[product._id].loading && (
                      <span
                        className="multi-expiry-loading"
                        title="Loading batches"
                      >
                        …
                      </span>
                    )}
                </td>
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
                <td className="product-expiry-date">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div>
                      {product.expiry_date
                        ? new Date(product.expiry_date).toLocaleDateString()
                        : batchesMap[product._id]?.representativeExpiry
                        ? new Date(
                            batchesMap[product._id].representativeExpiry
                          ).toLocaleDateString()
                        : "—"}
                    </div>

                    {/* Batch badge */}
                    {batchesMap[product._id] &&
                      batchesMap[product._id].distinctExpiryCount > 1 && (
                        <button
                          className="batch-badge"
                          title={`${
                            batchesMap[product._id].distinctExpiryCount
                          } distinct expiry dates`}
                          onClick={() => openBatchModal(product._id)}
                        >
                          {batchesMap[product._id].distinctExpiryCount} expiries
                        </button>
                      )}

                    {/* Expired quantity indicator */}
                    {batchesMap[product._id] &&
                      batchesMap[product._id].expiredTotalQuantity > 0 && (
                        <span
                          className="expired-badge"
                          title={`Expired qty: ${
                            batchesMap[product._id].expiredTotalQuantity
                          }`}
                        >
                          Expired:{" "}
                          {batchesMap[product._id].expiredTotalQuantity}
                        </span>
                      )}
                  </div>
                </td>
                <td className="product-price">
                  {Number(product.price).toLocaleString("vi-VN")} VNĐ
                </td>
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

      {/* Batch Modal */}
      <BatchListModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        product={batchModalProduct}
        batches={batchesMap[batchModalProduct?._id]?.batches || []}
        loading={batchesMap[batchModalProduct?._id]?.loading || false}
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
