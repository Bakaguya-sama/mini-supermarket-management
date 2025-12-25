import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBox,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { TbBoxOff } from "react-icons/tb";
import ConfirmationMessage from "../../../components/Messages/ConfirmationMessage";
import "./ShelfListView.css";
import shelfService from "../../../services/shelfService";
import mockShelves from "../../../data/mockShelves";

const ShelfListView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [sectionFilter, setSectionFilter] = useState("All sections");
  const [sections, setSections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [shelves, setShelves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({
    totalShelves: 0,
    emptyShelves: 0,
    occupiedShelves: 0,
    fullShelves: 0,
  });

  // Load shelves on component mount

  // Get shelf status based on isfull flag
  const getShelfStatus = useCallback((shelf) => {
    if (!shelf) return "Empty";

    // If isfull is true, the shelf is full
    if (shelf.isfull === true) {
      return "Full";
    }

    // If the shelf has a capacity and current_capacity
    if (shelf.current_capacity !== undefined && shelf.capacity !== undefined) {
      if (shelf.current_capacity === 0) {
        return "Empty";
      } else if (shelf.current_capacity >= shelf.capacity) {
        return "Full";
      } else {
        return "Occupied";
      }
    }

    // Default to Empty if we can't determine
    return "Empty";
  }, []);

  const calculateStats = useCallback(
    (shelfList) => {
      try {
        if (!Array.isArray(shelfList)) {
          console.error("shelfList is not an array:", shelfList);
          throw new Error("Invalid shelf list format");
        }

        if (shelfList.length === 0) {
          setStats({
            totalShelves: 0,
            emptyShelves: 0,
            occupiedShelves: 0,
            fullShelves: 0,
          });
          return;
        }

        const totalShelves = shelfList.length;

        const emptyShelves = shelfList.filter((shelf) => {
          if (!shelf) return false;
          return getShelfStatus(shelf) === "Empty";
        }).length;

        const occupiedShelves = shelfList.filter((shelf) => {
          if (!shelf) return false;
          return getShelfStatus(shelf) === "Occupied";
        }).length;

        const fullShelves = shelfList.filter((shelf) => {
          if (!shelf) return false;
          return getShelfStatus(shelf) === "Full";
        }).length;

        console.log("✅ Stats calculated:", {
          totalShelves,
          emptyShelves,
          occupiedShelves,
          fullShelves,
        });

        setStats({
          totalShelves,
          emptyShelves,
          occupiedShelves,
          fullShelves,
        });
      } catch (error) {
        console.error("❌ Error calculating stats:", error);
        setStats({
          totalShelves: 0,
          emptyShelves: 0,
          occupiedShelves: 0,
          fullShelves: 0,
        });
      }
    },
    [getShelfStatus]
  );

  const loadSections = useCallback(async () => {
    try {
      const sectionService = (await import("../../../services/sectionService"))
        .default;
      const response = await sectionService.getAll();
      if (response.success && response.data) {
        setSections(response.data);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  }, []);

  const loadShelves = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Uncomment this to use mock data instead of API
      // setShelves(mockShelves);
      // calculateStats(mockShelves);
      // setIsLoading(false);
      // return;

      const response = await shelfService.getAll({
        limit: 100,
        page: 1,
      });

      console.log("🔍 Shelf response:", response);

      if (response.success && response.data) {
        console.log("✅ Setting shelves:", response.data);
        setShelves(response.data);
        calculateStats(response.data);
      } else {
        console.warn("❌ Response not successful:", response);
        setError("Failed to load shelves");
      }
    } catch (error) {
      console.error("Error loading shelves:", error);
      // Use mock data as fallback when API fails
      console.log("📦 Using mock data as fallback");
      setShelves(mockShelves);
      calculateStats(mockShelves);
      setError(null); // Clear error when using mock data
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    loadShelves();
    loadSections();
  }, [loadShelves, loadSections]);

  // Pagination logic
  const itemsPerPage = 10;

  // Filter and search logic
  const filteredShelves = shelves.filter((shelf) => {
    const matchesSearch =
      shelf.shelf_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelf.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelf.note?.toLowerCase().includes(searchTerm.toLowerCase());

    const shelfStatus = getShelfStatus(shelf);
    const matchesStatus =
      statusFilter === "All status" || shelfStatus === statusFilter;

    const matchesSection =
      sectionFilter === "All sections" ||
      (shelf.section && shelf.section._id === sectionFilter);

    return matchesSearch && matchesStatus && matchesSection;
  });

  const totalPages = Math.ceil(filteredShelves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentShelves = filteredShelves.slice(startIndex, endIndex);

  // Event handlers
  const handleAddShelf = () => {
    navigate("/shelves/add");
  };

  const handleEdit = (shelfId) => {
    navigate(`/shelves/edit/${shelfId}`);
  };

  const handleDelete = (shelf) => {
    setConfirmDelete(shelf);
  };

  const confirmDeleteShelf = async () => {
    if (confirmDelete) {
      try {
        const response = await shelfService.delete(confirmDelete._id);
        if (response.success) {
          await loadShelves();
        } else {
          setError(response.message || "Failed to delete shelf");
        }
      } catch (error) {
        console.error("Error deleting shelf:", error);
        setError(error.message || "Failed to delete shelf");
      } finally {
        setConfirmDelete(null);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Full":
        return "shelf-status-full";
      case "Occupied":
        return "shelf-status-occupied";
      case "Empty":
        return "shelf-status-empty";
      default:
        return "shelf-status-default";
    }
  };

  if (isLoading) {
    return (
      <div className="shelf-list-view">
        <div className="shelf-page-header">
          <h1 className="shelf-page-title">Shelf Management</h1>
        </div>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading shelves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shelf-list-view">
      {/* Header */}
      <div className="shelf-page-header">
        <h1 className="shelf-page-title">Shelf Management</h1>
      </div>
      {error && <div className="shelf-error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="shelf-stats-section">
        <div className="shelf-stats-grid">
          <div className="shelf-stat-card">
            <div className="shelf-stat-icon total">
              <FaBox />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">{stats.totalShelves}</div>
              <div className="shelf-stat-label">Total Shelves</div>
            </div>
          </div>

          <div className="shelf-stat-card">
            <div className="shelf-stat-icon empty">
              <TbBoxOff />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">{stats.emptyShelves}</div>
              <div className="shelf-stat-label">Empty</div>
            </div>
          </div>

          <div className="shelf-stat-card">
            <div className="shelf-stat-icon occupied">
              <FaExclamationCircle />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">{stats.occupiedShelves}</div>
              <div className="shelf-stat-label">Occupied</div>
            </div>
          </div>

          <div className="shelf-stat-card">
            <div className="shelf-stat-icon full">
              <FaCheckCircle />
            </div>
            <div className="shelf-stat-content">
              <div className="shelf-stat-number">{stats.fullShelves}</div>
              <div className="shelf-stat-label">Full</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="shelflist-filters-section">
        <div className="shelflist-left-filters">
          <div className="shelflist-search-container">
            <FaSearch className="shelflist-search-icon" />
            <input
              type="text"
              placeholder="Search shelves"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shelflist-search-input"
            />
          </div>

          <div className="shelflist-dropdown">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="shelflist-filter-select"
            >
              <option value="All status">All status</option>
              <option value="Empty">Empty</option>
              <option value="Occupied">Occupied</option>
              <option value="Full">Full</option>
            </select>
          </div>

          <div className="shelflist-dropdown">
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="shelflist-filter-select"
            >
              <option value="All sections">All sections</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.section_name || section.name || section._id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="shelflist-right-actions">
          <button onClick={handleAddShelf} className="shelflist-add-btn">
            <FaPlus />
            Add Shelf
          </button>
        </div>
      </div>

      {/* Shelves Table */}
      <div className="shelf-table-container">
        <table className="shelf-table">
          <thead>
            <tr>
              <th>Shelf ID</th>
              <th>Shelf</th>
              <th>Section</th>
              <th>Category</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentShelves.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No shelves found
                </td>
              </tr>
            ) : (
              currentShelves.map((shelf) => {
                const status = getShelfStatus(shelf);
                return (
                  <tr
                    key={shelf._id}
                    style={{
                      textDecoration: shelf.isDelete ? "line-through" : "none",
                      opacity: shelf.isDelete ? 0.6 : 1,
                    }}
                  >
                    <td className="shelf-id-cell">{shelf._id}</td>
                    <td className="shelf-name-cell">{shelf.shelf_number}</td>
                    <td>
                      {shelf.section
                        ? shelf.section.section_name ||
                          shelf.section.name ||
                          shelf.section._id
                        : "-"}
                    </td>
                    <td>{shelf.category || "N/A"}</td>
                    <td>
                      <div className="shelf-capacity-info">
                        <div className="shelf-capacity-number">
                          {shelf.current_capacity || 0} / {shelf.capacity || 0}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`shelf-status-badge ${getStatusBadgeClass(
                          status
                        )}`}
                      >
                        {shelf.isDelete ? "DELETED" : status}
                      </span>
                    </td>
                    <td className="shelf-note-cell">{shelf.note || "-"}</td>
                    <td>
                      <div className="shelf-action-buttons">
                        <button
                          className="shelf-action-btn shelf-edit-btn"
                          onClick={() => handleEdit(shelf._id)}
                          title={
                            shelf.isDelete
                              ? "Cannot edit deleted item"
                              : "Edit Shelf"
                          }
                          disabled={shelf.isDelete}
                          style={{
                            opacity: shelf.isDelete ? 0.5 : 1,
                            cursor: shelf.isDelete ? "not-allowed" : "pointer",
                          }}
                        >
                          <FaEdit />
                        </button>
                        {/* <button
                          className="shelf-action-btn shelf-delete-btn"
                          onClick={() => handleDelete(shelf)}
                          title={
                            shelf.isDelete ? "Already deleted" : "Delete Shelf"
                          }
                          disabled={shelf.isDelete}
                          style={{
                            opacity: shelf.isDelete ? 0.5 : 1,
                            cursor: shelf.isDelete ? "not-allowed" : "pointer",
                          }}
                        >
                          <FaTrash />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="shelf-pagination-section">
        <div className="shelf-pagination-info">
          Showing {filteredShelves.length > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, filteredShelves.length)} of{" "}
          {filteredShelves.length}
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
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            title="Next page"
          >
            ›
          </button>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmationMessage
          title="Delete Shelf"
          message={`Are you sure you want to delete shelf "${confirmDelete.shelf_number}"? This action cannot be undone.`}
          onConfirm={confirmDeleteShelf}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default ShelfListView;
