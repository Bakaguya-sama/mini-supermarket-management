import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye } from "react-icons/fa";
import "./AssignedOrdersView.css";
import { deliveryOrderService } from "../../../services/deliveryOrderService";
import { staffService } from "../../../services/staffService";

const AssignedOrdersView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Demo staff - TODO: Replace with authenticated user after login
  const [demoStaffId, setDemoStaffId] = useState(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  
  // Data from API
  const [ordersData, setOrdersData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  // ========== API FUNCTIONS ==========
  
  // Fetch demo delivery staff (first staff with position 'Delivery')
  const fetchDemoStaff = async () => {
    try {
      const response = await staffService.getAll({ 
        position: 'Delivery',
        limit: 1,
        is_active: true
      });
      
      if (response.success && response.data && response.data.length > 0) {
        const deliveryStaff = response.data[0];
        console.log('Demo delivery staff:', deliveryStaff);
        setDemoStaffId(deliveryStaff._id);
        return deliveryStaff._id;
      } else {
        console.error('No delivery staff found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching delivery staff:', error);
      return null;
    }
  };
  
  // Load assigned delivery orders from API
  const loadAssignedOrders = async (staffId) => {
    if (!staffId) {
      console.log('No staff ID available, skipping load');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Get orders with status 'assigned' or 'in_transit' for this delivery staff
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: 'assigned', // Only assigned orders
        sort: timeFilter === 'Latest' ? '-order_date' : timeFilter === 'Earliest' ? 'order_date' : '-createdAt'
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await deliveryOrderService.getDeliveriesByStaff(staffId, params);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        // Transform API data to UI format
        const transformedOrders = response.data.map(delivery => {
          const order = delivery.order_id;
          const customer = order?.customer_id;
          const accountInfo = customer?.account_id;
          
          const orderDate = new Date(delivery.order_date);
          const deliveryDate = delivery.delivery_date ? new Date(delivery.delivery_date) : orderDate;
          
          return {
            id: delivery._id,
            orderId: order?.order_number || delivery._id.slice(-6),
            customer: accountInfo?.full_name || 'Guest Customer',
            deliveryDate: deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            address: accountInfo?.address || 'No address provided',
            phone: accountInfo?.phone || 'No phone',
            items: delivery.notes || 'Delivery items',
            totalAmount: order?.total_amount ? `${order.total_amount.toLocaleString()} VND` : '0 VND',
            assignedTime: orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            estimatedDelivery: deliveryDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            dateSort: orderDate,
            trackingNumber: delivery.tracking_number,
            status: delivery.status
          };
        });

        setOrdersData(transformedOrders);
        setTotalRecords(response.total || 0);
        setTotalPages(response.pages || 0);
      } else {
        console.error('Failed to load assigned orders:', response.message);
        setOrdersData([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading assigned orders:', error);
      setOrdersData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch demo staff on mount
  useEffect(() => {
    const initStaff = async () => {
      const staffId = await fetchDemoStaff();
      if (staffId) {
        loadAssignedOrders(staffId);
      }
    };
    initStaff();
  }, []);
  
  // Load orders when filters change (only if we have staffId)
  useEffect(() => {
    if (demoStaffId) {
      loadAssignedOrders(demoStaffId);
    }
  }, [currentPage, timeFilter, searchTerm]);

  // Sample fake data - REMOVE sau khi test API
  const oldOrdersData = [
    {
      id: "001",
      customer: "Nguyen Van A",
      deliveryDate: "Nov 07, 2025",
      address: "123 Le Loi Street, District 1, HCMC",
      phone: "+84 901 234 567",
      items: "Milk, Bread, Eggs",
      totalAmount: "250,000 VND",
      assignedTime: "08:30 AM",
      estimatedDelivery: "10:00 AM",
      dateSort: new Date("2025-11-07"),
    },
    {
      id: "002",
      customer: "Tran Thi B",
      deliveryDate: "Nov 07, 2025",
      address: "456 Nguyen Hue Boulevard, District 1, HCMC",
      phone: "+84 902 345 678",
      items: "Rice, Oil, Sugar",
      totalAmount: "180,000 VND",
      assignedTime: "09:00 AM",
      estimatedDelivery: "10:30 AM",
      dateSort: new Date("2025-11-07"),
    },
    {
      id: "003",
      customer: "Le Van C",
      deliveryDate: "Nov 06, 2025",
      address: "789 Dong Khoi Street, District 1, HCMC",
      phone: "+84 903 456 789",
      items: "Fruits, Vegetables",
      totalAmount: "320,000 VND",
      assignedTime: "07:45 AM",
      estimatedDelivery: "09:15 AM",
      dateSort: new Date("2025-11-06"),
    },
    {
      id: "004",
      customer: "Pham Thi D",
      deliveryDate: "Nov 07, 2025",
      address: "321 Hai Ba Trung Street, District 3, HCMC",
      phone: "+84 904 567 890",
      items: "Meat, Fish, Chicken",
      totalAmount: "450,000 VND",
      assignedTime: "10:15 AM",
      estimatedDelivery: "11:45 AM",
      dateSort: new Date("2025-11-07"),
    },
    {
      id: "005",
      customer: "Ho Van E",
      deliveryDate: "Nov 08, 2025",
      address: "654 Vo Van Tan Street, District 3, HCMC",
      phone: "+84 905 678 901",
      items: "Snacks, Drinks",
      totalAmount: "150,000 VND",
      assignedTime: "08:00 AM",
      estimatedDelivery: "09:30 AM",
      dateSort: new Date("2025-11-08"),
    },
  ]; // End fake data

  // Filter orders based on search term and time
  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sort orders based on time filter
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (timeFilter === "Latest") {
      return b.dateSort - a.dateSort; // Latest first (newest to oldest)
    } else if (timeFilter === "Earliest") {
      return a.dateSort - b.dateSort; // Earliest first (oldest to newest)
    }
    return 0; // No sorting for "All"
  });

  // NOTE: Pagination now handled by API, but keep for client-side filtering
  const clientTotalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalItems = sortedOrders.length;
  const paginatedData = sortedOrders.slice(startIndex, endIndex);

  const handleTimeFilterChange = (time) => {
    setTimeFilter(time);
    setCurrentPage(1);
  };

  return (
    <div className="assigned-orders-view">
      {/* Header */}
      <div className="orders-page-header">
        <h1 className="orders-page-title">Assigned orders</h1>
      </div>

      {/* Filters and Actions */}
      <div className="orders-filters-section">
        <div className="orders-left-filters">
          <div className="orders-search-container">
            <FaSearch className="orders-search-icon" />
            <input
              type="text"
              placeholder="Search orders or customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search-input"
            />
          </div>

          <div className="orders-dropdown">
            <select
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value)}
              className="orders-filter-select"
            >
              <option value="All">All</option>
              <option value="Latest">Latest</option>
              <option value="Earliest">Earliest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="orders-table-container">
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}>
            <div>Loading assigned orders...</div>
          </div>
        )}
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Delivery Date</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && paginatedData.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No assigned orders found
                </td>
              </tr>
            )}
            {paginatedData.map((order, index) => (
              <tr key={`page-${currentPage}-${order.id}-${index}`}>
                <td className="orders-order-id">{order.orderId || order.id}</td>
                <td className="orders-customer-info">
                  <div className="orders-customer-name">{order.customer}</div>
                  <div className="orders-customer-phone">{order.phone}</div>
                </td>
                <td className="orders-delivery-date">{order.deliveryDate}</td>
                <td className="orders-address">
                  <div className="orders-address-text">{order.address}</div>
                </td>
                <td className="orders-action-buttons">
                  <button
                    className="orders-action-btn orders-view-btn"
                    onClick={() => navigate(`/assigned-orders/${order.id}`)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="orders-pagination-section">
        <div className="orders-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="orders-pagination-controls">
          <button
            className="orders-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="orders-page-numbers">
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
                  className={`orders-page-number ${
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
            className="orders-pagination-btn"
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

export default AssignedOrdersView;
