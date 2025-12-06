import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaShoppingCart,
  FaBuilding,
  FaUsers,
} from "react-icons/fa";
import SupplierModal from "../../../components/SupplierModal/SupplierModal";
import SupplierOrderModal from "../../../components/SupplierModal/SupplierOrderModal";
import SupplierDeleteConfirmationModal from "../../../components/SupplierModal/SupplierDeleteConfirmationModal";
import supplierService from "../../../services/supplierService";
import { useNotification } from "../../../hooks/useNotification";
import "./SupplierListView.css";

const SupplierListView = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  // State for data
  const [supplierData, setSupplierData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for sections and modals
  const [activeSection, setActiveSection] = useState("suppliers");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const itemsPerPage = 10;

  // Fetch supplier data from API
  useEffect(() => {
    fetchSupplierData();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchSupplierData = async () => {
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

      const response = await supplierService.getAll(params);
      
      if (response.success) {
        setSupplierData(response.data || []);
      } else {
        setError(response.message || "Failed to fetch suppliers");
        showError("Error", response.message || "Failed to fetch suppliers");
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      const errorMessage = err.message || "Failed to fetch suppliers";
      setError(errorMessage);
      showError("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter suppliers by search and status
  const filteredSuppliers = (supplierData || []).filter((supplier) => {
    const matchesSearch =
      supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || 
      (statusFilter === "Active" ? supplier.isActive : !supplier.isActive);
    const matchesCategory =
      categoryFilter === "All Categories" ||
      supplier.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination
  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  // Event handlers
  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleAddSupplier = () => {
    navigate("/supplier/add");
  };

  const handleEdit = (supplierId) => {
    navigate(`/supplier/edit/${supplierId}`);
  };

  const handleView = (supplierId) => {
    const supplier = supplierData.find((s) => s._id === supplierId);
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = (supplierId) => {
    setSupplierToDelete(supplierId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await supplierService.delete(supplierToDelete);
      if (response.success) {
        showSuccess("Success", "Supplier deleted successfully!");
        fetchSupplierData();
      } else {
        showError("Error", response.message || "Failed to delete supplier");
      }
    } catch (error) {
      showError("Error", error.message || "Error deleting supplier");
    } finally {
      setShowDeleteModal(false);
      setSupplierToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ textAlign: "center", padding: "20px" }}>Loading suppliers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div style={{ textAlign: "center", padding: "20px", color: "red" }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="supplier-list-container">
      {/* Header */}
      <div className="supplier-header">
        <h1 className="supplier-title">Supplier Management</h1>
      </div>

      {/* Section Toggle */}
      <div className="section-toggle">
        <button
          className={`toggle-btn ${
            activeSection === "suppliers" ? "active" : ""
          }`}
          onClick={() => setActiveSection("suppliers")}
        >
          <FaBuilding className="toggle-icon" />
          Supplier List
        </button>
        <button
          className={`toggle-btn ${activeSection === "orders" ? "active" : ""}`}
          onClick={() => setActiveSection("orders")}
        >
          <FaShoppingCart className="toggle-icon" />
          Order List
        </button>
      </div>

      {activeSection === "suppliers" ? (
        <>
          {/* Filters and Search */}
          <div className="supplier-filters-section">
            <div className="left-filters">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search suppliers"
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="dropdown">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="dropdown">
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilterChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Category 1">Category 1</option>
                  <option value="Category 2">Category 2</option>
                  <option value="Category 3">Category 3</option>
                </select>
              </div>
            </div>

            <div className="right-actions">
              <button onClick={handleAddSupplier} className="add-supplier-btn">
                <FaPlus />
                Add Supplier
              </button>
            </div>
          </div>

          {/* Suppliers Table */}
          <div className="supplier-table-container">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier Name</th>
                  <th>Contact</th>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Last order</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.id}</td>
                    <td className="supplier-name">{supplier.name}</td>
                    <td className="supplier-contact">
                      <div className="contact-info">
                        {supplier.contact.split("\n").map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    </td>
                    <td>{supplier.category}</td>
                    <td>{supplier.orders}</td>
                    <td>{supplier.lastOrder}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          supplier.status
                        )}`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn order-btn"
                          onClick={() => handlePlaceOrder(supplier.id)}
                          title="Place Order"
                        >
                          <FaShoppingCart />
                        </button>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleView(supplier.id)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(supplier.id)}
                          title="Edit Supplier"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(supplier.id)}
                          title="Delete Supplier"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="supplier-pagination-section">
            <div className="supplier-pagination-info">
              Showing {totalItems > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, totalItems)} of {totalItems}
            </div>
            <div className="supplier-pagination-controls">
              <button
                className="supplier-pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                title="Previous page"
              >
                ‹
              </button>

              {/* Page numbers */}
              <div className="supplier-page-numbers">
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
                      className={`supplier-page-number ${
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
                className="supplier-pagination-btn"
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
        </>
      ) : (
        // Order List Section
        <div className="order-list-section">
          {/* Order Statistics */}
          <div className="order-stats-grid">
            <div className="stat-card total">
              <div className="stat-content">
                <div className="stat-number">{orderStats.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
                <div className="stat-sublabel">All time</div>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-content">
                <div className="stat-number">{orderStats.pendingOrders}</div>
                <div className="stat-label">Pending</div>
                <div className="stat-sublabel">Await</div>
              </div>
            </div>

            <div className="stat-card cancelled">
              <div className="stat-content">
                <div className="stat-number">{orderStats.cancelledOrders}</div>
                <div className="stat-label">Cancelled</div>
                <div className="stat-sublabel">Rejected</div>
              </div>
            </div>

            <div className="stat-card delivered">
              <div className="stat-content">
                <div className="stat-number">{orderStats.deliveredOrders}</div>
                <div className="stat-label">Delivered</div>
                <div className="stat-sublabel">Completed</div>
              </div>
            </div>
          </div>

          {/* Order Filters */}
          <div className="order-filters-section">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search orders"
                value={orderSearchTerm}
                onChange={(e) => handleOrderSearchTermChange(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="dropdown">
              <select
                value={orderStatusFilter}
                onChange={(e) => handleOrderStatusFilterChange(e.target.value)}
                className="filter-select"
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Order Date</th>
                  <th>Delivery Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.supplier}</td>
                    <td>{order.orderDate}</td>
                    <td>{order.deliveryDate}</td>
                    <td>
                      {Array.isArray(order.items)
                        ? order.items.length
                        : order.items}
                    </td>
                    <td>{order.amount}</td>
                    <td>
                      <span
                        className={`status-badge ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewOrder(order.id)}
                          title="View Order"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Pagination */}
          <div className="order-pagination-section">
            <div className="order-pagination-info">
              Showing {totalOrderItems > 0 ? orderStartIndex + 1 : 0}-
              {Math.min(orderEndIndex, totalOrderItems)} of {totalOrderItems}
            </div>
            <div className="order-pagination-controls">
              <button
                className="order-pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                title="Previous page"
              >
                ‹
              </button>

              {/* Page numbers */}
              <div className="order-page-numbers">
                {Array.from(
                  { length: Math.min(3, totalOrderPages) },
                  (_, i) => {
                    let pageNum;

                    if (totalOrderPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage === 1) {
                      pageNum = i + 1;
                    } else if (currentPage === totalOrderPages) {
                      pageNum = totalOrderPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`order-page-number ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                className="order-pagination-btn"
                onClick={() =>
                  setCurrentPage(Math.min(totalOrderPages, currentPage + 1))
                }
                disabled={currentPage === totalOrderPages}
                title="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedSupplier && (
        <SupplierModal
          supplier={selectedSupplier}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {isOrderModalOpen && selectedOrder && (
        <SupplierOrderModal
          order={selectedOrder}
          isOpen={isOrderModalOpen}
          onClose={handleCloseOrderModal}
        />
      )}

      {/* Alert Modal */}
      {showAlert && (
        <div className="modal-overlay" onClick={handleCloseAlert}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alert-header">
              <h3>Information</h3>
              <button className="close-btn" onClick={handleCloseAlert}>
                ×
              </button>
            </div>
            <div className="alert-body">
              <p>{alertMessage}</p>
            </div>
            <div className="alert-footer">
              <button className="alert-ok-btn" onClick={handleCloseAlert}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && supplierToDelete && (
        <SupplierDeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default SupplierListView;
