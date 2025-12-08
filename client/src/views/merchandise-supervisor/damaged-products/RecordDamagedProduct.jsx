import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaExclamationTriangle,
  FaBox,
  FaSave,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import "./RecordDamagedProduct.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const RecordDamagedProduct = () => {
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
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [damagedQuantities, setDamagedQuantities] = useState({});
  const [damagedReasons, setDamagedReasons] = useState({});
  const [customReasons, setCustomReasons] = useState({});

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const itemsPerPage = 15;

  // Sample product data for damaged product recording
  const productData = [
    {
      id: "P001",
      name: "Coca Cola 330ml",
      category: "Beverages",
      supplier: "Beverage Co.",
      shelfLocation: "A1",
      section: "A",
      slot: "12",
      availableQty: 45,
      damagedQty: 0,
    },
    {
      id: "P001-D2",
      name: "Coca Cola 330ml",
      category: "Beverages",
      supplier: "Beverage Co.",
      shelfLocation: "D2",
      section: "D",
      slot: "08",
      availableQty: 60,
      damagedQty: 0,
    },
    {
      id: "P002",
      name: "White Bread",
      category: "Bakery",
      supplier: "Bakery Supply",
      shelfLocation: "C1",
      section: "C",
      slot: "15",
      availableQty: 25,
      damagedQty: 2,
    },
    {
      id: "P003",
      name: "Milk 1L",
      category: "Dairy",
      supplier: "Dairy Products Inc",
      shelfLocation: "A2",
      section: "A",
      slot: "20",
      availableQty: 0,
      damagedQty: 5,
    },
    {
      id: "P003-F1",
      name: "Milk 1L",
      category: "Dairy",
      supplier: "Dairy Products Inc",
      shelfLocation: "F1",
      section: "F",
      slot: "03",
      availableQty: 35,
      damagedQty: 1,
    },
    {
      id: "P004",
      name: "Banana (per kg)",
      category: "Fresh Produce",
      supplier: "Fresh Market",
      shelfLocation: "B1",
      section: "B",
      slot: "05",
      availableQty: 50,
      damagedQty: 3,
    },
    {
      id: "P005",
      name: "Apple Juice 1L",
      category: "Beverages",
      supplier: "Fruit Co.",
      shelfLocation: "A3",
      section: "A",
      slot: "18",
      availableQty: 30,
      damagedQty: 0,
    },
    {
      id: "P006",
      name: "Yogurt 200g",
      category: "Dairy",
      supplier: "Dairy Products Inc",
      shelfLocation: "E1",
      section: "E",
      slot: "10",
      availableQty: 40,
      damagedQty: 2,
    },
  ];

  // Get unique values for filters
  const suppliers = [
    "All suppliers",
    ...new Set(productData.map((product) => product.supplier)),
  ];
  const shelfLocations = [
    "All locations",
    ...new Set(productData.map((product) => product.shelfLocation)),
  ];
  const sections = [
    "All sections",
    ...new Set(productData.map((product) => product.section)),
  ];
  const slots = [
    "All slots",
    ...new Set(productData.map((product) => product.slot)),
  ];
  const categories = [
    "All categories",
    ...new Set(productData.map((product) => product.category)),
  ];

  // Filter data
  const filteredData = productData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier =
      supplierFilter === "All suppliers" || product.supplier === supplierFilter;
    const matchesShelfLocation =
      shelfLocationFilter === "All locations" ||
      product.shelfLocation === shelfLocationFilter;
    const matchesSection =
      sectionFilter === "All sections" || product.section === sectionFilter;
    const matchesSlot =
      slotFilter === "All slots" || product.slot === slotFilter;
    const matchesCategory =
      categoryFilter === "All categories" ||
      product.category === categoryFilter;

    return (
      matchesSearch &&
      matchesSupplier &&
      matchesShelfLocation &&
      matchesSection &&
      matchesSlot &&
      matchesCategory
    );
  });

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      // Clear damaged quantity, reason, and custom reason when deselected
      const newQuantities = { ...damagedQuantities };
      const newReasons = { ...damagedReasons };
      const newCustomReasons = { ...customReasons };
      delete newQuantities[productId];
      delete newReasons[productId];
      delete newCustomReasons[productId];
      setDamagedQuantities(newQuantities);
      setDamagedReasons(newReasons);
      setCustomReasons(newCustomReasons);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleQuantityChange = (productId, quantity) => {
    const product = productData.find((p) => p.id === productId);
    const validatedQuantity = Math.min(
      Math.max(0, quantity),
      product.availableQty
    );

    setDamagedQuantities({
      ...damagedQuantities,
      [productId]: validatedQuantity,
    });
  };

  const handleReasonChange = (productId, reason) => {
    setDamagedReasons({
      ...damagedReasons,
      [productId]: reason,
    });

    // Clear custom reason if not "other"
    if (reason !== "other") {
      const newCustomReasons = { ...customReasons };
      delete newCustomReasons[productId];
      setCustomReasons(newCustomReasons);
    }
  };

  const handleCustomReasonChange = (productId, customReason) => {
    setCustomReasons({
      ...customReasons,
      [productId]: customReason,
    });
  };

  const handleSaveRecords = () => {
    // Validate records before saving
    const invalidRecords = Array.from(selectedProducts).filter((productId) => {
      const product = productData.find((p) => p.id === productId);
      const quantity = damagedQuantities[productId] || 0;
      const reason = damagedReasons[productId];
      const customReason = customReasons[productId];

      return (
        quantity <= 0 ||
        quantity > product.availableQty ||
        !reason ||
        (reason === "other" && !customReason?.trim())
      );
    });

    if (invalidRecords.length > 0) {
      setErrorMessage(
        "Please fix validation errors before saving:\n- Damaged quantity must be between 1 and available quantity\n- Reason must be selected\n- Custom reason must be provided when 'Other reason' is selected"
      );
      return;
    }

    const recordsToSave = Array.from(selectedProducts).map((productId) => {
      const product = productData.find((p) => p.id === productId);
      const reason = damagedReasons[productId];
      const finalReason =
        reason === "other" ? customReasons[productId] : reason;

      return {
        productId,
        productName: product.name,
        damagedQuantity: damagedQuantities[productId] || 0,
        reason: finalReason,
        reasonType: reason,
        date: new Date().toISOString(),
      };
    });

    console.log("Saving damaged product records:", recordsToSave);
    setSuccessMessage(
      `Saved ${recordsToSave.length} damaged product records successfully!`
    );

    // Reset form
    setSelectedProducts(new Set());
    setDamagedQuantities({});
    setDamagedReasons({});
    setCustomReasons({});
  };

  return (
    <div className="record-damaged-view">
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
      <div className="record-damaged-header">
        <div className="record-damaged-title-section">
          <button
            className="record-damaged-back-btn"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <FaArrowLeft className="record-damaged-back-icon" />
            Back
          </button>
          <div>
            <h1 className="record-damaged-page-title">
              Record Damaged Products
            </h1>
            <p className="record-damaged-page-subtitle">
              Select products and record damage information
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="record-damaged-filters">
        <div className="record-damaged-search-container">
          <FaSearch className="record-damaged-search-icon" />
          <input
            type="text"
            placeholder="Search by product name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="record-damaged-search-input"
          />
        </div>

        <div className="record-damaged-filter-row">
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="record-damaged-filter-select"
          >
            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>

          <select
            value={shelfLocationFilter}
            onChange={(e) => setShelfLocationFilter(e.target.value)}
            className="record-damaged-filter-select"
          >
            {shelfLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="record-damaged-filter-select"
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>

          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="record-damaged-filter-select"
          >
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="record-damaged-filter-select"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Bar */}
      {selectedProducts.size > 0 && (
        <div className="record-damaged-action-bar">
          <div className="record-damaged-selected-info">
            <FaBox className="record-damaged-selected-icon" />
            <span>{selectedProducts.size} products selected</span>
          </div>
          <button
            className="record-damaged-save-btn"
            onClick={handleSaveRecords}
            disabled={selectedProducts.size === 0}
          >
            <FaSave className="record-damaged-save-icon" />
            Save Records
          </button>
        </div>
      )}

      {/* Table */}
      <div className="record-damaged-table-container">
        <table className="record-damaged-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Supplier</th>
              <th>Shelf Location</th>
              <th>Section</th>
              <th>Slot</th>
              <th>Available Qty</th>
              <th>Damaged Qty</th>
              <th>Reason</th>
              <th>Custom Reason</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((product) => {
              const isSelected = selectedProducts.has(product.id);
              return (
                <tr
                  key={product.id}
                  className={isSelected ? "selected-row" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectProduct(product.id)}
                      className="record-damaged-checkbox"
                    />
                  </td>
                  <td className="record-damaged-product-id">{product.id}</td>
                  <td className="record-damaged-product-name">
                    {product.name}
                  </td>
                  <td>{product.supplier}</td>
                  <td className="record-damaged-shelf-location">
                    {product.shelfLocation}
                  </td>
                  <td>{product.section}</td>
                  <td>{product.slot}</td>
                  <td className="record-damaged-available-qty">
                    {product.availableQty}
                  </td>
                  <td className="record-damaged-damaged-qty">
                    <input
                      type="number"
                      min="0"
                      max={product.availableQty}
                      value={damagedQuantities[product.id] || ""}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value <= product.availableQty) {
                          handleQuantityChange(product.id, value);
                        }
                      }}
                      disabled={!isSelected}
                      className={`record-damaged-qty-input ${
                        damagedQuantities[product.id] > product.availableQty
                          ? "invalid"
                          : ""
                      }`}
                      placeholder="0"
                      title={`Maximum: ${product.availableQty}`}
                    />
                  </td>
                  <td className="record-damaged-reason">
                    <select
                      value={damagedReasons[product.id] || ""}
                      onChange={(e) =>
                        handleReasonChange(product.id, e.target.value)
                      }
                      disabled={!isSelected}
                      className="record-damaged-reason-select"
                    >
                      <option value="">Select reason...</option>
                      <option value="expired">Expired</option>
                      <option value="damaged">Damaged</option>
                      <option value="other">Other reason</option>
                    </select>
                  </td>
                  <td className="record-damaged-custom-reason">
                    <input
                      type="text"
                      value={customReasons[product.id] || ""}
                      onChange={(e) =>
                        handleCustomReasonChange(product.id, e.target.value)
                      }
                      disabled={
                        !isSelected || damagedReasons[product.id] !== "other"
                      }
                      className="record-damaged-custom-reason-input"
                      placeholder="Enter custom reason..."
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="record-damaged-pagination-section">
        <div className="record-damaged-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="record-damaged-pagination-controls">
          <button
            className="record-damaged-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          <div className="record-damaged-page-numbers">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage === 1) {
                pageNum = i + 1;
              } else if (currentPage === totalPages) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`record-damaged-page-btn ${
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
            className="record-damaged-pagination-btn"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDamagedProduct;
