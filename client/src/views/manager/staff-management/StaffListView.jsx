import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import StaffModal from "../../../components/StaffModal/StaffModal";
import DeleteConfirmationModal from "../../../components/StaffModal/DeleteConfirmationModal";
import staffService from "../../../services/staffService";
import { useNotification } from "../../../hooks/useNotification";
import "./StaffListView.css";

const StaffListView = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // State for data
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All positions");
  const [monthFilter, setMonthFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const itemsPerPage = 10;

  // Fetch staff data from API
  useEffect(() => {
    fetchStaffData();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchStaffData = async () => {
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
      
      // Add position filter if not "All positions"
      if (statusFilter !== "All positions") {
        params.position = statusFilter;
      }

      const response = await staffService.getAll(params);
      
      if (response.success) {
        setStaffData(response.data || []);
      } else {
        setError(response.message || "Failed to fetch staff");
        showError("Error", response.message || "Failed to fetch staff");
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
      const errorMessage = err.message || "Failed to fetch staff";
      setError(errorMessage);
      showError("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter data client-side for status filter
  const filteredData = staffData.filter((staff) => {
    const matchesStatus =
      monthFilter === "All Status" || staff.isActive === (monthFilter === "Active");
    return matchesStatus;
  });

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, monthFilter]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleMonthFilterChange = (month) => {
    setMonthFilter(month);
  };

  const handleAddStaff = () => {
    navigate("/staff/add");
  };

  const handleEdit = (staffId) => {
    navigate(`/staff/edit/${staffId}`);
  };

  const handleDelete = (staffId) => {
    const staff = staffData.find((s) => s._id === staffId);
    if (staff) {
      setStaffToDelete(staff);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (staffToDelete) {
      try {
        setLoading(true);
        await staffService.delete(staffToDelete._id);
        showSuccess("Success", "Staff deleted successfully");
        // Refresh staff list
        await fetchStaffData();
        setStaffToDelete(null);
        setIsDeleteModalOpen(false);
      } catch (err) {
        showError("Error", err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setStaffToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleView = (staffId) => {
    const staff = staffData.find((s) => s._id === staffId);
    if (staff) {
      setSelectedStaff(staff);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "status-approved";
      case "Inactive":
        return "status-declined";
      default:
        return "status-default";
    }
  };

  return (
    <div className="staff-report-view">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Staffs</h1>
      </div>

      {/* Filters and Actions */}
      <div className="filters-section">
        <div className="left-filters">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search staff"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="dropdown">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="All positions">All positions</option>
              <option value="Store manager">Store manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Stock Manager">Stock Manager</option>
              <option value="Security">Security</option>
              <option value="Cleaner">Cleaner</option>
            </select>
          </div>

          <div className="dropdown">
            <select
              value={monthFilter}
              onChange={(e) => handleMonthFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button className="add-staff-btn" onClick={handleAddStaff}>
          <FaPlus className="add-icon" />
          Add Staff
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Staff Name</th>
              <th>Contact</th>
              <th>Position</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  Loading staff data...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "red" }}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && paginatedData.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No staff found
                </td>
              </tr>
            )}
            {paginatedData.map((staff, index) => (
              <tr key={`page-${currentPage}-${staff._id}-${index}`}>
                <td className="staff-id">{staff._id?.slice(-6) || staff.id}</td>
                <td className="staff-info">
                  <div className="staff-name">{staff.fullName || staff.name}</div>
                  <div className="staff-join-date">Joined {new Date(staff.joinDate).toLocaleDateString()}</div>
                </td>
                <td className="staff-contact">
                  <div className="staff-email">{staff.email}</div>
                  <div className="staff-phone">{staff.phone}</div>
                </td>
                <td className="staff-position">{staff.position}</td>
                <td>
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      staff.isActive ? "Active" : "Inactive"
                    )}`}
                  >
                    {staff.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="action-buttons">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleView(staff._id)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(staff._id)}
                    title="Edit Staff"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(staff._id)}
                    title="Delete Staff"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="staff-pagination-section">
        <div className="staff-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="staff-pagination-controls">
          <button
            className="staff-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="staff-page-numbers">
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
                  className={`staff-page-number ${
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
            className="staff-pagination-btn"
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

      {/* Staff Details Modal */}
      <StaffModal
        staff={selectedStaff}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        staffName={staffToDelete?.name}
      />
    </div>
  );
};

export default StaffListView;
