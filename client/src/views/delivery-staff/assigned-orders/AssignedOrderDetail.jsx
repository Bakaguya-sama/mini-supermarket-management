import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaClipboardList,
  FaCheck,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmationModal from "../../../components/DeliveryOrderModal/ConfirmationModal";
import "./AssignedOrderDetail.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import { deliveryOrderService } from "../../../services/deliveryOrderService";

const AssignedOrderDetail = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  // ========== API FUNCTIONS ==========

  // Load delivery order details
  const loadOrderDetails = async () => {
    if (!orderId) {
      setError("Order ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await deliveryOrderService.getDeliveryOrderById(orderId);

      if (response.success && response.data) {
        const delivery = response.data;
        const order = delivery.order_id;
        const customer = order?.customer_id;
        const accountInfo = customer?.account_id;

        // Transform API data to UI format
        const orderDate = new Date(delivery.order_date);
        const deliveryDate = delivery.delivery_date
          ? new Date(delivery.delivery_date)
          : orderDate;

        const transformedData = {
          id: order?.order_number || `#${delivery._id.slice(-6)}`,
          _id: delivery._id,
          orderDate: orderDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          expectedDeliveryDate: deliveryDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          totalAmount: order?.total_amount
            ? `${order.total_amount.toLocaleString()} VND`
            : "0 VND",
          customer: {
            name: accountInfo?.full_name || "Guest Customer",
            phone: accountInfo?.phone || "No phone provided",
            address: accountInfo?.address || "No address provided",
          },
          deliveryNotes: delivery.notes || "No special delivery instructions",
          trackingNumber: delivery.tracking_number,
          status: delivery.status,
          items: [],
          pricing: {
            subtotal: "0 VND",
            shippingFee: "0 VND",
            total: "0 VND",
          },
        };

        // Transform order items if available
        if (delivery.orderItems && Array.isArray(delivery.orderItems)) {
          let subtotal = 0;
          transformedData.items = delivery.orderItems.map((item, index) => {
            const itemTotal =
              (item.unit_price || item.price || 0) * (item.quantity || 0);
            subtotal += itemTotal;

            const product = item.product_id;
            return {
              id: index + 1,
              name: product?.product_name || product?.name || "Unknown Product",
              category:
                product?.category_id?.category_name ||
                product?.category ||
                "N/A",
              price: `${(
                item.unit_price ||
                item.price ||
                0
              ).toLocaleString()} VND each`,
              quantity: item.quantity || 0,
              total: `${itemTotal.toLocaleString()} VND`,
            };
          });

          // Calculate total and shipping fee from order
          const orderTotal = order?.total_amount || 0;
          const shippingFee = Math.max(0, orderTotal - subtotal);

          transformedData.pricing = {
            subtotal: `${subtotal.toLocaleString()} VND`,
            shippingFee: `${shippingFee.toLocaleString()} VND`,
            total: `${orderTotal.toLocaleString()} VND`,
          };
        }

        setOrderData(transformedData);
      } else {
        setError(response.message || "Failed to load order details");
      }
    } catch (err) {
      console.error("Error loading order details:", err);
      setError("An error occurred while loading order details");
    } finally {
      setIsLoading(false);
    }
  };

  // Load order on mount
  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  // Sample fake order data - REMOVE sau khi test API
  const oldOrderData = {
    id: "#001",
    orderDate: "Nov 07, 2025 08:00 AM",
    expectedDeliveryDate: "Nov 07, 2025",
    totalAmount: "$30.00",
    customer: {
      name: "Nguyen Van A",
      phone: "+84 812 345 878",
      address: "123 Le Loi Street, District 1, Ho Chi Minh City",
    },
    deliveryNotes:
      "Please call before delivery. Apartment building, 3rd floor.",
    items: [
      {
        id: 1,
        name: "Fresh Milk 1L",
        category: "Dairy",
        price: "$3.50 each",
        quantity: 2,
        total: "$7.00",
      },
      {
        id: 2,
        name: "Whole Wheat Bread",
        category: "Bakery",
        price: "$2.50 each",
        quantity: 1,
        total: "$2.50",
      },
      {
        id: 3,
        name: "Organic Eggs (12pcs)",
        category: "Fresh Produce",
        price: "$5.00 each",
        quantity: 1,
        total: "$5.00",
      },
      {
        id: 4,
        name: "Greek Yogurt",
        category: "Dairy",
        price: "$4.00 each",
        quantity: 3,
        total: "$12.00",
      },
      {
        id: 5,
        name: "Orange Juice 1L",
        category: "Beverages",
        price: "$4.50 each",
        quantity: 1,
        total: "$4.50",
      },
    ],
    pricing: {
      subtotal: "$28.00",
      shippingFee: "$2.00",
      total: "$30.00",
    },
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleConfirmPickup = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmPickupAction = async () => {
    if (!orderData || !orderData._id) {
      console.error("No order data available");
      return;
    }

    try {
      // Update delivery status to 'in_transit'
      const response = await deliveryOrderService.updateDeliveryOrder(
        orderData._id,
        {
          status: "in_transit",
        }
      );

      if (response.success) {
        setSuccessMessage(
          "Order pickup confirmed successfully! Redirecting to History..."
        );
        setIsConfirmationModalOpen(false);
        // Navigate to order history so the accepted order appears there
        setTimeout(() => {
          navigate("/order-history");
        }, 1000);
      } else {
        console.error("Failed to update order status:", response.message);
        setSuccessMessage(`Failed to update status: ${response.message}`);
      }
    } catch (error) {
      console.error("Error confirming pickup:", error);
      setSuccessMessage("An error occurred while confirming pickup");
    }
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleReportIssue = () => {
    console.log("Reporting issue for order:", orderData.id);
    // Add issue reporting logic here
  };

  const handleCancel = () => {
    console.log("Cancelling order:", orderData.id);
    navigate(-1);
  };

  const handleOpenInMaps = () => {
    // Open address in maps app
    const address = encodeURIComponent(orderData.customer.address);
    window.open(`https://maps.google.com?q=${address}`, "_blank");
  };

  return (
    <div className="order-detail-view">
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <div>Loading order details...</div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          <button onClick={() => navigate(-1)} className="cancel-btn">
            Go Back
          </button>
        </div>
      )}

      {/* Order Content */}
      {!isLoading && !error && orderData && (
        <>
          {/* Header */}
          <div className="order-page-header">
            <h1 className="order-page-title">Order Details</h1>
          </div>

          {/* Main Content */}
          <div className="order-detail-content">
            {/* Order Information Container */}
            <div className="order-info-container">
              {/* Order Header Section */}
              <div className="order-section">
                <div className="order-header-info">
                  <div className="order-id-section">
                    <h2 className="order-id">Order ID</h2>
                    <div className="order-id-value">{orderData.id}</div>
                  </div>

                  <div className="order-dates">
                    <div className="date-item">
                      <span className="date-label">Order Date</span>
                      <span className="date-value">{orderData.orderDate}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Expected Delivery Date</span>
                      <span className="date-value">
                        {orderData.expectedDeliveryDate}
                      </span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Total Amount</span>
                      <span className="amount-value">
                        {orderData.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="order-section">
                <h2 className="section-title">Customer Information</h2>

                <div className="customer-details">
                  <div className="customer-item">
                    <FaUser className="customer-icon" />
                    <div className="customer-info">
                      <span className="info-label">Customer Name</span>
                      <span className="info-value">
                        {orderData.customer.name}
                      </span>
                    </div>
                  </div>

                  <div className="customer-item">
                    <FaPhone className="customer-icon" />
                    <div className="customer-info">
                      <span className="info-label">Phone Number</span>
                      <span className="info-value">
                        {orderData.customer.phone}
                      </span>
                    </div>
                  </div>

                  <div className="customer-item">
                    <FaMapMarkerAlt className="customer-icon" />
                    <div className="customer-info">
                      <span className="info-label">Delivery Address</span>
                      <span className="info-value">
                        {orderData.customer.address}
                      </span>
                    </div>
                    <button onClick={handleOpenInMaps} className="map-button">
                      Open in Maps
                    </button>
                  </div>
                </div>

                {/* Delivery Notes */}
                <div className="delivery-notes">
                  <div className="notes-header">
                    <FaClipboardList className="notes-icon" />
                    <span className="notes-title">Delivery Notes:</span>
                  </div>
                  <p className="notes-text">{orderData.deliveryNotes}</p>
                </div>
              </div>

              {/* Order Items Section */}
              <div className="order-section">
                <h2 className="section-title">
                  Order Items ({orderData.items?.length || 0})
                </h2>

                <div className="items-list">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="item-row">
                      <div className="item-icon"></div>
                      <div className="item-details">
                        <div className="item-name">{item.name}</div>
                        <div className="item-category">{item.category}</div>
                        <div className="item-price">{item.price}</div>
                      </div>
                      <div className="item-quantity">
                        <span className="quantity-label">Quantity</span>
                        <span className="quantity-value">×{item.quantity}</span>
                        <span className="item-total">{item.total}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="pricing-summary">
                  <div className="pricing-row">
                    <span className="pricing-label">Subtotal</span>
                    <span className="pricing-value">
                      {orderData.pricing.subtotal}
                    </span>
                  </div>
                  <div className="pricing-row">
                    <span className="pricing-label">Shipping Fee</span>
                    <span className="pricing-value">
                      {orderData.pricing.shippingFee}
                    </span>
                  </div>
                  <div className="pricing-row total-row">
                    <span className="pricing-label">Total</span>
                    <span className="pricing-value">
                      {orderData.pricing.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="quick-actions-panel">
              <button
                onClick={handleConfirmPickup}
                className="confirm-pickup-btn"
              >
                <FaCheck className="action-icon" />
                Confirm Pickup
              </button>

              {/* <button onClick={handleReportIssue} className="report-issue-btn">
                <FaClipboardList className="action-icon" />
                Report Issue
              </button> */}

              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            onClose={handleCloseConfirmationModal}
            onConfirm={handleConfirmPickupAction}
            orderData={orderData}
          />
        </>
      )}
    </div>
  );
};

export default AssignedOrderDetail;
