import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaPlus,
  FaArrowLeft,
  FaCheck,
  FaBox,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AddShelfProduct.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const AddShelfProduct = () => {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for product inventory table (left)
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] =
    useState("All categories");
  const [shelfStatusFilter, setShelfStatusFilter] = useState("All status");
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [productQuantities, setProductQuantities] = useState({});

  // State for shelf table (right)
  const [shelfSearchTerm, setShelfSearchTerm] = useState("");
  const [shelfLocationFilter, setShelfLocationFilter] =
    useState("All locations");
  const [sectionFilter, setSectionFilter] = useState("All sections");
  const [slotFilter, setSlotFilter] = useState("All slots");
  const [shelfCurrentPage, setShelfCurrentPage] = useState(1);
  const [selectedShelf, setSelectedShelf] = useState(null);

  const itemsPerPage = 10;

  // Sample inventory data (products not yet on shelves or partially on shelves)
  const inventoryData = [
    {
      id: "001",
      name: "Product 1",
      category: "Electronics",
      price: "$20",
      supplier: "Supplier 1",
      stock: 100,
      onShelfStatus: "In Stock", // In Stock, Low Stock, Out of Stock
      shelfedQty: 0,
      totalQty: 100,
    },
    {
      id: "002",
      name: "Product 1",
      category: "Electronics",
      price: "$30",
      supplier: "Supplier 1",
      stock: 100,
      onShelfStatus: "In Stock",
      shelfedQty: 50,
      totalQty: 100,
    },
    {
      id: "003",
      name: "Product 1",
      category: "Home & Garden",
      price: "$30",
      supplier: "Supplier 2",
      stock: 100,
      onShelfStatus: "Out of Stock",
      shelfedQty: 100,
      totalQty: 100,
    },
    {
      id: "004",
      name: "Product 1",
      category: "Home & Garden",
      price: "$30",
      supplier: "Supplier 1",
      stock: 100,
      onShelfStatus: "Low Stock",
      shelfedQty: 20,
      totalQty: 100,
    },
    {
      id: "005",
      name: "Product 2",
      category: "Electronics",
      price: "$200",
      supplier: "Supplier 2",
      stock: 200,
      onShelfStatus: "In Stock",
      shelfedQty: 0,
      totalQty: 200,
    },
    {
      id: "006",
      name: "Product 3",
      category: "Clothing",
      price: "$50",
      supplier: "Supplier 3",
      stock: 150,
      onShelfStatus: "In Stock",
      shelfedQty: 75,
      totalQty: 150,
    },
  ];

  // Sample shelf data
  const shelfData = [
    {
      id: "S01",
      name: "Shelf A1 - Fresh Produce",
      capacity: 50,
      currentQty: 30,
      available: 20,
      shelfLocation: "A1",
      section: "A",
      slot: "01",
    },
    {
      id: "S02",
      name: "Shelf A2 - Dairy Products",
      capacity: 60,
      currentQty: 45,
      available: 15,
      shelfLocation: "A2",
      section: "A",
      slot: "02",
    },
    {
      id: "S03",
      name: "Shelf B1 - Beverages",
      capacity: 80,
      currentQty: 20,
      available: 60,
      shelfLocation: "B1",
      section: "B",
      slot: "01",
    },
    {
      id: "S04",
      name: "Shelf E2 - Snacks",
      capacity: 70,
      currentQty: 65,
      available: 5,
      shelfLocation: "E2",
      section: "E",
      slot: "02",
    },
    {
      id: "S05",
      name: "Shelf C1 - Frozen Food",
      capacity: 55,
      currentQty: 0,
      available: 55,
      shelfLocation: "C1",
      section: "C",
      slot: "01",
    },
  ];

  // Get unique values for filters
  const categories = [
    "All categories",
    ...new Set(inventoryData.map((product) => product.category)),
  ];

  const shelfStatuses = ["All status", "In Stock", "Low Stock", "Out of Stock"];

  const shelfLocations = [
    "All locations",
    ...new Set(shelfData.map((shelf) => shelf.shelfLocation)),
  ];

  const sections = [
    "All sections",
    ...new Set(shelfData.map((shelf) => shelf.section)),
  ];

  const slots = ["All slots", ...new Set(shelfData.map((shelf) => shelf.slot))];

  // Filter product data
  const filteredProductData = inventoryData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(productSearchTerm.toLowerCase());
    const matchesCategory =
      productCategoryFilter === "All categories" ||
      product.category === productCategoryFilter;
    const matchesShelfStatus =
      shelfStatusFilter === "All status" ||
      product.onShelfStatus === shelfStatusFilter;

    return matchesSearch && matchesCategory && matchesShelfStatus;
  });

  // Filter shelf data
  const filteredShelfData = shelfData.filter((shelf) => {
    const matchesSearch =
      shelf.name.toLowerCase().includes(shelfSearchTerm.toLowerCase()) ||
      shelf.id.toLowerCase().includes(shelfSearchTerm.toLowerCase());
    const matchesLocation =
      shelfLocationFilter === "All locations" ||
      shelf.shelfLocation === shelfLocationFilter;
    const matchesSection =
      sectionFilter === "All sections" || shelf.section === sectionFilter;
    const matchesSlot = slotFilter === "All slots" || shelf.slot === slotFilter;

    return matchesSearch && matchesLocation && matchesSection && matchesSlot;
  });

  // Pagination for products
  const totalProductItems = filteredProductData.length;
  const totalProductPages = Math.ceil(totalProductItems / itemsPerPage);
  const productStartIndex = (productCurrentPage - 1) * itemsPerPage;
  const productEndIndex = productStartIndex + itemsPerPage;
  const paginatedProductData = filteredProductData.slice(
    productStartIndex,
    productEndIndex
  );

  // Pagination for shelves
  const totalShelfItems = filteredShelfData.length;
  const totalShelfPages = Math.ceil(totalShelfItems / itemsPerPage);
  const shelfStartIndex = (shelfCurrentPage - 1) * itemsPerPage;
  const shelfEndIndex = shelfStartIndex + itemsPerPage;
  const paginatedShelfData = filteredShelfData.slice(
    shelfStartIndex,
    shelfEndIndex
  );

  const handleSelectProduct = (productId) => {
    const product = inventoryData.find((p) => p.id === productId);
    const isFullyShelved = product.shelfedQty >= product.totalQty;

    // Prevent selection of fully shelved products
    if (isFullyShelved) {
      return;
    }

    const newSelected = new Set(selectedProducts);
    const newQuantities = { ...productQuantities };

    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      delete newQuantities[productId];
    } else {
      newSelected.add(productId);
      const availableQty = product.totalQty - product.shelfedQty;
      newQuantities[productId] = Math.min(1, availableQty); // Default to 1 or available quantity
    }

    setSelectedProducts(newSelected);
    setProductQuantities(newQuantities);
  };

  const handleQuantityChange = (productId, quantity) => {
    const product = inventoryData.find((p) => p.id === productId);
    const availableQty = product.totalQty - product.shelfedQty;
    const validQuantity = Math.max(1, Math.min(quantity, availableQty));

    setProductQuantities({
      ...productQuantities,
      [productId]: validQuantity,
    });
  };

  const handleSelectShelf = (shelfId) => {
    setSelectedShelf(shelfId === selectedShelf ? null : shelfId);
  };

  const handleAddToShelf = () => {
    if (selectedProducts.size === 0 || !selectedShelf) {
      setErrorMessage("Please select at least one product and one shelf!");
      return;
    }

    // Validate quantities
    const invalidProducts = Array.from(selectedProducts).filter((productId) => {
      const quantity = productQuantities[productId];
      return !quantity || quantity <= 0;
    });

    if (invalidProducts.length > 0) {
      setE("Please enter valid quantities for all selected products!");
      return;
    }

    const shelf = shelfData.find((s) => s.id === selectedShelf);
    const totalQuantity = Object.values(productQuantities).reduce(
      (sum, qty) => sum + (qty || 0),
      0
    );

    // Validate shelf capacity
    if (totalQuantity > shelf.available) {
      setErrorMessage(
        `Cannot add ${totalQuantity} items to ${shelf.name}!\n` +
          `Available space: ${shelf.available} items\n` +
          `You're trying to add: ${totalQuantity} items\n` +
          `Please reduce the quantities or select a different shelf.`
      );
      return;
    }

    const selectedProductsList = Array.from(selectedProducts).map(
      (productId) => {
        const product = inventoryData.find((p) => p.id === productId);
        return {
          ...product,
          quantityToAdd: productQuantities[productId],
        };
      }
    );

    console.log("Adding products to shelf:", {
      products: selectedProductsList,
      shelf: shelf,
      totalQuantity: totalQuantity,
    });

    setSuccessMessage(
      `Successfully added ${totalQuantity} item(s) from ${selectedProducts.size} product(s) to ${shelf.name}!`
    );

    // Reset selections
    setSelectedProducts(new Set());
    setProductQuantities({});
    setSelectedShelf(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "In Stock":
        return "add-shelf-status-badge in-stock";
      case "Low Stock":
        return "add-shelf-status-badge low-stock";
      case "Out of Stock":
        return "add-shelf-status-badge out-stock";
      default:
        return "add-shelf-status-badge";
    }
  };

  const renderPagination = (currentPage, totalPages, setCurrentPage) => (
    <div className="add-shelf-pagination-section">
      <div className="add-shelf-pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      <div className="add-shelf-pagination-controls">
        <button
          className="add-shelf-pagination-btn"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          ‹
        </button>

        <div className="add-shelf-page-numbers">
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
                className={`add-shelf-page-btn ${
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
          className="add-shelf-pagination-btn"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );

  return (
    <div className="add-shelf-view">
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
      <div className="add-shelf-header">
        <div className="add-shelf-title-section">
          <button
            className="add-shelf-back-btn"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <FaArrowLeft className="add-shelf-back-icon" />
            Back
          </button>
          <div>
            <h1 className="add-shelf-page-title">Add Product on Shelves</h1>
            <p className="add-shelf-page-subtitle">
              Select products from inventory and assign to shelves
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="add-shelf-main-content">
        {/* Left Panel - Product Inventory */}
        <div className="add-shelf-left-panel">
          <div className="add-shelf-panel-header">
            <h2 className="add-shelf-panel-title">
              Select Products from Inventory
            </h2>
            <div className="add-shelf-selected-count">
              {selectedProducts.size} selected
            </div>
          </div>

          {/* Product Filters */}
          <div className="add-shelf-filters">
            <div className="add-shelf-search-container">
              <FaSearch className="add-shelf-search-icon" />
              <input
                type="text"
                placeholder="Search by product name or ID..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="add-shelf-search-input"
              />
            </div>

            <div className="add-shelf-filter-row">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="add-shelf-filter-select"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={shelfStatusFilter}
                onChange={(e) => setShelfStatusFilter(e.target.value)}
                className="add-shelf-filter-select"
              >
                {shelfStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Table */}
          <div className="add-shelf-table-container">
            <table className="add-shelf-product-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Status</th>
                  <th>Shelved/Total</th>
                  <th>Quantity to Add</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProductData.map((product) => {
                  const isSelected = selectedProducts.has(product.id);
                  const isFullyShelved = product.shelfedQty >= product.totalQty;
                  const availableToShelve =
                    product.totalQty - product.shelfedQty;

                  return (
                    <tr
                      key={product.id}
                      className={`${isSelected ? "selected-row" : ""} ${
                        isFullyShelved ? "fully-shelved-row" : ""
                      }`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectProduct(product.id)}
                          disabled={isFullyShelved}
                          className={`add-shelf-checkbox ${
                            isFullyShelved ? "disabled" : ""
                          }`}
                          title={
                            isFullyShelved ? "Product is fully shelved" : ""
                          }
                        />
                      </td>
                      <td className="add-shelf-product-id">{product.id}</td>
                      <td className="add-shelf-product-name">{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <span
                          className={getStatusBadgeClass(product.onShelfStatus)}
                        >
                          {product.onShelfStatus}
                        </span>
                      </td>
                      <td className="add-shelf-quantity-info">
                        {product.shelfedQty}/{product.totalQty}
                      </td>
                      <td className="add-shelf-quantity-input-cell">
                        {isFullyShelved ? (
                          <span className="add-shelf-fully-shelved-text">
                            Fully Shelved
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            max={availableToShelve}
                            value={productQuantities[product.id] || ""}
                            onChange={(e) =>
                              handleQuantityChange(
                                product.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            disabled={!isSelected}
                            className="add-shelf-quantity-input"
                            placeholder="0"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Product Pagination */}
          {renderPagination(
            productCurrentPage,
            totalProductPages,
            setProductCurrentPage
          )}
        </div>

        {/* Right Panel - Shelf Selection */}
        <div className="add-shelf-right-panel">
          <div className="add-shelf-panel-header">
            <h2 className="add-shelf-panel-title">Select Shelf</h2>
            {selectedShelf && (
              <div className="add-shelf-selected-indicator">
                <FaCheck className="add-shelf-check-icon" />
                Selected
              </div>
            )}
          </div>

          {/* Shelf Filters */}
          <div className="add-shelf-filters">
            <div className="add-shelf-search-container">
              <FaSearch className="add-shelf-search-icon" />
              <input
                type="text"
                placeholder="Search shelf..."
                value={shelfSearchTerm}
                onChange={(e) => setShelfSearchTerm(e.target.value)}
                className="add-shelf-search-input"
              />
            </div>

            <div className="add-shelf-filter-row">
              <select
                value={shelfLocationFilter}
                onChange={(e) => setShelfLocationFilter(e.target.value)}
                className="add-shelf-filter-select"
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
                className="add-shelf-filter-select"
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
                className="add-shelf-filter-select"
              >
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shelf Table */}
          <div className="add-shelf-table-container">
            <table className="add-shelf-shelf-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Shelf ID</th>
                  <th>Shelf Name</th>
                  <th>Location</th>
                  <th>Section</th>
                  <th>Slot</th>
                  <th>Capacity</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShelfData.map((shelf) => {
                  const isSelected = selectedShelf === shelf.id;
                  const utilization = (shelf.currentQty / shelf.capacity) * 100;
                  return (
                    <tr
                      key={shelf.id}
                      className={isSelected ? "selected-row" : ""}
                    >
                      <td>
                        <input
                          type="radio"
                          name="selectedShelf"
                          checked={isSelected}
                          onClick={() => handleSelectShelf(shelf.id)}
                          onChange={() => {}} // Prevent default radio behavior
                          className="add-shelf-radio"
                        />
                      </td>
                      <td className="add-shelf-shelf-id">{shelf.id}</td>
                      <td className="add-shelf-shelf-name">{shelf.name}</td>
                      <td>{shelf.shelfLocation}</td>
                      <td>{shelf.section}</td>
                      <td>{shelf.slot}</td>
                      <td>
                        <div className="add-shelf-capacity-info">
                          <span>
                            {shelf.currentQty}/{shelf.capacity}
                          </span>
                          <div className="add-shelf-capacity-bar">
                            <div
                              className="add-shelf-capacity-fill"
                              style={{ width: `${utilization}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="add-shelf-available">
                        <span
                          className={shelf.available > 0 ? "positive" : "zero"}
                        >
                          {shelf.available}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Shelf Pagination */}
          {renderPagination(
            shelfCurrentPage,
            totalShelfPages,
            setShelfCurrentPage
          )}
        </div>
      </div>

      {/* Action Button */}
      {selectedProducts.size > 0 && selectedShelf && (
        <div className="add-shelf-action-bar">
          {(() => {
            const shelf = shelfData.find((s) => s.id === selectedShelf);
            const totalQuantity = Object.values(productQuantities).reduce(
              (sum, qty) => sum + (qty || 0),
              0
            );
            const isOverCapacity = totalQuantity > shelf.available;

            return (
              <>
                <div className="add-shelf-capacity-indicator">
                  <div
                    className={`add-shelf-capacity-status ${
                      isOverCapacity ? "over-capacity" : "within-capacity"
                    }`}
                  >
                    <FaBox className="add-shelf-capacity-icon" />
                    <span>
                      {totalQuantity} / {shelf.available} items
                    </span>
                    {isOverCapacity && (
                      <FaExclamationTriangle className="add-shelf-warning-icon" />
                    )}
                  </div>
                  <div className="add-shelf-capacity-text">
                    {isOverCapacity
                      ? `Exceeds capacity by ${
                          totalQuantity - shelf.available
                        } items`
                      : `${shelf.available - totalQuantity} items remaining`}
                  </div>
                </div>
                <button
                  className={`add-shelf-add-btn ${
                    isOverCapacity ? "disabled" : ""
                  }`}
                  onClick={handleAddToShelf}
                  disabled={isOverCapacity}
                >
                  <FaPlus className="add-shelf-add-icon" />
                  Add {totalQuantity} Item(s) to Shelf
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AddShelfProduct;
