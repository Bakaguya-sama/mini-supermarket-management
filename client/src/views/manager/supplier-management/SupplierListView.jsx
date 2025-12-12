import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBuilding,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import SupplierModal from "../../../components/SupplierModal/SupplierModal";
import SupplierDeleteConfirmationModal from "../../../components/SupplierModal/SupplierDeleteConfirmationModal";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import "./SupplierListView.css";
import supplierService from "../../../services/supplierService";

const SupplierListView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // Load suppliers on mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await supplierService.getAll({ 
        limit: 100,
        page: 1 
      });
      
      console.log('🔍 Full response:', response);
      console.log('📦 Response data type:', typeof response.data);
      console.log('📦 Response data:', response.data);
      
      if (response.success && response.data) {
        console.log('✅ Setting suppliers:', response.data);
        setSuppliers(response.data);
        calculateStats(response.data);
      } else {
        console.warn('❌ Response not successful:', response);
        setError("Failed to load suppliers");
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
      setError(error.message || "Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (supplierList) => {
    try {
      if (!Array.isArray(supplierList)) {
        console.error('supplierList is not an array:', supplierList);
        throw new Error('Invalid supplier list format');
      }

      if (supplierList.length === 0) {
        setStats({
          totalSuppliers: 0,
          activeSuppliers: 0,
          inactiveSuppliers: 0,
        });
        return;
      }

      const totalSuppliers = supplierList.length;
      
      const activeSuppliers = supplierList.filter((supplier) => {
        if (!supplier) return false;
        return supplier.is_active === true;
      }).length;

      const inactiveSuppliers = supplierList.filter((supplier) => {
        if (!supplier) return false;
        return supplier.is_active === false;
      }).length;

      console.log('✅ Stats calculated:', { totalSuppliers, activeSuppliers, inactiveSuppliers });
      
      setStats({
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
      });
    } catch (error) {
      console.error('❌ Error calculating stats:', error);
      setStats({
        totalSuppliers: 0,
        activeSuppliers: 0,
        inactiveSuppliers: 0,
      });
    }
  };

  // Pagination logic
  const itemsPerPage = 10;
  
  // Filter and search logic
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person_name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "Active") {
      matchesStatus = supplier.is_active === true;
    } else if (statusFilter === "Inactive") {
      matchesStatus = supplier.is_active === false;
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  // Event handlers
  const handleAddSupplier = () => {
    navigate("/suppliers/add");
  };

  const handleEdit = (supplierId) => {
    navigate(`/suppliers/edit/${supplierId}`);
  };

  const handleView = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const response = await supplierService.delete(supplierToDelete._id);
      
      if (response.success) {
        setSuccessMessage(`Supplier "${supplierToDelete.name}" marked as deleted successfully!`);
        setIsDeleteModalOpen(false);
        setSupplierToDelete(null);
        // Reload suppliers to get updated data with isDelete = true
        await loadSuppliers();
      } else {
        setError(response.message || "Failed to delete supplier");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setError(error.message || "Failed to delete supplier");
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSupplierToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="supplier-list-view">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p>Loading suppliers...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="supplier-list-container">
        <div className="supplier-list-loading">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="supplier-list-container">
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <ErrorMessage
        message={error}
        onClose={() => setError("")}
      />

      {/* Header */}
      <div className="supplier-list-header">
        <h1 className="supplier-list-title">Supplier Management</h1>
        <button className="supplier-list-btn-add" onClick={handleAddSupplier}>
          <FaPlus /> Add New Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="supplier-list-stats">
        <div className="supplier-stat-card total">
          <div className="supplier-stat-label">Total Suppliers</div>
          <div className="supplier-stat-value">{stats.totalSuppliers}</div>
        </div>
        <div className="supplier-stat-card active">
          <div className="supplier-stat-label">Active Suppliers</div>
          <div className="supplier-stat-value">{stats.activeSuppliers}</div>
        </div>
        <div className="supplier-stat-card inactive">
          <div className="supplier-stat-label">Inactive Suppliers</div>
          <div className="supplier-stat-value">{stats.inactiveSuppliers}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="supplier-list-filters">
        <div className="supplier-list-search">
          <input
            type="text"
            placeholder="Search suppliers by name, email, or contact..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="supplier-list-filter-status">
          <button 
            className={`supplier-list-filter-btn ${statusFilter === "All Status" ? "active" : ""}`}
            onClick={() => {
              setStatusFilter("All Status");
              setCurrentPage(1);
            }}
          >
            All Status
          </button>
          <button 
            className={`supplier-list-filter-btn ${statusFilter === "Active" ? "active" : ""}`}
            onClick={() => {
              setStatusFilter("Active");
              setCurrentPage(1);
            }}
          >
            Active
          </button>
          <button 
            className={`supplier-list-filter-btn ${statusFilter === "Inactive" ? "active" : ""}`}
            onClick={() => {
              setStatusFilter("Inactive");
              setCurrentPage(1);
            }}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Table */}
      {currentSuppliers.length > 0 ? (
        <>
          <div className="supplier-list-table-wrapper">
            <table className="supplier-list-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Supplier Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSuppliers.map((supplier) => (
                  <tr key={supplier._id} style={{
                    textDecoration: supplier.isDelete ? 'line-through' : 'none',
                    opacity: supplier.isDelete ? 0.6 : 1
                  }}>
                    <td>
                      <img
                        src={supplier.image_link || "https://placehold.co/50"}
                        alt={supplier.name}
                        className="supplier-list-cell-image"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/50";
                        }}
                      />
                    </td>
                    <td>
                      <div className="supplier-list-cell-name">{supplier.name}</div>
                    </td>
                    <td>{supplier.contact_person_name}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.phone}</td>
                    <td>
                      <span
                        className={`supplier-status-badge ${
                          supplier.isDelete ? "deleted" : (supplier.is_active ? "active" : "inactive")
                        }`}
                      >
                        {supplier.isDelete ? "Deleted" : (supplier.is_active ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td>
                      <div className="supplier-list-actions">
                        <button
                          className="supplier-list-btn-action supplier-list-btn-view"
                          onClick={() => handleView(supplier)}
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="supplier-list-btn-action supplier-list-btn-edit"
                          onClick={() => handleEdit(supplier._id)}
                          title={supplier.isDelete ? "Cannot edit deleted item" : "Edit"}
                          disabled={supplier.isDelete}
                          style={{
                            opacity: supplier.isDelete ? 0.5 : 1,
                            cursor: supplier.isDelete ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="supplier-list-btn-action supplier-list-btn-delete"
                          onClick={() => handleDeleteClick(supplier)}
                          title={supplier.isDelete ? "Already deleted" : "Delete"}
                          disabled={supplier.isDelete}
                          style={{
                            opacity: supplier.isDelete ? 0.5 : 1,
                            cursor: supplier.isDelete ? 'not-allowed' : 'pointer'
                          }}
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
          {totalPages > 1 && (
            <div className="supplier-list-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="supplier-list-pagination-btn"
              >
                Previous
              </button>
              <span className="supplier-list-pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="supplier-list-pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="supplier-list-empty">
          <div className="supplier-list-empty-icon">📦</div>
          <h3 className="supplier-list-empty-title">No Suppliers Found</h3>
          <p className="supplier-list-empty-text">
            {searchTerm || statusFilter !== "All Status"
              ? "Try adjusting your filters"
              : "Get started by adding your first supplier"}
          </p>
          <button className="supplier-list-empty-btn" onClick={handleAddSupplier}>
            <FaPlus /> Add New Supplier
          </button>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && selectedSupplier && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSupplier(null);
          }}
        />
      )}

      {isDeleteModalOpen && supplierToDelete && (
        <SupplierDeleteConfirmationModal
          supplier={supplierToDelete}
          isOpen={isDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDeleteModal}
        />
      )}
    </div>
  );
};

export default SupplierListView;
