import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import customerService from "../../../services/customerService";
import { useNotification } from "../../../hooks/useNotification";
import CustomerModal from "../../../components/CustomerModal/CustomerModal";
import DeleteCustomerConfirmationModal from "../../../components/CustomerModal/DeleteCustomerConfirmationModal";
import "./CustomerListView.css";

const CustomerListView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("All Memberships");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // API-driven customer data
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomerData();
  }, [currentPage, searchTerm, membershipFilter, statusFilter]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      if (membershipFilter !== "All Memberships") params.membership = membershipFilter;
      if (statusFilter !== "All Status") params.status = statusFilter;
      const response = await customerService.getAll(params);
      if (response.success) {
        setCustomerData(response.data || []);
      } else {
        setError(response.message || "Failed to fetch customers");
        showError("Error", response.message || "Failed to fetch customers");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch customers");
      showError("Error", err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };


  // Filter data client-side for status filter
  const filteredData = customerData.filter((customer) => {
    const matchesStatus =
      statusFilter === "All Status" || customer.isActive === (statusFilter === "Active");
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
  }, [searchTerm, membershipFilter, statusFilter]);

  const handleMembershipFilterChange = (membership) => {
    setMembershipFilter(membership);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleAddCustomer = () => {
    navigate("/customer/add");
  };

  const handleEdit = (customerId) => {
    navigate(`/customer/edit/${customerId}`);
  };

  const handleDelete = (customerId) => {
    const customer = customerData.find((c) => c._id === customerId);
    if (customer) {
      setCustomerToDelete(customer);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      (async () => {
        try {
          setLoading(true);
          await customerService.delete(customerToDelete._id);
          showSuccess("Success", "Customer deleted successfully");
          await fetchCustomerData();
          setCustomerToDelete(null);
          setIsDeleteModalOpen(false);
        } catch (err) {
          showError("Error", err.message || "Failed to delete customer");
        } finally {
          setLoading(false);
        }
      })();
    }
  };

  const handleCancelDelete = () => {
    setCustomerToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleView = (customerId) => {
    const customer = customerData.find((c) => c._id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "customer-status-approved";
      case "Inactive":
        return "customer-status-declined";
      default:
        return "customer-status-default";
    }
  };

  const getMembershipBadgeClass = (membership) => {
    switch (membership) {
      case "Regular":
        return "customer-membership-regular";
      case "Silver":
        return "customer-membership-silver";
      case "Gold":
        return "customer-membership-gold";
      case "Platinum":
        return "customer-membership-platinum";
      default:
        return "customer-membership-default";
    }
  };

  return (
    <div className="customer-list-view">
      {/* Header */}
      <div className="customer-page-header">
        <h1 className="customer-page-title">Customers</h1>
      </div>

      {/* Stats Cards */}
      <div className="customer-stats-section">
        <div className="customer-stats-grid">
          <div className="customer-stat-card">
            <div className="customer-stat-content">
              <div className="customer-stat-label">Total Customers</div>
              <div className="customer-stat-number">{totalCustomers}</div>
              <div className="customer-stat-sublabel-grey ">Active</div>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-content">
              <div className="customer-stat-label">Premium Members</div>
              <div className="customer-stat-number">{premiumMembers}</div>
              <div className="customer-stat-sublabel">Gold & Platinum</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="customer-filters-section">
        <div className="customer-left-filters">
          <div className="customer-search-container">
            <FaSearch className="customer-search-icon" />
            <input
              type="text"
              placeholder="Search customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="customer-search-input"
            />
          </div>

          <div className="customer-dropdown">
            <select
              value={membershipFilter}
              onChange={(e) => handleMembershipFilterChange(e.target.value)}
              className="customer-filter-select"
            >
              <option value="All Memberships">All Memberships</option>
              <option value="Regular">Regular</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>

          <div className="customer-dropdown">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="customer-filter-select"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button className="customer-add-btn" onClick={handleAddCustomer}>
          <FaPlus className="customer-add-icon" />
          Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Contact</th>
              <th>Membership</th>
              <th>Total purchases</th>
              <th>Points</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  Loading customers...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "red" }}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && paginatedData.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No customers found
                </td>
              </tr>
            )}
            {paginatedData.map((customer, index) => (
              <tr key={`page-${currentPage}-${customer._id || customer.id}-${index}`}>
                <td className="customer-id">{(customer._id || customer.id)?.slice?.(-6) || customer.id}</td>
                <td className="customer-info">
                  <div className="customer-name">{customer.fullName || customer.name}</div>
                  <div className="customer-join-date">
                    Member since {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : "-"}
                  </div>
                </td>
                <td className="customer-contact">
                  <div className="customer-email">{customer.email}</div>
                  <div className="customer-phone">{customer.phone}</div>
                </td>
                <td>
                  <span
                    className={`customer-membership-badge ${getMembershipBadgeClass(
                      customer.membership
                    )}`}
                  >
                    {customer.membership}
                  </span>
                </td>
                <td className="customer-purchases">
                  {customer.totalPurchases || "-"}
                </td>
                <td className="customer-points">{customer.points ?? "-"}</td>
                <td>
                  <span
                    className={`customer-status-badge ${getStatusBadgeClass(
                      customer.isActive ? "Active" : "Inactive"
                    )}`}
                  >
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="customer-action-buttons">
                  <button
                    className="customer-action-btn customer-view-btn"
                    onClick={() => handleView(customer._id || customer.id)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="customer-action-btn customer-edit-btn"
                    onClick={() => handleEdit(customer._id || customer.id)}
                    title="Edit Customer"
                  >
                    <FaEdit />
                  </button>
                  <button
                    style={{ display: "none" }}
                    className="customer-action-btn customer-delete-btn"
                    onClick={() => handleDelete(customer._id || customer.id)}
                    title="Delete Customer"
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
      <div className="customer-pagination-section">
        <div className="customer-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="customer-pagination-controls">
          <button
            className="customer-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="customer-page-numbers">
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
                  className={`customer-page-number ${
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
            className="customer-pagination-btn"
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

      {/* Customer Details Modal */}
      <CustomerModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCustomerConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default CustomerListView;
