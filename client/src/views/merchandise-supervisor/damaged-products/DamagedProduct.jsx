import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaEdit, FaPlus } from "react-icons/fa";
import "./DamagedProduct.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import { damagedProductService } from "../../../services/damagedProductService";

const DamagedProduct = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonFilter, setReasonFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  
  // Data from API
  const [damagedProductData, setDamagedProductData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  // ========== API FUNCTIONS ==========
  
  // Load damaged products from API
  const loadDamagedProducts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: '-createdAt'
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Map UI filter to API resolution_action field
      if (reasonFilter && reasonFilter !== 'All') {
        params.resolution_action = reasonFilter.toLowerCase();
      }

      const response = await damagedProductService.getAllDamagedProducts(params);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        // Transform API data to UI format
        const transformedData = response.data.map(damaged => {
          const product = damaged.product_id;
          const supplier = product?.supplier_id;
          
          // Get first shelf location if available
          let shelfLocation = 'N/A';
          let section = 'N/A';
          let slot = 'N/A';
          
          return {
            id: damaged._id,
            productId: product?._id || '',
            name: product?.name || 'Unknown Product',
            supplier: supplier?.name || 'Unknown Supplier',
            shelfLocation: shelfLocation,
            section: section,
            slot: slot,
            damagedQty: damaged.damaged_quantity || 0,
            reason: damaged.resolution_action || damaged.status || 'Pending',
            status: damaged.status,
            description: damaged.description || '',
            discoveryDate: damaged.discovery_date,
            inventoryAdjusted: damaged.inventory_adjusted,
            _original: damaged
          };
        });

        setDamagedProductData(transformedData);
        setTotalRecords(response.total || 0);
        setTotalPages(response.pages || 0);
      } else {
        console.error('Failed to load damaged products:', response.message);
        setDamagedProductData([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading damaged products:', error);
      setErrorMessage('Failed to load damaged products');
      setDamagedProductData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on mount and when filters change
  useEffect(() => {
    loadDamagedProducts();
  }, [currentPage, reasonFilter, searchTerm]);

  // Sample fake damaged product data - REMOVE sau khi test API
  const oldDamagedProductData = [
    {
      id: "P001",
      name: "Fresh Milk 1L",
      supplier: "Dairy Co.",
      shelfLocation: "A1",
      section: "A",
      slot: "12",
      damagedQty: 5,
      reason: "Expired",
    },
    {
      id: "P002",
      name: "Organic Bananas",
      supplier: "Fresh Farms",
      shelfLocation: "B3",
      section: "B",
      slot: "08",
      damagedQty: 12,
      reason: "Damaged",
    },
    {
      id: "P003",
      name: "Whole Wheat Bread",
      supplier: "Bakery Plus",
      shelfLocation: "C2",
      section: "C",
      slot: "15",
      damagedQty: 8,
      reason: "Expired",
    },
    {
      id: "P004",
      name: "Greek Yogurt",
      supplier: "Dairy Co.",
      shelfLocation: "A2",
      section: "A",
      slot: "20",
      damagedQty: 3,
      reason: "Other reason",
    },
    {
      id: "P005",
      name: "Orange Juice 1L",
      supplier: "Juice World",
      shelfLocation: "D1",
      section: "D",
      slot: "05",
      damagedQty: 7,
      reason: "Damaged",
    },
    {
      id: "P006",
      name: "Chicken Breast",
      supplier: "Meat Market",
      shelfLocation: "F1",
      section: "F",
      slot: "03",
      damagedQty: 4,
      reason: "Expired",
      status: "Processed",
    },
    {
      id: "P007",
      name: "Pasta Sauce",
      supplier: "Italian Foods",
      shelfLocation: "E3",
      section: "E",
      slot: "18",
      damagedQty: 2,
      reason: "Damaged",
    },
    {
      id: "P008",
      name: "Frozen Pizza",
      supplier: "Frozen Co.",
      shelfLocation: "G2",
      section: "G",
      slot: "11",
      damagedQty: 6,
      reason: "Other reason",
    },
    {
      id: "P009",
      name: "Fresh Apples",
      supplier: "Fresh Farms",
      shelfLocation: "B1",
      section: "B",
      slot: "14",
      damagedQty: 15,
      reason: "Damaged",
    },
    {
      id: "P010",
      name: "Cereal Box",
      supplier: "Breakfast Co.",
      shelfLocation: "C1",
      section: "C",
      slot: "07",
      damagedQty: 4,
      reason: "Expired",
    },
    {
      id: "P011",
      name: "Canned Tomatoes",
      supplier: "Canned Goods",
      shelfLocation: "E1",
      section: "E",
      slot: "22",
      damagedQty: 3,
      reason: "Other reason",
    },
    {
      id: "P012",
      name: "Ice Cream",
      supplier: "Frozen Co.",
      shelfLocation: "G1",
      section: "G",
      slot: "09",
      damagedQty: 8,
      reason: "Damaged",
    },
  ]; // End fake data

  // Filter data first (now using API data)
  const filteredData = damagedProductData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.includes(searchTerm) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason =
      reasonFilter === "All" || product.reason === reasonFilter;
    return matchesSearch && matchesReason;
  });

  // Calculate pagination (API handles filtering)
  const totalItems = totalRecords;
  const clientTotalPages = totalPages || Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Use filtered data directly as API returns filtered results
  const paginatedData = filteredData;

  const handleReasonFilterChange = (reason) => {
    setReasonFilter(reason);
  };

  const handleEdit = (productId) => {
    console.log("Edit product:", productId);
    // Add edit functionality here
    navigate(`/damaged-product/edit/${productId}`);
  };

  const handleRecordDamaged = () => {
    console.log("Record new damaged product");
    navigate("/damaged-product/record");
  };

  const getReasonBadgeClass = (reason) => {
    switch (reason) {
      case "Expired":
        return "expired";
      case "Damaged":
        return "damaged";
      case "Other reason":
        return "other";
      default:
        return "";
    }
  };

  return (
    <div className="damaged-product-view">
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
      <div className="damaged-page-header">
        <h1 className="damaged-page-title">Damaged Products</h1>
      </div>

      {/* Filters and Actions */}
      <div className="damaged-filters-section">
        <div className="damaged-left-filters">
          <div className="damaged-search-container">
            <FaSearch className="damaged-search-icon" />
            <input
              type="text"
              placeholder="Search products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="damaged-search-input"
            />
          </div>

          <div className="damaged-dropdown">
            <select
              value={reasonFilter}
              onChange={(e) => handleReasonFilterChange(e.target.value)}
              className="damaged-filter-select"
            >
              <option value="All">All</option>
              <option value="Expired">Expired</option>
              <option value="Damaged">Damaged</option>
              <option value="Other reason">Other reason</option>
            </select>
          </div>
        </div>

        <div className="damaged-right-actions">
          <button className="damaged-record-btn" onClick={handleRecordDamaged}>
            <FaPlus className="damaged-add-icon" />
            Record Damaged Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="damaged-table-container">
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}>
            <div>Loading damaged products...</div>
          </div>
        )}
        <table className="damaged-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Supplier</th>
              <th>Shelf Location</th>
              <th>Section</th>
              <th>Slot</th>
              <th>Damaged Qty</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && paginatedData.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  No damaged products found
                </td>
              </tr>
            )}
            {paginatedData.map((product, index) => (
              <tr key={`page-${currentPage}-${product.id}-${index}`}>
                <td className="damaged-product-id">{product.id}</td>
                <td className="damaged-product-name">{product.name}</td>
                <td className="damaged-supplier">{product.supplier}</td>
                <td className="damaged-shelf-location">
                  {product.shelfLocation}
                </td>
                <td className="damaged-section">{product.section}</td>
                <td className="damaged-slot">{product.slot}</td>
                <td className="damaged-qty">{product.damagedQty}</td>
                <td>
                  <span
                    className={`damaged-reason-badge ${getReasonBadgeClass(
                      product.reason
                    )}`}
                  >
                    {product.reason}
                  </span>
                </td>
                <td className="damaged-action-buttons">
                  <button
                    className="damaged-action-btn damaged-edit-btn"
                    onClick={() => handleEdit(product.id)}
                    title="Edit Product"
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="damaged-pagination-section">
        <div className="damaged-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="damaged-pagination-controls">
          <button
            className="damaged-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="damaged-page-numbers">
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
                  className={`damaged-page-number ${
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
            className="damaged-pagination-btn"
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

export default DamagedProduct;
