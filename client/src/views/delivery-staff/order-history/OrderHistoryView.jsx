import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye } from "react-icons/fa";
import "./OrderHistoryView.css";
import { deliveryOrderService } from "../../../services/deliveryOrderService";
import { staffService } from "../../../services/staffService";

const OrderHistoryView = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Demo staff - TODO: Replace with authenticated user after login
  const [demoStaffId, setDemoStaffId] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Data from API
  const [historyData, setHistoryData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  // ========== API FUNCTIONS ==========

  // Fetch demo delivery staff (first staff with position 'Delivery')
  const fetchDemoStaff = async () => {
    try {
      const response = await staffService.getAll({
        position: "Delivery",
        limit: 1,
        is_active: true,
      });

      if (response.success && response.data && response.data.length > 0) {
        const deliveryStaff = response.data[0];
        console.log("Demo delivery staff:", deliveryStaff);
        setDemoStaffId(deliveryStaff._id);
        return deliveryStaff._id;
      } else {
        console.error("No delivery staff found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching delivery staff:", error);
      return null;
    }
  };

  // Load delivered orders history from API
  const loadOrderHistory = async (staffId) => {
    if (!staffId) {
      console.log("No staff ID available, skipping load");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get orders with status 'delivered' for this delivery staff
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        // Include in_transit so accepted orders appear in staff history along with delivered
        status: "in_transit,delivered",
        sort:
          timeFilter === "Latest"
            ? "-delivery_date"
            : timeFilter === "Earliest"
            ? "delivery_date"
            : "-updatedAt",
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Date range filter
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await deliveryOrderService.getDeliveriesByStaff(
        staffId,
        params
      );

      if (response.success && response.data && Array.isArray(response.data)) {
        // Transform API data to UI format
        const transformedOrders = response.data.map((delivery) => {
          const order = delivery.order_id;
          const customer = order?.customer_id;
          const accountInfo = customer?.account_id;

          const orderDate = new Date(delivery.order_date);
          const deliveryDate = delivery.delivery_date
            ? new Date(delivery.delivery_date)
            : orderDate;

          return {
            id: delivery._id,
            orderId: order?.order_number || delivery._id.slice(-6),
            customer: accountInfo?.full_name || "Guest Customer",
            deliveryDate: deliveryDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            address: accountInfo?.address || "No address provided",
            phone: accountInfo?.phone || "No phone",
            items: delivery.notes || "Delivered items",
            totalAmount: order?.total_amount
              ? `${order.total_amount.toLocaleString()} VND`
              : "0 VND",
            assignedTime: orderDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            deliveredTime: deliveryDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            dateSort: deliveryDate,
            trackingNumber: delivery.tracking_number,
            status: delivery.status,
          };
        });

        setHistoryData(transformedOrders);
        setTotalRecords(response.total || 0);
        setTotalPages(response.pages || 0);
      } else {
        console.error("Failed to load order history:", response.message);
        setHistoryData([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error loading order history:", error);
      setHistoryData([]);
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
        loadOrderHistory(staffId);
      }
    };
    initStaff();
  }, []);

  // Load history when filters change (only if we have staffId)
  useEffect(() => {
    if (demoStaffId) {
      loadOrderHistory(demoStaffId);
    }
  }, [currentPage, timeFilter, searchTerm, startDate, endDate]);

  // Sample fake order history data - REMOVE sau khi test API
  const oldHistoryData = [
    {
      id: "101",
      customer: "Le Thi Mai",
      deliveryDate: "Nov 05, 2025",
      address: "789 Pasteur Street, District 1, HCMC",
      phone: "+84 901 456 789",
      items: "Rice, Vegetables, Fish",
      totalAmount: "420,000 VND",
      assignedTime: "07:30 AM",
      deliveredTime: "08:45 AM",
      dateSort: new Date("2025-11-05"),
    },
    {
      id: "102",
      customer: "Vo Van Duc",
      deliveryDate: "Nov 04, 2025",
      address: "456 Le Van Sy Street, District 3, HCMC",
      phone: "+84 902 567 890",
      items: "Milk, Bread, Butter",
      totalAmount: "180,000 VND",
      assignedTime: "09:15 AM",
      deliveredTime: "10:30 AM",
      dateSort: new Date("2025-11-04"),
    },
    {
      id: "103",
      customer: "Phan Thi Lan",
      deliveryDate: "Nov 03, 2025",
      address: "123 Nguyen Trai Street, District 5, HCMC",
      phone: "+84 903 678 901",
      items: "Fruits, Juice, Snacks",
      totalAmount: "250,000 VND",
      assignedTime: "08:00 AM",
      deliveredTime: "09:20 AM",
      dateSort: new Date("2025-11-03"),
    },
    {
      id: "104",
      customer: "Tran Van Minh",
      deliveryDate: "Nov 02, 2025",
      address: "321 Dien Bien Phu Street, District 10, HCMC",
      phone: "+84 904 789 012",
      items: "Meat, Chicken, Spices",
      totalAmount: "380,000 VND",
      assignedTime: "10:45 AM",
      deliveredTime: "12:00 PM",
      dateSort: new Date("2025-11-02"),
    },
    {
      id: "105",
      customer: "Nguyen Thi Hong",
      deliveryDate: "Nov 01, 2025",
      address: "654 Cach Mang Thang 8, District 3, HCMC",
      phone: "+84 905 890 123",
      items: "Eggs, Yogurt, Cereal",
      totalAmount: "320,000 VND",
      assignedTime: "07:00 AM",
      deliveredTime: "08:15 AM",
      dateSort: new Date("2025-11-01"),
    },
    {
      id: "106",
      customer: "Hoang Van Nam",
      deliveryDate: "Oct 31, 2025",
      address: "987 Vo Thi Sau Street, District 3, HCMC",
      phone: "+84 906 901 234",
      items: "Noodles, Sauce, Vegetables",
      totalAmount: "150,000 VND",
      assignedTime: "09:30 AM",
      deliveredTime: "10:45 AM",
      dateSort: new Date("2025-10-31"),
    },
    {
      id: "107",
      customer: "Bui Thi Nga",
      deliveryDate: "Oct 30, 2025",
      address: "159 Hai Ba Trung Street, District 1, HCMC",
      phone: "+84 907 012 345",
      items: "Seafood, Rice, Herbs",
      totalAmount: "480,000 VND",
      assignedTime: "11:00 AM",
      deliveredTime: "12:30 PM",
      dateSort: new Date("2025-10-30"),
    },
    {
      id: "108",
      customer: "Do Van Khai",
      deliveryDate: "Oct 29, 2025",
      address: "753 Tran Hung Dao Street, District 5, HCMC",
      phone: "+84 908 123 456",
      items: "Drinks, Ice cream, Candy",
      totalAmount: "200,000 VND",
      assignedTime: "03:15 PM",
      deliveredTime: "04:20 PM",
      dateSort: new Date("2025-10-29"),
    },
  ]; // End fake data

  // Filter orders based on search term, time filter, and date range
  // NOTE: API now handles filtering, so this is mostly for client-side only
  const filteredOrders = historyData.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    let matchesDateRange = true;
    if (startDate && endDate) {
      const orderDate = order.dateSort;
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDateRange = orderDate >= start && orderDate <= end;
    } else if (startDate) {
      const start = new Date(startDate);
      matchesDateRange = order.dateSort >= start;
    } else if (endDate) {
      const end = new Date(endDate);
      matchesDateRange = order.dateSort <= end;
    }

    return matchesSearch && matchesDateRange;
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

  const handleDateFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="history-orders-view">
      {/* Header */}
      <div className="history-page-header">
        <h1 className="history-page-title">Order History</h1>
      </div>

      {/* Filters and Actions */}
      <div className="history-filters-section">
        <div className="history-left-filters">
          <div className="history-search-container">
            <FaSearch className="history-search-icon" />
            <input
              type="text"
              placeholder="Search orders or customers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="history-search-input"
            />
          </div>

          <div className="history-dropdown">
            <select
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value)}
              className="history-filter-select"
            >
              <option value="All">All</option>
              <option value="Latest">Latest</option>
              <option value="Earliest">Earliest</option>
            </select>
          </div>

          <div className="history-date-group">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleDateFilterChange();
              }}
              placeholder="Start Date"
              className="history-date-input"
            />
          </div>

          <div className="history-date-group">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleDateFilterChange();
              }}
              placeholder="End Date"
              className="history-date-input"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="history-table-container">
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <div>Loading order history...</div>
          </div>
        )}
        <table className="history-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Delivery Info</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No delivered orders found
                </td>
              </tr>
            )}
            {paginatedData.map((order, index) => (
              <tr key={`page-${currentPage}-${order.id}-${index}`}>
                <td className="history-order-id">
                  {order.orderId || order.id}
                </td>
                <td className="history-customer-info">
                  <div className="history-customer-name">{order.customer}</div>
                  <div className="history-customer-phone">{order.phone}</div>
                </td>
                <td className="history-delivery-info">
                  <div className="history-delivery-date">
                    {order.deliveryDate}
                  </div>
                  <div className="history-delivered-time">
                    {order.deliveredTime}
                  </div>
                </td>
                <td className="history-address">
                  <div className="history-address-text">{order.address}</div>
                </td>
                <td className="history-action-buttons">
                  <button
                    className="history-action-btn history-view-btn"
                    onClick={() => navigate(`/order-history/${order.id}`)}
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
      <div className="history-pagination-section">
        <div className="history-pagination-info">
          Showing {totalItems > 0 ? startIndex + 1 : 0}-
          {Math.min(endIndex, totalItems)} of {totalItems}
        </div>
        <div className="history-pagination-controls">
          <button
            className="history-pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          <div className="history-page-numbers">
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
                  className={`history-page-number ${
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
            className="history-pagination-btn"
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

export default OrderHistoryView;
