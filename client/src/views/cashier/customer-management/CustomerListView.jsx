import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { customerService } from "../../../services/customerService";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import CustomerModal from "../../../components/CustomerModal/CustomerModal";
import DeleteCustomerConfirmationModal from "../../../components/CustomerModal/DeleteCustomerConfirmationModal";
import "./CustomerListView.css";

const CustomerListView = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State for data and loading
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers when search term or membership filter changes
  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [searchTerm, membershipFilter, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerService.getAll({
        page: 1,
        limit: 100, // Get all customers for client-side filtering
      });

      if (response.success) {
        console.log("✅ Customers loaded:", response.data);
        setCustomers(response.data || []);
        applyFilters();
      } else {
        setError(response.message || "Failed to fetch customers");
        setCustomers([]);
        setErrorMessage("Failed to load customers: " + response.message);
      }
    } catch (err) {
      console.error("❌ Error fetching customers:", err);
      setError(err.message);
      setErrorMessage("Error loading customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((customer) => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = customer.account_id?.full_name || "";
        const email = customer.account_id?.email || "";
        const phone = customer.account_id?.phone || "";
        const customerId = customer._id || "";

        return (
          fullName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower) ||
          phone.includes(searchLower) ||
          customerId.includes(searchLower)
        );
      });
    }

    // Apply membership filter
    if (membershipFilter !== "All") {
      filtered = filtered.filter(
        (customer) => customer.membership_type === membershipFilter
      );
    }

    setFilteredCustomers(filtered);
  };

  // Placeholder for old customer data - no longer used
  // const customerData = [
  //   // Old mock data removed - now fetching from API
  // ];

  // Calculate stats for header cards - ONLY count active customers (not deleted)
  const activeCustomers = customers.filter((c) => !c.isDelete);
  const totalCustomers = activeCustomers.length;
  const premiumMembers = activeCustomers.filter(
    (c) => c.membership_type === "Gold" || c.membership_type === "Platinum"
  ).length;

  // Filter data first
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredCustomers.slice(startIndex, endIndex);

  const handleMembershipFilterChange = (membership) => {
    setMembershipFilter(membership);
  };

  const handleAddCustomer = () => {
    console.log("Add new customer");
    navigate("/customer/add");
  };

  const handleEdit = (customerId, customer) => {
    if (customer && customer.isDelete) {
      setErrorMessage("Cannot edit deleted customer");
      return;
    }
    console.log("Edit customer:", customerId);
    navigate(`/customer/edit/${customerId}`);
  };

  const handleDelete = (customer) => {
    if (customer.isDelete) {
      setErrorMessage("This customer is already deleted");
      return;
    }
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      setIsDeleting(true);
      const response = await customerService.delete(customerToDelete._id);

      if (response.success) {
        setSuccessMessage("Customer deleted successfully");
        // Refresh the customer list and reset to page 1
        setTimeout(() => {
          setCurrentPage(1); // Reset to page 1 to see deleted customer
          fetchCustomers();
          setCustomerToDelete(null);
          setIsDeleteModalOpen(false);
        }, 500);
      } else {
        setErrorMessage(response.message || "Failed to delete customer");
      }
    } catch (err) {
      console.error("❌ Error deleting customer:", err);
      setErrorMessage("Error deleting customer");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setCustomerToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleView = (customer) => {
    setSelectedCustomer({
      id: customer._id,
      name: customer.account_id?.full_name || "N/A",
      email: customer.account_id?.email || "N/A",
      phone: customer.account_id?.phone || "N/A",
      address: customer.account_id?.address || "N/A",
      membership: customer.membership_type,
      totalPurchases: `₫${customer.total_spent?.toLocaleString() || 0}`,
      loyaltyPoints: customer.points_balance || 0,
      registeredAt: customer.registered_at,
      username: customer.account_id?.username,
      _id: customer._id,
      isDelete: customer.isDelete || false,
    });
    setIsModalOpen(true);
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
      case "Standard":
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="customer-list-view">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-list-view">
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
              <div className="customer-stat-sublabel-grey">Active</div>
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
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="customer-search-input"
            />
          </div>

          <div className="customer-dropdown">
            <select
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
              className="customer-filter-select"
            >
              <option value="All">All Memberships</option>
              <option value="Standard">Standard</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>
        </div>

        <button className="customer-add-btn" onClick={handleAddCustomer}>
          <FaPlus className="customer-add-icon" />
          Add Customer
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ color: "red", padding: "10px", textAlign: "center" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="customer-table-container">
        {paginatedData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No customers found</p>
          </div>
        ) : (
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Membership</th>
                <th>Total Purchases</th>
                <th>Points</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((customer) => (
                <tr
                  key={customer._id}
                  style={{
                    opacity: customer.isDelete ? 0.6 : 1,
                    textDecoration: customer.isDelete ? "line-through" : "none",
                    backgroundColor: customer.isDelete
                      ? "#f5f5f5"
                      : "transparent",
                  }}
                >
                  <td className="customer-id">
                    {customer._id?.substring(0, 8)}
                  </td>
                  <td className="customer-info">
                    <div className="customer-name">
                      {customer.account_id?.full_name || "N/A"}
                    </div>
                    <div className="customer-join-date">
                      Joined {formatDate(customer.registered_at)}
                    </div>
                  </td>
                  <td className="customer-contact">
                    <div className="customer-email">
                      {customer.account_id?.email || "N/A"}
                    </div>
                    <div className="customer-phone">
                      {customer.account_id?.phone || "N/A"}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`customer-membership-badge ${getMembershipBadgeClass(
                        customer.membership_type
                      )}`}
                    >
                      {customer.membership_type}
                    </span>
                  </td>
                  <td className="customer-purchases">
                    ₫{customer.total_spent?.toLocaleString() || 0}
                  </td>
                  <td className="customer-points">
                    {customer.points_balance || 0}
                  </td>
                  <td>{formatDate(customer.registered_at)}</td>
                  <td className="customer-action-buttons">
                    <button
                      className="customer-action-btn customer-view-btn"
                      onClick={() => handleView(customer)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="customer-action-btn customer-edit-btn"
                      onClick={() => handleEdit(customer._id, customer)}
                      title={
                        customer.isDelete
                          ? "Cannot edit deleted customer"
                          : "Edit Customer"
                      }
                      disabled={customer.isDelete}
                      style={{
                        opacity: customer.isDelete ? 0.5 : 1,
                        cursor: customer.isDelete ? "not-allowed" : "pointer",
                      }}
                    >
                      <FaEdit />
                    </button>
                    {/* <button
                      className="customer-action-btn customer-delete-btn"
                      onClick={() => handleDelete(customer)}
                      title={
                        customer.isDelete
                          ? "Already deleted"
                          : "Delete Customer"
                      }
                      disabled={customer.isDelete}
                      style={{
                        opacity: customer.isDelete ? 0.5 : 1,
                        cursor: customer.isDelete ? "not-allowed" : "pointer",
                      }}
                    >
                      <FaTrash />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
      )}

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
        isLoading={isDeleting}
      />

      {/* Message Components */}
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
    </div>
  );
};

export default CustomerListView;
