import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEye,
  FaFileInvoiceDollar,
  FaCalendarAlt,
} from "react-icons/fa";
import invoiceService from "../../../services/invoiceService";
import { useNotification } from "../../../hooks/useNotification";
import "./InvoiceListView.css";

const InvoiceListView = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [invoiceData, setInvoiceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAll();
      if (response.success && response.data) {
        const invoices = Array.isArray(response.data) ? response.data : response.data.data || [];
        setInvoiceData(
          invoices.map((invoice) => ({
            id: invoice._id,
            invoiceNumber: invoice.invoiceNumber || invoice._id,
            customerId: invoice.customerId || null,
            customer: invoice.customerName || "Guest",
            customerInitials: (
              invoice.customerName || "Guest"
            ).substring(0, 2).toUpperCase(),
            amount: `$${parseFloat(invoice.totalAmount || 0).toFixed(2)}`,
            paymentStatus: invoice.paymentStatus || "Pending",
            invoiceDate: new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString(),
            createdAt: invoice.createdAt,
          }))
        );
      }
    } catch (error) {
      showError("Error", "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 10;

  // Calculate stats for header cards  // Calculate stats for header cards
  const totalRevenue = invoiceData
    .filter((invoice) => invoice.status === "Completed")
    .reduce(
      (sum, invoice) => sum + parseFloat(invoice.amount.replace("$", "")),
      0
    );

  const totalInvoices = invoiceData.length;
  const completedInvoices = invoiceData.filter(
    (inv) => inv.status === "Completed"
  ).length;
  const totalRefunded = invoiceData
    .filter((invoice) => invoice.status === "Refunded")
    .reduce(
      (sum, invoice) => sum + parseFloat(invoice.amount.replace("$", "")),
      0
    );

  // Filter data first
  const filteredData = invoiceData.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.itemsList.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPaymentMethod =
      paymentMethodFilter === "All Methods" ||
      invoice.paymentMethod === paymentMethodFilter;
    const matchesStatus =
      statusFilter === "All Status" || invoice.status === statusFilter;

    // Date filtering logic
    const matchesDate =
      selectedDate === "" ||
      (() => {
        // Convert invoice date from "Nov 11, 2025" format to comparable date
        const invoiceDate = new Date(invoice.date);
        const selectedDateObj = new Date(selectedDate);

        // Compare only the date part (ignore time)
        return invoiceDate.toDateString() === selectedDateObj.toDateString();
      })();

    return (
      matchesSearch && matchesPaymentMethod && matchesStatus && matchesDate
    );
  });

  // Calculate pagination based on filtered data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentMethodFilter, statusFilter, selectedDate]);

  const handlePaymentMethodFilterChange = (method) => {
    setPaymentMethodFilter(method);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleView = (invoiceId) => {
    // Navigate to InvoiceDetail with the invoice ID
    navigate(`/invoice/detail/${invoiceId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "invoice-status-completed";
      case "Pending":
        return "invoice-status-pending";
      case "Refunded":
        return "invoice-status-refunded";
      default:
        return "invoice-status-default";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "Card":
        return "💳";
      case "Cash":
        return "💰";
      case "E-Wallet":
        return "📱";
      default:
        return "💳";
    }
  };

  return (
    <div className="invoice-report-view">
      {/* Header */}
      <div className="invoice-page-header">
        <h1 className="invoice-page-title">Invoices</h1>
      </div>

      {/* Stats Cards */}
      <div className="invoice-stats-section">
        <div className="invoice-stats-grid">
          <div className="invoice-stat-card">
            <div className="invoice-stat-icon invoice-stat-revenue">$</div>
            <div className="invoice-stat-content">
              <div className="invoice-stat-label">Total Revenue</div>
              <div className="invoice-stat-number">
                ${totalRevenue.toFixed(2)}
              </div>
              <div className="invoice-stat-sublabel">+6 completed</div>
            </div>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-icon invoice-stat-invoices">📋</div>
            <div className="invoice-stat-content">
              <div className="invoice-stat-label">Total Invoices</div>
              <div className="invoice-stat-number">{totalInvoices}</div>
              <div className="invoice-stat-sublabel">invoices</div>
            </div>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-icon invoice-stat-completed">✓</div>
            <div className="invoice-stat-content">
              <div className="invoice-stat-label">Completed</div>
              <div className="invoice-stat-number">
                {completedInvoices}/{totalInvoices}
              </div>
              <div className="invoice-stat-sublabel">transactions</div>
            </div>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-icon invoice-stat-refunded">↩️</div>
            <div className="invoice-stat-content">
              <div className="invoice-stat-label">Total Refunded</div>
              <div className="invoice-stat-number">
                ${totalRefunded.toFixed(2)}
              </div>
              <div className="invoice-stat-sublabel">1 refunds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="invoice-filters-section">
        <div className="invoice-left-filters">
          <div className="invoice-search-container">
            <FaSearch className="invoice-search-icon" />
            <input
              type="text"
              placeholder="Search invoice ID, customer name, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="invoice-search-input"
            />
          </div>

          <div className="invoice-dropdown">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="invoice-date-picker"
              title="Select date"
            />
          </div>

          <div className="invoice-dropdown">
            <select
              value={paymentMethodFilter}
              onChange={(e) => handlePaymentMethodFilterChange(e.target.value)}
              className="invoice-filter-select"
            >
              <option value="All Methods">All Methods</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="E-Wallet">E-Wallet</option>
            </select>
          </div>

          <div className="invoice-dropdown">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="invoice-filter-select"
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="invoice-right-actions">
          <button
            className="invoice-create-btn"
            onClick={() => navigate("/invoice/create")}
          >
            Create Invoice
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="invoice-table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date & Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((invoice, index) => (
              <tr key={`page-${currentPage}-${invoice.id}-${index}`}>
                <td className="invoice-id">
                  <div className="invoice-number">{invoice.id}</div>
                  <div className="invoice-txn">{invoice.txnNumber}</div>
                </td>
                <td className="invoice-datetime">
                  <div className="invoice-date">{invoice.date}</div>
                  <div className="invoice-time">{invoice.time}</div>
                </td>
                <td className="invoice-customer">
                  <div className="invoice-customer-info">
                    <div className="invoice-customer-initials">
                      {invoice.customerInitials}
                    </div>
                    <div className="invoice-customer-details">
                      <div className="invoice-customer-name">
                        {invoice.customer}
                      </div>
                      <div className="invoice-staff">{invoice.staff}</div>
                    </div>
                  </div>
                </td>
                <td className="invoice-items">
                  <div className="invoice-item-count">{invoice.items}</div>
                  <div className="invoice-item-list">{invoice.itemsList}</div>
                </td>
                <td className="invoice-amount">
                  <div className="invoice-total">{invoice.amount}</div>
                  {invoice.status === "Refunded" && (
                    <div className="invoice-refund-note">$2.00</div>
                  )}
                </td>
                <td className="invoice-payment">
                  <div className="invoice-payment-method">
                    <span className="invoice-payment-icon">
                      {getPaymentMethodIcon(invoice.paymentMethod)}
                    </span>
                    {invoice.paymentMethod}
                  </div>
                </td>
                <td>
                  <span
                    className={`invoice-status-badge ${getStatusBadgeClass(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="invoice-action-buttons">
                  <button
                    className="invoice-action-btn invoice-view-btn"
                    onClick={() => handleView(invoice.id)}
                    title="View Details"
                  >
                    View <span className="invoice-arrow">›</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="invoice-pagination-section">
        <div className="invoice-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="invoice-pagination-controls">
          <button
            className="invoice-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="invoice-page-numbers">
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
                  className={`invoice-page-number ${
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
            className="invoice-pagination-btn"
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
    </div>
  );
};

export default InvoiceListView;
