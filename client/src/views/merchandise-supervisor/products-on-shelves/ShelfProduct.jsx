import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaBox,
  FaDollarSign,
  FaExclamationTriangle,
  FaPlus,
} from "react-icons/fa";
import { TbBoxOff } from "react-icons/tb";
import "./ShelfProduct.css";
import { useNavigate } from "react-router-dom";
import { productShelfService } from "../../../services/productShelfService";

const ShelfProduct = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All suppliers");
  const [shelfLocationFilter, setShelfLocationFilter] =
    useState("All locations");
  const [sectionFilter, setSectionFilter] = useState("All sections");
  const [slotFilter, setSlotFilter] = useState("All slots");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [currentPage, setCurrentPage] = useState(1);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Data from API
  const [shelfProductData, setShelfProductData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  // ========== API FUNCTIONS ==========

  // Load product-shelf mappings from API
  const loadProductShelves = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: "-createdAt",
      };

      const response = await productShelfService.getAllProductShelves(params);

      if (response.success && response.data && Array.isArray(response.data)) {
        // Transform API data to UI format
        const transformedData = response.data.map((mapping) => {
          const product = mapping.product_id;
          const shelf = mapping.shelf_id;

          // Determine stock status based on quantity
          let status = "In Stock";
          const quantity = mapping.quantity || 0;
          const lowStockThreshold = 20; // Default threshold

          if (quantity === 0) {
            status = "Out of Stock";
          } else if (quantity < lowStockThreshold) {
            status = "Low Stock";
          }

          return {
            id: product?._id || mapping._id,
            mappingId: mapping._id,
            name: product?.name || "Unknown Product",
            category: product?.category || "N/A",
            brand: "N/A", // TODO: Add brand field if available
            price: `$${(product?.price || 0).toFixed(2)}`,
            stock: quantity,
            lowStockThreshold: lowStockThreshold,
            supplier: "N/A", // TODO: Populate supplier from product
            status: status,
            shelfLocation: shelf?.shelf_number || "N/A",
            section: shelf?.shelf_number?.charAt(0) || "N/A",
            slot: shelf?.note || "N/A",
            _original: mapping,
          };
        });

        setShelfProductData(transformedData);
        setTotalRecords(response.total || 0);
        setTotalPages(response.pages || 0);
      } else {
        console.error("Failed to load product shelves:", response.message);
        setShelfProductData([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error loading product shelves:", error);
      setShelfProductData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when page changes
  useEffect(() => {
    loadProductShelves();
  }, [currentPage]);

  // Sample fake shelf product data - REMOVE sau khi test API

  // Filter data (client-side filtering for now)
  const filteredData = shelfProductData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier =
      supplierFilter === "All suppliers" || product.supplier === supplierFilter;
    const matchesLocation =
      shelfLocationFilter === "All locations" ||
      product.shelfLocation === shelfLocationFilter;
    const matchesSection =
      sectionFilter === "All sections" || product.section === sectionFilter;
    const matchesSlot =
      slotFilter === "All slots" || product.slot === slotFilter;
    const matchesCategory =
      categoryFilter === "All categories" ||
      product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All status" || product.status === statusFilter;

    return (
      matchesSearch &&
      matchesSupplier &&
      matchesLocation &&
      matchesSection &&
      matchesSlot &&
      matchesCategory &&
      matchesStatus
    );
  });

  // Sort by productID, shelf, section, slot
  const sortedData = filteredData.sort((a, b) => {
    if (a.id !== b.id) {
      return a.id.localeCompare(b.id);
    }
    if (a.shelfLocation !== b.shelfLocation) {
      return a.shelfLocation.localeCompare(b.shelfLocation);
    }
    if (a.section !== b.section) {
      return a.section.localeCompare(b.section);
    }
    return a.slot.localeCompare(b.slot);
  });

  // Calculate pagination
  const totalItems = sortedData.length;
  const clientTotalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Calculate stats
  const totalProducts = sortedData.length;
  const totalValue = sortedData.reduce((sum, product) => {
    const price = parseFloat(product.price.replace("$", ""));
    return sum + price * product.stock;
  }, 0);
  const lowStockProducts = sortedData.filter(
    (p) => p.status === "Low Stock"
  ).length;
  const outOfStockProducts = sortedData.filter(
    (p) => p.status === "Out of Stock"
  ).length;

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    supplierFilter,
    shelfLocationFilter,
    sectionFilter,
    slotFilter,
    categoryFilter,
    statusFilter,
  ]);

  const handleEdit = (productId, shelfLocation) => {
    console.log("Edit product:", productId, "at location:", shelfLocation);
    const editUrl = `/shelf-product/edit/${productId}-${shelfLocation}`;
    console.log("Navigating to:", editUrl);
    navigate(editUrl);
  };

  const handleAddProduct = () => {
    console.log("Add new product");
    navigate("./add");
  };

  const getStockBadgeClass = (status) => {
    switch (status) {
      case "In Stock":
        return "shelf-status-approved";
      case "Low Stock":
        return "shelf-status-pending";
      case "Out of Stock":
        return "shelf-status-declined";
      default:
        return "shelf-status-default";
    }
  };

  // Get unique values for filters
  const uniqueSuppliers = [...new Set(shelfProductData.map((p) => p.supplier))];
  const uniqueLocations = [
    ...new Set(shelfProductData.map((p) => p.shelfLocation)),
  ].sort();
  const uniqueSections = [
    ...new Set(shelfProductData.map((p) => p.section)),
  ].sort();
  const uniqueSlots = [...new Set(shelfProductData.map((p) => p.slot))].sort();
  const uniqueCategories = [
    ...new Set(shelfProductData.map((p) => p.category)),
  ].sort();
  const uniqueStatus = [
    ...new Set(shelfProductData.map((p) => p.status)),
  ].sort();

  return (
    <div className="shelf-product-view">
      {/* Header */}
      <div className="shelf-page-header">
        <h1 className="shelf-page-title">Shelf Product Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="shelf-stats-section">
        <div className="shelf-stats-grid">
          <div className="shelf-stat-card">
            <div className="shelf-stat-icon shelf-total">
              <FaBox />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">{totalProducts}</div>
              <div className="shelf-stat-label">Total Items</div>
            </div>
          </div>

          <div className="shelf-stat-card">
            <div className="shelf-stat-icon shelf-value">
              <FaDollarSign />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">
                ${totalValue.toLocaleString()}
              </div>
              <div className="shelf-stat-label">Total Value</div>
            </div>
          </div>

          <div className="shelf-stat-card">
            <div className="shelf-stat-icon shelf-warning">
              <FaExclamationTriangle />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">{lowStockProducts}</div>
              <div className="shelf-stat-label">Low Stock</div>
            </div>
          </div>

          <div className="shelf-stat-card">
            <div className="shelf-stat-icon shelf-danger">
              <TbBoxOff />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">{outOfStockProducts}</div>
              <div className="shelf-stat-label">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="shelf-filters-section">
        <div className="shelf-search-container">
          <FaSearch className="shelf-search-icon" />
          <input
            type="text"
            placeholder="Search product by name, id, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shelf-search-input"
          />
        </div>

        <div className="shelf-filter-grid">
          {/* First row: Supplier, Categories, Status */}
          <div className="shelf-filter-row">
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="shelf-filter-select"
            >
              <option value="All suppliers">All suppliers</option>
              {uniqueSuppliers.map((supplier) => (
                <option key={supplier} value={supplier}>
                  {supplier}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="shelf-filter-select"
            >
              <option value="All categories">All categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shelf-filter-select"
            >
              <option value="All status">All status</option>
              {uniqueStatus.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Second row: Shelf, Section, Slot */}
          <div className="shelf-filter-row">
            <select
              value={shelfLocationFilter}
              onChange={(e) => setShelfLocationFilter(e.target.value)}
              className="shelf-filter-select"
            >
              <option value="All locations">All locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="shelf-filter-select"
            >
              <option value="All sections">All sections</option>
              {uniqueSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>

            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="shelf-filter-select"
            >
              <option value="All slots">All slots</option>
              {uniqueSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="shelf-action-buttons">
          <button onClick={handleAddProduct} className="shelf-add-btn">
            <FaPlus className="shelf-add-icon" />
            Arrange products
          </button>

          <button
            onClick={() => {
              setSearchTerm("");
              setSupplierFilter("All suppliers");
              setShelfLocationFilter("All locations");
              setSectionFilter("All sections");
              setSlotFilter("All slots");
              setCategoryFilter("All categories");
              setStatusFilter("All status");
            }}
            className="shelf-clear-btn"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="shelf-table-container">
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <div>Loading products on shelves...</div>
          </div>
        )}
        <table className="shelf-table">
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
            {!isLoading && paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No products on shelves found
                </td>
              </tr>
            )}
            {paginatedData.map((product, index) => (
              <tr key={`${product.id}-${product.shelfLocation}-${index}`}>
                <td className="shelf-product-id-cell">{product.id}</td>
                <td className="shelf-product-name-cell">
                  <div className="shelf-product-name">{product.name}</div>
                  <div className="shelf-location-info">
                    {product.shelfLocation} - Section {product.section} - Slot{" "}
                    {product.slot}
                  </div>
                </td>
                <td>
                  <div className="shelf-product-category">
                    <div className="shelf-category">{product.category}</div>
                    <div className="shelf-brand">{product.brand}</div>
                  </div>
                </td>
                <td className="shelf-product-price">{product.price}</td>
                <td>
                  <div className="shelf-stock-info">
                    <div className="shelf-stock-number">
                      {product.stock} units
                    </div>
                    <div className="shelf-stock-threshold">
                      Min: {product.lowStockThreshold}
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`shelf-status-badge ${getStockBadgeClass(
                      product.status
                    )}`}
                  >
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="shelf-action-buttons">
                    <button
                      className="shelf-action-btn shelf-edit-btn"
                      onClick={() =>
                        handleEdit(product.id, product.shelfLocation)
                      }
                      title="Edit Product"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="shelf-pagination-section">
        <div className="shelf-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="shelf-pagination-controls">
          <button
            className="shelf-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="shelf-page-numbers">
            {Array.from({ length: Math.min(3, clientTotalPages) }, (_, i) => {
              let pageNum;

              if (clientTotalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage === 1) {
                pageNum = i + 1;
              } else if (currentPage === clientTotalPages) {
                pageNum = clientTotalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`shelf-page-number ${
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
            className="shelf-pagination-btn"
            onClick={() =>
              setCurrentPage(Math.min(clientTotalPages, currentPage + 1))
            }
            disabled={currentPage === clientTotalPages}
            title="Next page"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShelfProduct;
