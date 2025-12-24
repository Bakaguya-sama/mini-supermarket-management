import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaEye,
  FaFileInvoiceDollar,
  FaCalendarAlt,
} from "react-icons/fa";
import "./InvoiceListView.css";
import { invoiceService } from "../../../services/invoiceService";

const InvoiceListView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status"); // Changed to "All Status" for initial load
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Data from API
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    completedInvoices: 0,
    totalRefunded: 0,
    unpaidAmount: 0
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  // ========== API FUNCTIONS ==========
  
  // Load invoices from API
  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      // Build query params based on filters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: '-invoice_date'
      };

      // Add filters
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Map UI status to API payment_status
      if (statusFilter && statusFilter !== 'All Status') {
        const statusMap = {
          'Pending': 'unpaid',
          'Completed': 'paid',
          'Refunded': 'refunded'
        };
        params.payment_status = statusMap[statusFilter] || statusFilter.toLowerCase();
      }

      // Add payment method filter (future backend support)
      // Note: Backend API doesn't support payment_method filter yet
      // This is prepared for future implementation
      if (paymentMethodFilter && paymentMethodFilter !== 'All Methods') {
        params.payment_method = paymentMethodFilter;
      }

      if (selectedDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }

      const response = await invoiceService.getAllInvoices(params);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        // Transform API data to UI format
        const transformedInvoices = response.data.map(invoice => {
          const invoiceDate = new Date(invoice.invoice_date);
          const itemCount = invoice.items?.length || 0;
          
          // Get customer name
          const customerName = invoice.customer_id?.account_id?.full_name || 'Guest';
          const customerInitials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          
          // Map payment_status to UI status
          const statusMap = {
            'unpaid': 'Pending',
            'paid': 'Completed',
            'partial': 'Pending',
            'refunded': 'Refunded'
          };

          return {
            id: invoice.invoice_number,
            _id: invoice._id,
            txnNumber: `TXN${invoice._id.slice(-6)}`,
            date: invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: invoiceDate.toLocaleTimeString('en-US', { hour12: false }),
            customer: customerName,
            customerInitials: customerInitials,
            customerId: invoice.customer_id?._id,
            hasCustomerInfo: !!invoice.customer_id,
            staff: 'Staff A', // TODO: Get from order/staff data
            items: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
            itemsList: invoice.notes || 'Invoice items',
            amount: `$${invoice.total_amount.toFixed(2)}`,
            paymentMethod: invoice.payment_method || invoice.order_id?.payment_method || 'Cash', // Get from invoice first, fallback to order
            status: statusMap[invoice.payment_status] || 'Pending',
            rawStatus: invoice.payment_status,
            rawAmount: invoice.total_amount
          };
        });

        setInvoices(transformedInvoices);
        setTotalRecords(response.total || 0);
        setTotalPages(response.pages || 0);
      } else {
        console.error('Failed to load invoices:', response.message || 'No data in response');
        setInvoices([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Load statistics from API
  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await invoiceService.getInvoiceStats();
      
      if (response.success && response.data) {
        const statsData = response.data;
        
        // Count completed invoices from byStatus array - safely check if exists
        const byStatus = Array.isArray(statsData.byStatus) ? statsData.byStatus : [];
        const completedCount = byStatus.find(s => s._id === 'paid')?.count || 0;
        const unpaidCount = byStatus.find(s => s._id === 'unpaid')?.count || 0;
        const refundedCount = byStatus.find(s => s._id === 'refunded')?.count || 0;

        setStats({
          totalRevenue: statsData.totalAmount || 0,
          totalInvoices: statsData.totalInvoices || 0,
          completedInvoices: completedCount,
          unpaidAmount: statsData.unpaidAmount || 0,
          totalRefunded: 0 // TODO: Calculate from refunded invoices
        });
      } else {
        console.error('Failed to load stats:', response.message);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadInvoices();
  }, [currentPage, searchTerm, statusFilter, selectedDate]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Update page when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchTerm, statusFilter, selectedDate, paymentMethodFilter]);

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

  // Calculate pagination info
  const totalItems = totalRecords;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="invoice-report-view">
      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <div>Loading invoices...</div>
          </div>
        </div>
      )}

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
                ${isLoadingStats ? '...' : stats.totalRevenue.toFixed(2)}
              </div>
              <div className="invoice-stat-sublabel">
                {isLoadingStats ? '...' : `+${stats.completedInvoices} completed`}
              </div>
            </div>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-icon invoice-stat-invoices">📋</div>
            <div className="invoice-stat-content">
              <div className="invoice-stat-label">Total Invoices</div>
              <div className="invoice-stat-number">
                {isLoadingStats ? '...' : stats.totalInvoices}
              </div>
              <div className="invoice-stat-sublabel">invoices</div>
            </div>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-icon invoice-stat-completed">✓</div>
            <div className="invoice-stat-content">
              <div className="invoice-stat-label">Completed</div>
              <div className="invoice-stat-number">
                {isLoadingStats ? '...' : `${stats.completedInvoices}/${stats.totalInvoices}`}
              </div>
              <div className="invoice-stat-sublabel">transactions</div>
            </div>
          </div>

          <div className="invoice-stat-card">
            <div className="invoice-stat-icon invoice-stat-refunded">↩️</div>
            <div className="invoice-stat-content">
              <div className="invoice-stat-label">Unpaid Amount</div>
              <div className="invoice-stat-number">
                ${isLoadingStats ? '...' : stats.unpaidAmount.toFixed(2)}
              </div>
              <div className="invoice-stat-sublabel">pending payment</div>
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
            {invoices.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                  <div>No invoices found</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Try adjusting your filters
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice, index) => (
                <tr key={`page-${currentPage}-${invoice._id || invoice.id}-${index}`}>
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
                      <div className="invoice-refund-note">Refunded</div>
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
                      onClick={() => handleView(invoice._id)}
                      title="View Details"
                    >
                      View <span className="invoice-arrow">›</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
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
