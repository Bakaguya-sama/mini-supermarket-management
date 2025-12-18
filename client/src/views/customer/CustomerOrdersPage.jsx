import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";
import ConfirmationMessage from "../../components/Messages/ConfirmationMessage";
import orderService from "../../services/orderService";
import "./CustomerOrdersPage.css";

const statusConfig = {
  pending: {
    label: "Processing",
    icon: FaClock,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  processing: {
    label: "Processing",
    icon: FaClock,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  confirmed: {
    label: "Confirmed",
    icon: FaCheckCircle,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  shipping: {
    label: "Shipping",
    icon: FaTruck,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  delivered: {
    label: "Delivered",
    icon: FaCheckCircle,
    color: "#22c55e",
    bgColor: "#dcfce7",
  },
  cancelled: {
    label: "Cancelled",
    icon: FaTimesCircle,
    color: "#ef4444",
    bgColor: "#fee2e2",
  },
};

const CustomerOrdersPage = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [modalOrder, setModalOrder] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  /**
   * Load customer orders from API
   */
  useEffect(() => {
    if (customerId) {
      loadOrders();
    }
  }, [customerId]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      console.log(`📦 Loading orders for customer: ${customerId}`);

      const result = await orderService.getOrdersByCustomer(customerId);

      if (result.success && result.data) {
        // Transform backend orders to UI format
        const formattedOrders = result.data.map((order) => ({
          id: order.order_number || order._id,
          _id: order._id,
          date: order.order_date || order.createdAt,
          status: order.status,
          total: order.total_amount,
          trackingNumber: order.tracking_number || "N/A",
          deliveryDate: order.delivery_date,
          items: (order.orderItems || []).map((item) => ({
            name: item.product_id?.name || "Unknown Product",
            quantity: item.quantity,
            price: item.unit_price,
          })),
        }));

        setOrders(formattedOrders);
        console.log(`✅ Loaded ${formattedOrders.length} orders`);
      } else {
        console.error("❌ Failed to load orders:", result.message);
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch = order.id
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const openModal = (order, e) => {
    e.stopPropagation();
    setModalOrder(order);
  };

  const closeModal = () => {
    setModalOrder(null);
  };

  const handleCancelOrder = (orderId, e) => {
    e.stopPropagation();
    setConfirmCancel(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!confirmCancel) return;

    try {
      console.log(`📦 Cancelling order: ${confirmCancel}`);

      // Find the order _id from order number
      const orderToCancel = orders.find((o) => o.id === confirmCancel);
      if (!orderToCancel) {
        console.error("❌ Order not found");
        return;
      }

      const result = await orderService.cancelOrder(orderToCancel._id);

      if (result.success) {
        console.log("✅ Order cancelled successfully");

        // Update orders list
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === confirmCancel
              ? { ...order, status: "cancelled" }
              : order
          )
        );

        // Close modal if the cancelled order is currently open
        if (modalOrder && modalOrder.id === confirmCancel) {
          setModalOrder(null);
        }
      } else {
        console.error("❌ Failed to cancel order:", result.message);
        alert(result.message || "Failed to cancel order");
      }

      setConfirmCancel(null);
    } catch (error) {
      console.error("❌ Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
      setConfirmCancel(null);
    }
  };

  return (
    <div className="customer-orders">
      <div className="customer-orders-container">
        {/* Header */}
        <div className="customer-orders-header">
          <div>
            <h2>My Orders</h2>
            <p>Track and manage your orders</p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="customer-orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        )}

        {/* Filters */}
        {!isLoading && (
          <div className="customer-orders-filters">
            <div className="orders-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="orders-status-filter">
              <button
                className={filterStatus === "all" ? "active" : ""}
                onClick={() => setFilterStatus("all")}
              >
                All Orders
              </button>
              <button
                className={filterStatus === "pending" ? "active" : ""}
                onClick={() => setFilterStatus("pending")}
              >
                Processing
              </button>
              <button
                className={filterStatus === "shipping" ? "active" : ""}
                onClick={() => setFilterStatus("shipping")}
              >
                Shipping
              </button>
              <button
                className={filterStatus === "delivered" ? "active" : ""}
                onClick={() => setFilterStatus("delivered")}
              >
                Delivered
              </button>
              <button
                className={filterStatus === "cancelled" ? "active" : ""}
                onClick={() => setFilterStatus("cancelled")}
              >
                Cancelled
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && (
          <div className="customer-orders-list">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="customer-order-card">
                  <div className="order-card-header">
                    <div className="order-card-left">
                      <div className="order-id">
                        <FaBox />
                        {order.id}
                      </div>
                      <span
                        className="order-status-badge"
                        style={{
                          color: status.color,
                          backgroundColor: status.bgColor,
                        }}
                      >
                        <StatusIcon />
                        {status.label}
                      </span>
                    </div>
                    <div className="order-card-right">
                      <div className="order-total-label">Total</div>
                      <div className="order-total-amount">{order.total}VNĐ</div>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-items-summary">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item-summary">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>{item.price * item.quantity}VNĐ</span>
                        </div>
                      ))}
                    </div>

                    {order.trackingNumber && (
                      <div className="order-tracking">
                        <div className="tracking-label">Tracking Number</div>
                        <div className="tracking-number">
                          {order.trackingNumber}
                        </div>
                      </div>
                    )}

                    <div className="order-actions">
                      <button
                        className="view-details-btn"
                        onClick={(e) => openModal(order, e)}
                      >
                        <FaSearch /> View Details
                      </button>
                      {(order.status === "pending" ||
                        order.status === "processing") && (
                        <button
                          className="cancel-order-btn"
                          onClick={(e) => handleCancelOrder(order.id, e)}
                        >
                          <FaTimesCircle /> Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <div className="customer-orders-empty">
            <FaBox className="empty-icon" />
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {modalOrder && (
        <div className="order-modal-overlay" onClick={closeModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{modalOrder.id}</h2>
                <p>Order details and items</p>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                X
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <div className="info-label">Order Date</div>
                  <div className="info-value">
                    {new Date(modalOrder.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="modal-info-item">
                  <div className="info-label">Status</div>
                  <div className="info-value">
                    <span
                      className="order-status-badge"
                      style={{
                        color: statusConfig[modalOrder.status].color,
                        backgroundColor:
                          statusConfig[modalOrder.status].bgColor,
                      }}
                    >
                      {statusConfig[modalOrder.status].label}
                    </span>
                  </div>
                </div>
                <div className="modal-info-item">
                  <div className="info-label">Tracking number</div>
                  <div className="info-value tracking-value">
                    {modalOrder.trackingNumber}
                  </div>
                </div>
                <div className="modal-info-item">
                  <div className="info-label">Delivery Date</div>
                  <div className="info-value">
                    {modalOrder.deliveryDate
                      ? new Date(modalOrder.deliveryDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          }
                        )
                      : "Pending"}
                  </div>
                </div>
              </div>

              <div className="modal-items-section">
                <h3>Order Items</h3>
                <div className="modal-items-list">
                  {modalOrder.items.map((item, index) => (
                    <div key={index} className="modal-item">
                      <div className="modal-item-info">
                        <div className="modal-item-name">{item.name}</div>
                        <div className="modal-item-quantity">
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div className="modal-item-price">
                        {item.price * item.quantity}VNĐ
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-total">
                <span>Total Amount</span>
                <span className="modal-total-amount">
                  {modalOrder.total}VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <ConfirmationMessage
          title="Cancel Order"
          message="Are you sure you want to cancel this order? This action cannot be undone."
          onConfirm={confirmCancelOrder}
          onCancel={() => setConfirmCancel(null)}
        />
      )}
    </div>
  );
};

export default CustomerOrdersPage;
