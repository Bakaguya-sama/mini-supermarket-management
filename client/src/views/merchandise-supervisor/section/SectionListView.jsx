import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaLayerGroup,
  FaBoxes,
} from "react-icons/fa";
import ConfirmationMessage from "../../../components/Messages/ConfirmationMessage";
import "./SectionListView.css";
import sectionService from "../../../services/sectionService";

const SectionListView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stats, setStats] = useState({
    totalSections: 0,
    totalShelves: 0,
  });

  // Load sections on component mount
  const loadSections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await sectionService.getAll({
        limit: 100,
        page: 1,
      });

      console.log("🔍 Section response:", response);

      if (response.success && response.data) {
        console.log("✅ Setting sections:", response.data);
        setSections(response.data);
        calculateStats(response.data);
      } else {
        console.warn("❌ Response not successful:", response);
        setError("Failed to load sections");
      }
    } catch (error) {
      console.error("Error loading sections:", error);
      setError(error.message || "Failed to load sections");
      setSections([]);
      calculateStats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const calculateStats = (sectionList) => {
    try {
      if (!Array.isArray(sectionList)) {
        console.error("sectionList is not an array:", sectionList);
        throw new Error("Invalid section list format");
      }

      if (sectionList.length === 0) {
        setStats({
          totalSections: 0,
          totalShelves: 0,
        });
        return;
      }

      const totalSections = sectionList.length;
      const totalShelves = sectionList.reduce((sum, section) => {
        return sum + (section.shelf_count || 0);
      }, 0);

      console.log("✅ Stats calculated:", {
        totalSections,
        totalShelves,
      });

      setStats({
        totalSections,
        totalShelves,
      });
    } catch (error) {
      console.error("❌ Error calculating stats:", error);
      setStats({
        totalSections: 0,
        totalShelves: 0,
      });
    }
  };

  // Pagination logic
  const itemsPerPage = 10;

  // Filter and search logic
  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.section_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.note?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSections = filteredSections.slice(startIndex, endIndex);

  // Event handlers
  const handleAddSection = () => {
    navigate("/sections/add");
  };

  const handleEdit = (sectionId) => {
    navigate(`/sections/edit/${sectionId}`);
  };

  const handleDelete = (section) => {
    setConfirmDelete(section);
  };

  const confirmDeleteSection = async () => {
    if (confirmDelete) {
      try {
        const response = await sectionService.delete(confirmDelete._id);
        if (response.success) {
          await loadSections();
        } else {
          setError(response.message || "Failed to delete section");
        }
      } catch (error) {
        console.error("Error deleting section:", error);
        setError(error.message || "Failed to delete section");
      } finally {
        setConfirmDelete(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="section-list-view">
        <div className="section-page-header">
          <h1 className="section-page-title">Section Management</h1>
        </div>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-list-view">
      {/* Header */}
      <div className="section-page-header">
        <h1 className="section-page-title">Section Management</h1>
      </div>

      {error && <div className="section-error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="section-stats-section">
        <div className="section-stats-grid">
          <div className="section-stat-card">
            <div className="section-stat-icon total">
              <FaLayerGroup />
            </div>
            <div className="section-stat-content">
              <div className="section-stat-number">{stats.totalSections}</div>
              <div className="section-stat-label">Total Sections</div>
            </div>
          </div>

          <div className="section-stat-card">
            <div className="section-stat-icon shelves">
              <FaBoxes />
            </div>
            <div className="section-stat-content">
              <div className="section-stat-number">{stats.totalShelves}</div>
              <div className="section-stat-label">Total Shelves</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="sectionlist-filters-section">
        <div className="sectionlist-left-filters">
          <div className="sectionlist-search-container">
            <FaSearch className="sectionlist-search-icon" />
            <input
              type="text"
              placeholder="Search sections"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sectionlist-search-input"
            />
          </div>
        </div>

        <div className="sectionlist-right-actions">
          <button onClick={handleAddSection} className="sectionlist-add-btn">
            <FaPlus />
            Add Section
          </button>
        </div>
      </div>

      {/* Sections Table */}
      <div className="section-table-container">
        <table className="section-table">
          <thead>
            <tr>
              <th>Section ID</th>
              <th>Name</th>
              <th>Number of Shelves</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSections.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No sections found
                </td>
              </tr>
            ) : (
              currentSections.map((section) => {
                return (
                  <tr
                    key={section._id}
                    style={{
                      textDecoration: section.isDelete
                        ? "line-through"
                        : "none",
                      opacity: section.isDelete ? 0.6 : 1,
                    }}
                  >
                    <td className="section-id-cell">{section._id}</td>
                    <td className="section-name-cell">
                      {section.section_name}
                    </td>
                    <td>
                      <div className="section-shelf-count">
                        {section.shelf_count || 0}
                      </div>
                    </td>
                    <td className="section-note-cell">{section.note || "-"}</td>
                    <td>
                      <div className="section-action-buttons">
                        <button
                          className="section-action-btn section-edit-btn"
                          onClick={() => handleEdit(section._id)}
                          title={
                            section.isDelete
                              ? "Cannot edit deleted item"
                              : "Edit Section"
                          }
                          disabled={section.isDelete}
                          style={{
                            opacity: section.isDelete ? 0.5 : 1,
                            cursor: section.isDelete
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          <FaEdit />
                        </button>
                        {/* <button
                          className="section-action-btn section-delete-btn"
                          onClick={() => handleDelete(section)}
                          title={
                            section.isDelete
                              ? "Already deleted"
                              : "Delete Section"
                          }
                          disabled={section.isDelete}
                          style={{
                            opacity: section.isDelete ? 0.5 : 1,
                            cursor: section.isDelete
                              ? "not-allowed"
                              : "pointer",
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
      <div className="section-pagination-section">
        <div className="section-pagination-info">
          Showing {filteredSections.length > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, filteredSections.length)} of{" "}
          {filteredSections.length}
        </div>
        <div className="section-pagination-controls">
          <button
            className="section-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="section-page-numbers">
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
                  className={`section-page-number ${
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
            className="section-pagination-btn"
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
          title="Delete Section"
          message={`Are you sure you want to delete section "${confirmDelete.section_name}"? This action cannot be undone.`}
          onConfirm={confirmDeleteSection}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default SectionListView;
