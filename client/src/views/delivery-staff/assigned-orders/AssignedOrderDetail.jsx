import React, { useState } from "react";
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

const AssignedOrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Sample order data - in real app, fetch by orderId
  const orderData = {
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

  const handleConfirmPickupAction = () => {
    console.log("Confirming pickup for order:", orderData.id);
    // Add pickup confirmation logic here
    // You can add API call here to update order status
    setSuccessMessage("Order pickup confirmed successfully!");
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
                  <span className="amount-value">{orderData.totalAmount}</span>
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
                  <span className="info-value">{orderData.customer.name}</span>
                </div>
              </div>

              <div className="customer-item">
                <FaPhone className="customer-icon" />
                <div className="customer-info">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{orderData.customer.phone}</span>
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
            <h2 className="section-title">Order Items (5)</h2>

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
                <span className="pricing-value">{orderData.pricing.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="quick-actions-panel">
          <button onClick={handleConfirmPickup} className="confirm-pickup-btn">
            <FaCheck className="action-icon" />
            Confirm Pickup
          </button>

          <button onClick={handleReportIssue} className="report-issue-btn">
            <FaClipboardList className="action-icon" />
            Report Issue
          </button>

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
    </div>
  );
};

export default AssignedOrderDetail;
