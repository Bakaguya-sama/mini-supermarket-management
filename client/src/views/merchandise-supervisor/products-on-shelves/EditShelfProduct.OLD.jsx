import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBox,
  FaArrowRight,
  FaTimes,
  FaSave,
  FaDownload,
  FaArrowLeft,
} from "react-icons/fa";
import "./EditShelfProduct.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const EditShelfProduct = () => {
  const { combinedId } = useParams();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Parse the combined id to extract productId and location
  const [productId, location] = combinedId ? combinedId.split("-") : ["", ""];

  // Debug logging
  console.log("EditShelfProduct mounted");
  console.log("combinedId:", combinedId);
  console.log("productId:", productId, "location:", location);

  // Sample selected product data with current shelf locations
  const [selectedProduct, setSelectedProduct] = useState({
    id: "P001",
    name: "Coca Cola 330ml",
    category: "Beverages",
    brand: "Coca-Cola",
    price: "$1.99",
    supplier: "Beverage Co.",
    totalStock: 105,
    locations: [
      {
        shelfLocation: "A1",
        section: "A",
        slot: "12",
        stock: 45,
        capacity: 60,
        status: "Low Stock",
      },
      {
        shelfLocation: "D2",
        section: "D",
        slot: "08",
        stock: 60,
        capacity: 80,
        status: "In Stock",
      },
    ],
  });

  // Sample available shelf locations
  const [availableShelfData] = useState([
    {
      shelfLocation: "A1",
      section: "A",
      slot: "12",
      capacity: 60,
      currentStock: 45,
      availableSpace: 15,
    },
    {
      shelfLocation: "A2",
      section: "A",
      slot: "20",
      capacity: 50,
      currentStock: 0,
      availableSpace: 50,
    },
    {
      shelfLocation: "B1",
      section: "B",
      slot: "07",
      capacity: 70,
      currentStock: 40,
      availableSpace: 30,
    },
    {
      shelfLocation: "B3",
      section: "B",
      slot: "14",
      capacity: 80,
      currentStock: 80,
      availableSpace: 0,
    },
    {
      shelfLocation: "C1",
      section: "C",
      slot: "15",
      capacity: 60,
      currentStock: 25,
      availableSpace: 35,
    },
    {
      shelfLocation: "C2",
      section: "C",
      slot: "18",
      capacity: 90,
      currentStock: 22,
      availableSpace: 68,
    },
    {
      shelfLocation: "D1",
      section: "D",
      slot: "05",
      capacity: 75,
      currentStock: 0,
      availableSpace: 75,
    },
    {
      shelfLocation: "D2",
      section: "D",
      slot: "08",
      capacity: 80,
      currentStock: 60,
      availableSpace: 20,
    },
  ]);

  const [shelfSearchTerm, setShelfSearchTerm] = useState("");
  const [shelfCurrentPage, setShelfCurrentPage] = useState(1);
  const [pendingActions, setPendingActions] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});

  const itemsPerPage = 5;

  // Filter available shelves
  const filteredShelfData = availableShelfData.filter((shelf) => {
    const matchesSearch =
      shelf.shelfLocation
        .toLowerCase()
        .includes(shelfSearchTerm.toLowerCase()) ||
      shelf.section.toLowerCase().includes(shelfSearchTerm.toLowerCase()) ||
      shelf.slot.toLowerCase().includes(shelfSearchTerm.toLowerCase());

    return matchesSearch;
  });

  // Calculate pagination for shelves
  const totalShelfItems = filteredShelfData.length;
  const totalShelfPages = Math.ceil(totalShelfItems / itemsPerPage);
  const shelfStartIndex = (shelfCurrentPage - 1) * itemsPerPage;
  const shelfEndIndex = shelfStartIndex + itemsPerPage;
  const paginatedShelfData = filteredShelfData.slice(
    shelfStartIndex,
    shelfEndIndex
  );

  const handleQuantityChange = (shelfLocation, type, value) => {
    const key = `${shelfLocation}-${type}`;
    setSelectedQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const getQuantityForLocation = (shelfLocation, type) => {
    const key = `${shelfLocation}-${type}`;
    return selectedQuantities[key] || 0;
  };

  const handleMoveToShelf = (targetShelf) => {
    const moveQuantity = getQuantityForLocation(
      targetShelf.shelfLocation,
      "move"
    );

    if (moveQuantity <= 0) {
      setErrorMessage("Please enter a valid quantity to move");
      return;
    }

    if (moveQuantity > targetShelf.availableSpace) {
      setErrorMessage(
        `Cannot move ${moveQuantity} units. Available space: ${targetShelf.availableSpace}`
      );
      return;
    }

    const action = {
      id: Date.now(),
      type: "move",
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      targetShelf: targetShelf.shelfLocation,
      targetSection: targetShelf.section,
      targetSlot: targetShelf.slot,
      quantity: moveQuantity,
    };

    setPendingActions((prev) => [...prev, action]);

    // Reset quantity input
    const key = `${targetShelf.shelfLocation}-move`;
    setSelectedQuantities((prev) => ({
      ...prev,
      [key]: 0,
    }));
  };

  const handleRemoveFromShelf = (sourceLocation) => {
    const removeQuantity = getQuantityForLocation(
      sourceLocation.shelfLocation,
      "remove"
    );

    if (removeQuantity <= 0) {
      setErrorMessage("Please enter a valid quantity to remove");
      return;
    }

    if (removeQuantity > sourceLocation.stock) {
      setErrorMessage(
        `Cannot remove ${removeQuantity} units. Available stock: ${sourceLocation.stock}`
      );
      return;
    }

    const action = {
      id: Date.now(),
      type: "remove",
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sourceShelf: sourceLocation.shelfLocation,
      sourceSection: sourceLocation.section,
      sourceSlot: sourceLocation.slot,
      quantity: removeQuantity,
    };

    setPendingActions((prev) => [...prev, action]);

    // Reset quantity input
    const key = `${sourceLocation.shelfLocation}-remove`;
    setSelectedQuantities((prev) => ({
      ...prev,
      [key]: 0,
    }));
  };

  const handleRemoveAction = (actionId) => {
    setPendingActions((prev) =>
      prev.filter((action) => action.id !== actionId)
    );
  };

  const handleSaveChanges = () => {
    if (pendingActions.length === 0) {
      setErrorMessage("No changes to save");
      return;
    }

    console.log("Saving changes:", pendingActions);
    setSuccessMessage(`Successfully saved ${pendingActions.length} changes!`);
    navigate(-1);
  };

  const handleCancel = () => {
    if (pendingActions.length > 0) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmLeave) return;
    }
    navigate(-1);
  };

  const getCapacityColor = (currentStock, capacity) => {
    const percentage = (currentStock / capacity) * 100;
    if (percentage >= 90) return "edit-shelf-capacity-full";
    if (percentage >= 70) return "edit-shelf-capacity-high";
    if (percentage >= 40) return "edit-shelf-capacity-medium";
    return "edit-shelf-capacity-low";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "In Stock":
        return "edit-shelf-status-approved";
      case "Low Stock":
        return "edit-shelf-status-pending";
      case "Out of Stock":
        return "edit-shelf-status-declined";
      default:
        return "edit-shelf-status-default";
    }
  };

  return (
    <div className="edit-shelf-product-view">
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
      <div className="edit-shelf-page-header">
        <button onClick={handleCancel} className="edit-shelf-back-btn">
          <FaArrowLeft />
        </button>
        <div className="edit-shelf-header-content">
          <h1 className="edit-shelf-page-title">Edit Shelf Product</h1>
          <p className="edit-shelf-page-subtitle">
            {selectedProduct.name} - {selectedProduct.id}
          </p>
        </div>
        <div className="edit-shelf-header-actions">
          <button onClick={handleSaveChanges} className="edit-shelf-save-btn">
            <FaSave className="edit-shelf-save-icon" />
            Save Changes ({pendingActions.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="edit-shelf-content">
        {/* Left Panel - Current Product Locations */}
        <div className="edit-shelf-left-panel">
          <div className="edit-shelf-panel-header">
            <FaBox className="edit-shelf-panel-icon" />
            <h2 className="edit-shelf-panel-title">Current Locations</h2>
            <span className="edit-shelf-location-count">
              {selectedProduct.locations.length} locations
            </span>
          </div>

          <div className="edit-shelf-current-locations">
            {selectedProduct.locations.map((location, index) => (
              <div key={index} className="edit-shelf-location-card">
                <div className="edit-shelf-location-header">
                  <div className="edit-shelf-location-info">
                    <span className="edit-shelf-location-name">
                      {location.shelfLocation}
                    </span>
                    <span className="edit-shelf-location-details">
                      Section {location.section} - Slot {location.slot}
                    </span>
                  </div>
                  <span
                    className={`edit-shelf-status-badge ${getStatusBadgeClass(
                      location.status
                    )}`}
                  >
                    {location.status}
                  </span>
                </div>

                <div className="edit-shelf-location-stats">
                  <div className="edit-shelf-stat-item">
                    <span className="edit-shelf-stat-label">Current Stock</span>
                    <span className="edit-shelf-stat-value">
                      {location.stock} units
                    </span>
                  </div>
                  <div className="edit-shelf-stat-item">
                    <span className="edit-shelf-stat-label">Capacity</span>
                    <span className="edit-shelf-stat-value">
                      {location.capacity} units
                    </span>
                  </div>
                </div>

                <div className="edit-shelf-capacity-bar">
                  <div
                    className={`edit-shelf-capacity-fill ${getCapacityColor(
                      location.stock,
                      location.capacity
                    )}`}
                    style={{
                      width: `${(location.stock / location.capacity) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="edit-shelf-remove-section">
                  <label className="edit-shelf-action-label">
                    Remove from shelf:
                  </label>
                  <div className="edit-shelf-action-controls">
                    <input
                      type="number"
                      min="0"
                      max={location.stock}
                      value={getQuantityForLocation(
                        location.shelfLocation,
                        "remove"
                      )}
                      onChange={(e) =>
                        handleQuantityChange(
                          location.shelfLocation,
                          "remove",
                          e.target.value
                        )
                      }
                      className="edit-shelf-quantity-input"
                      placeholder="Qty"
                    />
                    <button
                      onClick={() => handleRemoveFromShelf(location)}
                      className="edit-shelf-remove-btn"
                      disabled={
                        getQuantityForLocation(
                          location.shelfLocation,
                          "remove"
                        ) <= 0
                      }
                    >
                      <FaDownload />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Available Shelf Locations */}
        <div className="edit-shelf-right-panel">
          <div className="edit-shelf-panel-header">
            <FaBox className="edit-shelf-panel-icon" />
            <h2 className="edit-shelf-panel-title">
              Available Shelf Locations
            </h2>
          </div>

          {/* Search */}
          <div className="edit-shelf-search-container">
            <FaSearch className="edit-shelf-search-icon" />
            <input
              type="text"
              placeholder="Search by location, section, or slot..."
              value={shelfSearchTerm}
              onChange={(e) => setShelfSearchTerm(e.target.value)}
              className="edit-shelf-search-input"
            />
          </div>

          {/* Available Shelves Table */}
          <div className="edit-shelf-table-container">
            <table className="edit-shelf-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Available</th>
                  <th>Move Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedShelfData.map((shelf, index) => (
                  <tr key={index}>
                    <td>
                      <div className="edit-shelf-location-cell">
                        <div className="edit-shelf-location-name">
                          {shelf.shelfLocation}
                        </div>
                        <div className="edit-shelf-location-details">
                          Section {shelf.section} - Slot {shelf.slot}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="edit-shelf-capacity-info">
                        <span className="edit-shelf-capacity-text">
                          {shelf.currentStock}/{shelf.capacity}
                        </span>
                        <div className="edit-shelf-capacity-bar-small">
                          <div
                            className={`edit-shelf-capacity-fill ${getCapacityColor(
                              shelf.currentStock,
                              shelf.capacity
                            )}`}
                            style={{
                              width: `${
                                (shelf.currentStock / shelf.capacity) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`edit-shelf-available-space ${
                          shelf.availableSpace === 0
                            ? "edit-shelf-no-space"
                            : "edit-shelf-has-space"
                        }`}
                      >
                        {shelf.availableSpace}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={shelf.availableSpace}
                        value={getQuantityForLocation(
                          shelf.shelfLocation,
                          "move"
                        )}
                        onChange={(e) =>
                          handleQuantityChange(
                            shelf.shelfLocation,
                            "move",
                            e.target.value
                          )
                        }
                        className="edit-shelf-quantity-input"
                        placeholder="0"
                        disabled={shelf.availableSpace === 0}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleMoveToShelf(shelf)}
                        className="edit-shelf-move-btn"
                        disabled={
                          shelf.availableSpace === 0 ||
                          getQuantityForLocation(shelf.shelfLocation, "move") <=
                            0
                        }
                      >
                        <FaArrowRight />
                        Move
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="edit-shelf-pagination">
            <div className="edit-shelf-pagination-info">
              Showing {totalShelfItems > 0 ? shelfStartIndex + 1 : 0}-
              {Math.min(shelfEndIndex, totalShelfItems)} of {totalShelfItems}
            </div>
            <div className="edit-shelf-pagination-controls">
              <button
                className="edit-shelf-pagination-btn"
                onClick={() =>
                  setShelfCurrentPage(Math.max(1, shelfCurrentPage - 1))
                }
                disabled={shelfCurrentPage === 1}
              >
                ‹
              </button>

              <div className="edit-shelf-page-numbers">
                {Array.from(
                  { length: Math.min(3, totalShelfPages) },
                  (_, i) => {
                    let pageNum;
                    if (totalShelfPages <= 3) {
                      pageNum = i + 1;
                    } else if (shelfCurrentPage === 1) {
                      pageNum = i + 1;
                    } else if (shelfCurrentPage === totalShelfPages) {
                      pageNum = totalShelfPages - 2 + i;
                    } else {
                      pageNum = shelfCurrentPage - 1 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`edit-shelf-page-number ${
                          shelfCurrentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => setShelfCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                className="edit-shelf-pagination-btn"
                onClick={() =>
                  setShelfCurrentPage(
                    Math.min(totalShelfPages, shelfCurrentPage + 1)
                  )
                }
                disabled={shelfCurrentPage === totalShelfPages}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions Panel */}
      {pendingActions.length > 0 && (
        <div className="edit-shelf-pending-panel">
          <h3 className="edit-shelf-pending-title">
            Pending Changes ({pendingActions.length})
          </h3>
          <div className="edit-shelf-pending-actions">
            {pendingActions.map((action) => (
              <div key={action.id} className="edit-shelf-pending-item">
                <div className="edit-shelf-action-info">
                  {action.type === "move" ? (
                    <span className="edit-shelf-action-text">
                      Move {action.quantity} units to {action.targetShelf}{" "}
                      (Section {action.targetSection} - Slot {action.targetSlot}
                      )
                    </span>
                  ) : (
                    <span className="edit-shelf-action-text">
                      Remove {action.quantity} units from {action.sourceShelf}{" "}
                      (Section {action.sourceSection} - Slot {action.sourceSlot}
                      )
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveAction(action.id)}
                  className="edit-shelf-remove-action-btn"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditShelfProduct;
