import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaClipboardList,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./OrderHistoryDetail.css";
import { deliveryOrderService } from "../../../services/deliveryOrderService";

const OrderHistoryDetail = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  // ========== API FUNCTIONS ==========
  
  // Load delivered order details
  const loadOrderDetails = async () => {
    if (!orderId) {
      setError('Order ID is required');
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
        const deliveryDate = delivery.delivery_date ? new Date(delivery.delivery_date) : orderDate;
        
        const transformedData = {
          id: order?.order_number || `#${delivery._id.slice(-6)}`,
          _id: delivery._id,
          orderDate: orderDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          expectedDeliveryDate: deliveryDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          deliveredDate: deliveryDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          totalAmount: order?.total_amount ? `${order.total_amount.toLocaleString()} VND` : '0 VND',
          customer: {
            name: accountInfo?.full_name || 'Guest Customer',
            phone: accountInfo?.phone || 'No phone provided',
            address: accountInfo?.address || 'No address provided',
          },
          deliveryNotes: delivery.notes || 'No special delivery instructions',
          trackingNumber: delivery.tracking_number,
          status: delivery.status,
          items: [],
          pricing: {
            subtotal: '0 VND',
            shippingFee: '0 VND',
            total: '0 VND'
          }
        };

        // Transform order items if available
        if (delivery.orderItems && Array.isArray(delivery.orderItems)) {
          let subtotal = 0;
          transformedData.items = delivery.orderItems.map((item, index) => {
            const itemTotal = (item.unit_price || item.price || 0) * (item.quantity || 0);
            subtotal += itemTotal;
            
            const product = item.product_id;
            return {
              id: index + 1,
              name: product?.product_name || product?.name || 'Unknown Product',
              category: product?.category_id?.category_name || product?.category || 'N/A',
              price: `${(item.unit_price || item.price || 0).toLocaleString()} VND each`,
              quantity: item.quantity || 0,
              total: `${itemTotal.toLocaleString()} VND`
            };
          });
          
          // Calculate total and shipping fee from order
          const orderTotal = order?.total_amount || 0;
          const shippingFee = Math.max(0, orderTotal - subtotal);
          
          transformedData.pricing = {
            subtotal: `${subtotal.toLocaleString()} VND`,
            shippingFee: `${shippingFee.toLocaleString()} VND`,
            total: `${orderTotal.toLocaleString()} VND`
          };
        }

        setOrderData(transformedData);
      } else {
        setError(response.message || 'Failed to load order details');
      }
    } catch (err) {
      console.error('Error loading order details:', err);
      setError('An error occurred while loading order details');
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
    id: "#002",
    orderDate: "Nov 05, 2025 09:30 AM",
    expectedDeliveryDate: "Nov 05, 2025",
    deliveredDate: "Nov 05, 2025 02:15 PM",
    totalAmount: "$45.50",
    customer: {
      name: "Tran Thi B",
      phone: "+84 901 234 567",
      address: "456 Nguyen Hue Boulevard, District 1, Ho Chi Minh City",
    },
    deliveryNotes: "Please ring the bell. Building entrance on the left side.",
    items: [
      {
        id: 1,
        name: "Premium Coffee Beans 500g",
        category: "Beverages",
        price: "$12.00 each",
        quantity: 2,
        total: "$24.00",
      },
      {
        id: 2,
        name: "Organic Banana Bundle",
        category: "Fresh Produce",
        price: "$3.50 each",
        quantity: 1,
        total: "$3.50",
      },
      {
        id: 3,
        name: "Dark Chocolate Bar",
        category: "Confectionery",
        price: "$4.50 each",
        quantity: 2,
        total: "$9.00",
      },
      {
        id: 4,
        name: "Natural Honey 250g",
        category: "Condiments",
        price: "$6.00 each",
        quantity: 1,
        total: "$6.00",
      },
    ],
    pricing: {
      subtotal: "$42.50",
      shippingFee: "$3.00",
      total: "$45.50",
    },
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancel = () => {
    console.log("Closing order details:", orderData.id);
    navigate(-1);
  };

  const handleOpenInMaps = () => {
    // Open address in maps app
    const address = encodeURIComponent(orderData.customer.address);
    window.open(`https://maps.google.com?q=${address}`, "_blank");
  };

  return (
    <div className="history-detail-view">
      {/* Loading State */}
      {isLoading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div>Loading order details...</div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          <button onClick={() => navigate(-1)} className="history-cancel-btn">
            Go Back
          </button>
        </div>
      )}

      {/* Order Content */}
      {!isLoading && !error && orderData && (
        <>
      {/* Header */}
      <div className="history-page-header">
        <h1 className="history-page-title">Order History Details</h1>
      </div>

      {/* Main Content */}
      <div className="history-detail-content">
        {/* Order Information Container */}
        <div className="history-info-container">
          {/* Order Header Section */}
          <div className="history-section">
            <div className="history-header-info">
              <div className="history-id-section">
                <h2 className="history-id">Order ID</h2>
                <div className="history-id-value">{orderData.id}</div>
              </div>

              <div className="history-dates">
                <div className="history-date-item">
                  <span className="history-date-label">Order Date</span>
                  <span className="history-date-value">
                    {orderData.orderDate}
                  </span>
                </div>
                <div className="history-date-item">
                  <span className="history-date-label">Expected Delivery</span>
                  <span className="history-date-value">
                    {orderData.expectedDeliveryDate}
                  </span>
                </div>
                <div className="history-date-item">
                  <span className="history-date-label">Delivered Date</span>
                  <span className="history-date-value history-delivered-date">
                    {orderData.deliveredDate}
                  </span>
                </div>
                <div className="history-date-item">
                  <span className="history-date-label">Total Amount</span>
                  <span className="history-amount-value">
                    {orderData.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="history-section">
            <h2 className="history-section-title">Customer Information</h2>

            <div className="history-customer-details">
              <div className="history-customer-item">
                <FaUser className="history-customer-icon" />
                <div className="history-customer-info">
                  <span className="history-info-label">Customer Name</span>
                  <span className="history-info-value">
                    {orderData.customer.name}
                  </span>
                </div>
              </div>

              <div className="history-customer-item">
                <FaPhone className="history-customer-icon" />
                <div className="history-customer-info">
                  <span className="history-info-label">Phone Number</span>
                  <span className="history-info-value">
                    {orderData.customer.phone}
                  </span>
                </div>
              </div>

              <div className="history-customer-item">
                <FaMapMarkerAlt className="history-customer-icon" />
                <div className="history-customer-info">
                  <span className="history-info-label">Delivery Address</span>
                  <span className="history-info-value">
                    {orderData.customer.address}
                  </span>
                </div>
                <button
                  onClick={handleOpenInMaps}
                  className="history-map-button"
                >
                  Open in Maps
                </button>
              </div>
            </div>

            {/* Delivery Notes */}
            <div className="history-delivery-notes">
              <div className="history-notes-header">
                <FaClipboardList className="history-notes-icon" />
                <span className="history-notes-title">Delivery Notes:</span>
              </div>
              <p className="history-notes-text">{orderData.deliveryNotes}</p>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="history-section">
            <h2 className="history-section-title">
              Order Items ({orderData.items.length})
            </h2>

            <div className="history-items-list">
              {orderData.items.map((item) => (
                <div key={item.id} className="history-item-row">
                  <div className="history-item-icon"></div>
                  <div className="history-item-details">
                    <div className="history-item-name">{item.name}</div>
                    <div className="history-item-category">{item.category}</div>
                    <div className="history-item-price">{item.price}</div>
                  </div>
                  <div className="history-item-quantity">
                    <span className="history-quantity-label">Quantity</span>
                    <span className="history-quantity-value">
                      ×{item.quantity}
                    </span>
                    <span className="history-item-total">{item.total}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="history-pricing-summary">
              <div className="history-pricing-row">
                <span className="history-pricing-label">Subtotal</span>
                <span className="history-pricing-value">
                  {orderData.pricing.subtotal}
                </span>
              </div>
              <div className="history-pricing-row">
                <span className="history-pricing-label">Shipping Fee</span>
                <span className="history-pricing-value">
                  {orderData.pricing.shippingFee}
                </span>
              </div>
              <div className="history-pricing-row history-total-row">
                <span className="history-pricing-label">Total</span>
                <span className="history-pricing-value">
                  {orderData.pricing.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="history-quick-actions-panel">
          <button onClick={handleCancel} className="history-cancel-btn">
            Close
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default OrderHistoryDetail;
