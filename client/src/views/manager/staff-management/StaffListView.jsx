import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import StaffModal from "../../../components/StaffModal/StaffModal";
import DeleteConfirmationModal from "../../../components/StaffModal/DeleteConfirmationModal";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import staffService from "../../../services/staffService";
import "./StaffListView.css";

const StaffListView = () => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const itemsPerPage = 10;

  // Load staff data on mount
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const result = await staffService.getAll();

      console.log("Raw result from staffService.getAll():", result);

      // Check if result has data - could be directly an array or wrapped in response object
      let dataArray = [];

      if (Array.isArray(result)) {
        // Result is directly an array
        dataArray = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        // Result is an object with data property
        dataArray = result.data;
      } else if (result && result.success === false) {
        // API returned error
        setErrorMessage(result.message || "Failed to load staff");
        return;
      }

      if (dataArray.length > 0) {
        // Transform API response to match expected format
        const transformedData = dataArray.map((staff) => {
          const account = staff.account_id || {};
          return {
            _id: staff._id,
            id: staff._id,
            name: account.full_name || "N/A",
            email: account.email || "N/A",
            phone: account.phone || "N/A",
            position: staff.position || "N/A",
            joinDate: staff.hire_date
              ? new Date(staff.hire_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            status: staff.is_active ? "ACTIVE" : "INACTIVE",
            is_active: staff.is_active,
            isDelete: staff.isDelete || false,
            address: account.address || "N/A",
            employmentType: staff.employment_type || "N/A",
            salary: staff.annual_salary
              ? `$${staff.annual_salary.toLocaleString()}/year`
              : "N/A",
            avatar: account.avatar_link,
          };
        });
        console.log("Transformed data:", transformedData);
        setStaffData(transformedData);
      } else {
        console.log("No staff data received");
        setStaffData([]);
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      setErrorMessage(error.message || "Error loading staff");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data first
  const filteredData = staffData.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm);
    const matchesPosition =
      positionFilter === "all" ||
      staff.position.toLowerCase() === positionFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      staff.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Calculate pagination based on filtered data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Debug pagination
  console.log(
    `Current Page: ${currentPage}, Start Index: ${startIndex}, End Index: ${endIndex}`
  );
  console.log("Paginated Data:", paginatedData);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, positionFilter, statusFilter]);

  const handleEdit = (staffId) => {
    navigate(`/staff/edit/${staffId}`);
  };

  const handleDelete = async (staffId) => {
    const staff = staffData.find((s) => s.id === staffId);
    if (staff) {
      setStaffToDelete(staff);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (staffToDelete) {
      try {
        const result = await staffService.delete(staffToDelete.id);
        if (result.success || result.data) {
          setSuccessMessage("Staff marked as deleted successfully!");
          // Reload staff data to get updated list with isDelete = true
          await loadStaff();
        } else {
          setErrorMessage(result.message || "Failed to delete staff");
        }
      } catch (error) {
        setErrorMessage(error.message || "Error deleting staff");
      } finally {
        setStaffToDelete(null);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setStaffToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleView = (staffId) => {
    const staff = staffData.find((s) => s.id === staffId);
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
    return status && status.toUpperCase() === "ACTIVE"
      ? "status-approved"
      : "status-declined";
  };

  return (
    <div className="staff-report-view">
      {/* Messages */}
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Staffs</h1>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Loading staff data...</p>
        </div>
      ) : staffData.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "20px", fontWeight: "bold" }}
        >
          <p>No staff data found. Please add staff members.</p>
        </div>
      ) : (
        ""
      )}

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
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All positions</option>
              <option value="delivery">Delivery</option>
              <option value="merchandise">Merchandise</option>
              <option value="warehouse">Warehouse</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>

          <div className="dropdown">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          className="add-staff-btn"
          onClick={() => navigate("/staff/add")}
        >
          <FaPlus className="add-icon" />
          Add Staff
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Staff ID</th>
              <th>Staff Name</th>
              <th>Contact</th>
              <th>Position</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((staff, index) => (
              <tr
                key={`page-${currentPage}-${staff.id}-${index}`}
                style={{
                  textDecoration: staff.isDelete ? "line-through" : "none",
                  opacity: staff.isDelete ? 0.6 : 1,
                }}
              >
                <td className="staff-avatar" style={{ textAlign: "center" }}>
                  {staff.avatar ? (
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#ddd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: "12px",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </td>
                <td className="staff-id">{staff.id}</td>
                <td className="staff-info">
                  <div className="staff-name">{staff.name}</div>
                  <div className="staff-join-date">Joined {staff.joinDate}</div>
                </td>
                <td className="staff-contact">
                  <div className="staff-email">{staff.email}</div>
                  <div className="staff-phone">{staff.phone}</div>
                </td>
                <td className="staff-position">{staff.position}</td>
                <td>
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      staff.status
                    )}`}
                  >
                    {staff.isDelete ? "DELETED" : staff.status}
                  </span>
                </td>
                <td className="action-buttons">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleView(staff.id)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(staff.id)}
                    title={
                      staff.isDelete ? "Cannot edit deleted item" : "Edit Staff"
                    }
                    disabled={staff.isDelete}
                    style={{
                      opacity: staff.isDelete ? 0.5 : 1,
                      cursor: staff.isDelete ? "not-allowed" : "pointer",
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(staff.id)}
                    title={staff.isDelete ? "Already deleted" : "Delete Staff"}
                    disabled={staff.isDelete}
                    style={{
                      opacity: staff.isDelete ? 0.5 : 1,
                      cursor: staff.isDelete ? "not-allowed" : "pointer",
                    }}
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
