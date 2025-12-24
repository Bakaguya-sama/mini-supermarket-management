import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaUser,
  FaReceipt,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./InvoiceDetail.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import { invoiceService } from "../../../services/invoiceService";

const InvoiceDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: invoiceId } = useParams();

  // Message
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);

  // Modal state for cancel confirmation
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);

  // Payment method state - will be initialized from invoice data
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

  // Product list state - from invoice items
  const [products, setProducts] = useState([]);

  // Customer information - from invoice
  const [customerInfo, setCustomerInfo] = useState({
    id: null,
    type: "Guest Customer",
    name: "Guest Customer",
    description: "Walk-in customer",
    contact: "No contact information",
    hasInfo: false,
  });

  // Available payment methods
  const paymentMethods = [
    { id: "Card Payment", name: "Card Payment", icon: "💳" },
    { id: "Cash", name: "Cash", icon: "💰" },
    { id: "Digital Wallet", name: "Digital Wallet", icon: "📱" },
  ];

  // ========== API FUNCTIONS ==========
  
  // Load invoice details from API
  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      const response = await invoiceService.getInvoiceById(invoiceId);
      
      if (response.success && response.data) {
        const invoiceData = response.data;
        setInvoice(invoiceData);

        // Transform invoice items to product format
        if (invoiceData.items && Array.isArray(invoiceData.items) && invoiceData.items.length > 0) {
          const transformedProducts = invoiceData.items.map(item => ({
            id: item._id,
            name: item.product_id?.name || item.description || 'Unknown Product',
            category: item.product_id?.category || 'Other',
            quantity: item.quantity,
            price: item.unit_price,
            total: item.line_total,
            sku: item.product_id?.sku
          }));
          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }

        // Set customer info
        if (invoiceData.customer_id) {
          const customer = invoiceData.customer_id;
          const accountInfo = customer.account_id;
          setCustomerInfo({
            id: customer._id,
            type: 'Registered Customer',
            name: accountInfo?.full_name || customer._id,
            description: `${customer.membership_type || 'Regular'} customer`,
            contact: accountInfo?.email || accountInfo?.phone_number || 'No contact',
            hasInfo: true,
          });
        } else {
          setCustomerInfo({
            id: null,
            type: 'Guest Customer',
            name: 'Guest Customer',
            description: 'Walk-in customer',
            contact: 'No contact information',
            hasInfo: false,
          });
        }

        // Set payment method from invoice (priority) or order (fallback)
        if (invoiceData.payment_method) {
          setSelectedPaymentMethod(invoiceData.payment_method);
        } else if (invoiceData.order_id && invoiceData.order_id.payment_method) {
          setSelectedPaymentMethod(invoiceData.order_id.payment_method);
        } else {
          setSelectedPaymentMethod('Cash'); // Default
        }
      } else {
        setErrorMessage(response.message || 'Failed to load invoice');
        setTimeout(() => navigate('/invoice'), 3000);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      setErrorMessage('Failed to load invoice details');
      setTimeout(() => navigate('/invoice'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Load invoice on mount
  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    } else {
      setErrorMessage('Invoice ID not provided');
      setTimeout(() => navigate('/invoice'), 2000);
    }
  }, [invoiceId]);

  // Available customers for selection (keep fake data for now - already exists in original code)
  const [availableCustomers] = useState([
    {
      id: "CUST-001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      type: "Regular",
    },
    {
      id: "CUST-002",
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+1 (555) 987-6543",
      type: "VIP",
    },
    {
      id: "CUST-003",
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+1 (555) 456-7890",
      type: "Regular",
    },
    {
      id: "CUST-004",
      name: "Sarah Smith",
      email: "sarah.smith@email.com",
      phone: "+1 (555) 321-0987",
      type: "VIP",
    },
    {
      id: "CUST-005",
      name: "David Lee",
      email: "david.lee@email.com",
      phone: "+1 (555) 654-3210",
      type: "Regular",
    },
    {
      id: "CUST-006",
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+1 (555) 789-0123",
      type: "Premium",
    },
    {
      id: "CUST-007",
      name: "Robert Brown",
      email: "robert.brown@email.com",
      phone: "+1 (555) 234-5678",
      type: "VIP",
    },
    {
      id: "CUST-008",
      name: "Alice Cooper",
      email: "alice.cooper@email.com",
      phone: "+1 (555) 345-6789",
      type: "Regular",
    },
    {
      id: "CUST-009",
      name: "Tom Anderson",
      email: "tom.anderson@email.com",
      phone: "+1 (555) 456-7890",
      type: "Premium",
    },
    {
      id: "CUST-010",
      name: "Lisa Wang",
      email: "lisa.wang@email.com",
      phone: "+1 (555) 567-8901",
      type: "VIP",
    },
    {
      id: "CUST-011",
      name: "James Wilson",
      email: "james.wilson@email.com",
      phone: "+1 (555) 678-9012",
      type: "Regular",
    },
    {
      id: "CUST-012",
      name: "Jennifer Martinez",
      email: "jennifer.martinez@email.com",
      phone: "+1 (555) 789-0123",
      type: "Premium",
    },
    {
      id: "CUST-013",
      name: "Chris Taylor",
      email: "chris.taylor@email.com",
      phone: "+1 (555) 890-1234",
      type: "Regular",
    },
    {
      id: "CUST-014",
      name: "Amanda Johnson",
      email: "amanda.johnson@email.com",
      phone: "+1 (555) 901-2345",
      type: "VIP",
    },
    {
      id: "CUST-015",
      name: "Kevin Zhang",
      email: "kevin.zhang@email.com",
      phone: "+1 (555) 012-3456",
      type: "Premium",
    },
    {
      id: "CUST-016",
      name: "Michelle Davis",
      email: "michelle.davis@email.com",
      phone: "+1 (555) 123-4567",
      type: "Regular",
    },
    {
      id: "CUST-017",
      name: "Steven Miller",
      email: "steven.miller@email.com",
      phone: "+1 (555) 234-5678",
      type: "VIP",
    },
    {
      id: "CUST-018",
      name: "Rachel Green",
      email: "rachel.green@email.com",
      phone: "+1 (555) 345-6789",
      type: "Premium",
    },
    {
      id: "CUST-019",
      name: "Daniel Kim",
      email: "daniel.kim@email.com",
      phone: "+1 (555) 456-7890",
      type: "Regular",
    },
    {
      id: "CUST-020",
      name: "Nicole Thompson",
      email: "nicole.thompson@email.com",
      phone: "+1 (555) 567-8901",
      type: "VIP",
    },
  ]);

  // Discount & Promotion state - initialize from location.state if available
  const [discount, setDiscount] = useState(() => {
    if (location.state?.selectedPromotion) {
      // Clear location state immediately to prevent re-rendering issues
      const selectedPromotion = location.state.selectedPromotion;
      window.history.replaceState({}, document.title);

      return {
        code: selectedPromotion.code,
        type: selectedPromotion.type,
        name: selectedPromotion.title,
        description: selectedPromotion.description,
        percentage:
          parseFloat(selectedPromotion.discount.replace(/[^0-9]/g, "")) || 0,
        validPeriod: selectedPromotion.validPeriod,
      };
    }
    return null;
  });

  // Calculate totals from products and invoice data
  const subtotal = products.reduce((sum, product) => sum + product.total, 0);
  const discountAmount = invoice?.discount_amount || 0;
  const taxRate = 0.09; // 9% tax
  const taxAmount = invoice?.tax_amount || (subtotal * taxRate);
  const totalAmount = invoice?.total_amount || (subtotal - discountAmount + taxAmount);

  // Get invoice status for UI
  const invoiceStatus = invoice?.payment_status || 'unpaid';
  const statusMap = {
    'unpaid': 'pending',
    'paid': 'completed',
    'partial': 'pending',
    'refunded': 'refunded'
  };
  const invoiceData = {
    id: invoice?.invoice_number || invoiceId,
    status: statusMap[invoiceStatus] || 'pending',
    paymentMethod: selectedPaymentMethod,
    customer: customerInfo
  };

  // Filter available customers
  const filteredCustomers = availableCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(customerSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Product list is readonly - no modifications allowed

  const handleSelectCustomer = (customer) => {
    if (invoiceData.status === "pending") {
      setCustomerInfo({
        id: customer.id,
        type: "Registered Customer",
        name: customer.name,
        description: `${customer.type} customer`,
        contact: customer.email,
        hasInfo: true,
      });
      setShowCustomerList(false);
      setCustomerSearchTerm("");
    }
  };

  const handleClearCustomer = () => {
    if (invoiceData.status === "pending") {
      setCustomerInfo({
        id: null,
        type: "Guest Customer",
        name: "Guest Customer",
        description: "Walk-in customer",
        contact: "No contact information",
        hasInfo: false,
      });
    }
  };

  const handleCustomerAction = () => {
    if (customerInfo.hasInfo) {
      // Navigate to edit customer
      navigate(`/customer/edit/${customerInfo.id}`);
    } else {
      // Navigate to add customer
      navigate("/customer/add");
    }
  };

  const handleRemovePromotion = () => {
    setDiscount(null);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleConfirmPayment = async () => {
    try {
      // First update payment method if changed
      await invoiceService.updateInvoice(invoiceId, {
        payment_method: selectedPaymentMethod
      });
      
      // Then mark as paid
      const response = await invoiceService.markInvoiceAsPaid(invoiceId);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Payment confirmed successfully!');
        setTimeout(() => navigate('/invoice'), 2000);
      } else {
        setErrorMessage(response.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      setErrorMessage('Failed to confirm payment');
    }
  };

  const handleCancelTransaction = () => {
    setShowCancelModal(true);
  };

  const confirmCancelTransaction = async () => {
    try {
      // Update invoice to refunded status
      const response = await invoiceService.updateInvoice(invoiceId, {
        payment_status: 'refunded'
      });
      
      if (response.success) {
        setSuccessMessage('Transaction canceled and refunded!');
        setShowCancelModal(false);
        setTimeout(() => navigate('/invoice'), 2000);
      } else {
        setErrorMessage(response.message || 'Failed to cancel transaction');
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error('Error canceling transaction:', error);
      setErrorMessage('Failed to cancel transaction');
      setShowCancelModal(false);
    }
  };

  const handlePaymentMethodChange = async (methodId) => {
    if (invoiceData.status === "pending") {
      setSelectedPaymentMethod(methodId);
      
      // Auto-save payment method to database
      try {
        const response = await invoiceService.updateInvoice(invoiceId, {
          payment_method: methodId
        });
        
        if (response.success) {
          console.log("Payment method updated to:", methodId);
        } else {
          setErrorMessage(response.message || 'Failed to update payment method');
        }
      } catch (error) {
        console.error('Error updating payment method:', error);
        setErrorMessage('Failed to update payment method');
      }
    }
  };

  const handleProcessPayment = () => {
    console.log("Process Payment", {
      products,
      customer: customerInfo,
      discount,
      paymentMethod,
      totals: {
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: totalAmount,
      },
    });
  };

  return (
    <div className="invoice-detail-view">
      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <div>Loading invoice details...</div>
          </div>
        </div>
      )}

      <SuccessMessage
        message={successMessage}
        onClose={() => {
          setSuccessMessage("");
        }}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => {
          setErrorMessage("");
        }}
      />
      {/* Header */}
      <div className="invoice-page-header">
        <h1 className="invoice-page-title">Invoice Detail</h1>
      </div>

      {/* Main Content */}
      <div className="invoice-detail-content">
        {/* Left Side - Product List & Customer Info */}
        <div className="invoice-form-container">
          {/* Product List Section */}
          <div className="invoice-form-section">
            <div className="invoice-section-header">
              <h2 className="invoice-section-title">Product List</h2>
              <div className="invoice-items-locked">
                <span>📦 Items locked from checkout</span>
              </div>
            </div>

            <div className="invoice-product-table">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="invoice-product-info">
                          <div className="invoice-product-name">
                            {product.name}
                          </div>
                          <div className="invoice-product-category">
                            {product.category}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="invoice-quantity-readonly">
                          <span className="invoice-quantity">
                            {product.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="invoice-price">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="invoice-total">
                        ${product.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-subtotal-row">
                <span>Subtotal ({products.length} items)</span>
                <span className="invoice-subtotal-amount">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="invoice-form-section">
            <div className="invoice-section-header">
              <h2 className="invoice-section-title">Customer Information</h2>
              {invoiceData.status === "pending" && (
                <div className="invoice-customer-controls">
                  <div className="invoice-customer-search-container">
                    <FaSearch className="invoice-customer-search-icon" />
                    <input
                      type="text"
                      placeholder="Search customer by name or ID..."
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setShowCustomerList(e.target.value.length > 0);
                      }}
                      onFocus={() =>
                        setShowCustomerList(customerSearchTerm.length > 0)
                      }
                      className="invoice-customer-search-input"
                    />
                  </div>
                  <button
                    className={`invoice-customer-action-btn ${
                      customerInfo.hasInfo ? "edit" : "add"
                    }`}
                    onClick={handleCustomerAction}
                  >
                    {customerInfo.hasInfo ? (
                      <>
                        <FaEdit className="invoice-action-icon" />
                        Edit
                      </>
                    ) : (
                      <>
                        <FaPlus className="invoice-action-icon" />
                        Add New
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Customer Search Results */}
            {showCustomerList && invoiceData.status === "pending" && (
              <div className="invoice-customer-search-results">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="invoice-customer-result-item"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="invoice-customer-avatar-small">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="invoice-customer-result-details">
                      <div className="invoice-customer-result-name">
                        {customer.name}
                      </div>
                      <div className="invoice-customer-result-info">
                        {customer.id} • {customer.email}
                      </div>
                    </div>
                    <div
                      className="invoice-customer-type-badge"
                      data-type={customer.type}
                    >
                      {customer.type}
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="invoice-no-customer-results">
                    No customers found
                  </div>
                )}
              </div>
            )}

            <div className="invoice-customer-card">
              <div className="invoice-customer-avatar">
                <span>
                  {customerInfo.hasInfo
                    ? customerInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "GU"}
                </span>
              </div>
              <div className="invoice-customer-details">
                <h3 className="invoice-customer-name">{customerInfo.name}</h3>
                <p className="invoice-customer-type">
                  {customerInfo.description}
                </p>
                <p className="invoice-customer-contact">
                  {customerInfo.contact}
                </p>
              </div>
              {customerInfo.hasInfo && invoiceData.status === "pending" && (
                <button
                  className="invoice-clear-customer-btn"
                  onClick={handleClearCustomer}
                  title="Clear customer"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>

          {/* Discount & Promotion Section */}
          <div className="invoice-form-section">
            <div className="invoice-section-header">
              <h2 className="invoice-section-title">Discount & Promotion</h2>
            </div>

            {discount ? (
              <div className="invoice-discount-card">
                <div className="invoice-discount-header">
                  <div className="invoice-discount-code">
                    <span className="invoice-promo-code">{discount.code}</span>
                    <span className="invoice-promo-type">{discount.type}</span>
                  </div>
                  <div className="invoice-discount-badge">
                    {discount.percentage}% OFF
                  </div>
                </div>

                <h3 className="invoice-discount-name">{discount.name}</h3>
                <p className="invoice-discount-description">
                  {discount.description}
                </p>

                <div className="invoice-discount-validity">
                  <span>📅 {discount.validPeriod}</span>
                </div>

                {invoiceData.status === "pending" && (
                  <button
                    className="invoice-remove-promotion-btn"
                    onClick={handleRemovePromotion}
                  >
                    Remove Promotion
                  </button>
                )}
              </div>
            ) : (
              <div className="invoice-no-promotion">
                <div className="invoice-no-promotion-icon">🎫</div>
                <p className="invoice-no-promotion-text">
                  No promotion applied
                </p>
                {invoiceData.status === "pending" && (
                  <p className="invoice-no-promotion-subtitle">
                    Add a promotion to get discounts on your purchase
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Payment Summary */}
        <div className="invoice-action-panel">
          <div className="invoice-payment-summary">
            <h3 className="invoice-summary-title">Payment Summary</h3>

            <div className="invoice-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="invoice-summary-row discount">
              <span>Discount</span>
              <span className="invoice-discount-amount">-$0.00</span>
            </div>

            <div className="invoice-summary-row">
              <span>Tax (9%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>

            <div className="invoice-summary-row total">
              <span>Total Amount</span>
              <span className="invoice-total-amount">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="invoice-payment-method">
              <h4 className="invoice-method-title">Payment Method</h4>

              {invoiceData.status === "pending" ? (
                // Editable payment methods for pending invoices
                <div className="invoice-payment-options">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`invoice-payment-option ${
                        selectedPaymentMethod === method.id ? "selected" : ""
                      }`}
                      onClick={() => handlePaymentMethodChange(method.id)}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={() => handlePaymentMethodChange(method.id)}
                      />
                      <span className="invoice-payment-icon">
                        {method.icon}
                      </span>
                      <span className="invoice-payment-text">
                        {method.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                // Readonly payment method for completed/refunded invoices
                <div className="invoice-payment-readonly">
                  <div className="invoice-payment-display">
                    <span className="invoice-payment-icon">
                      {paymentMethods.find((m) => m.id === selectedPaymentMethod)
                        ?.icon || "💳"}
                    </span>
                    <span className="invoice-payment-text">
                      {selectedPaymentMethod}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons based on invoice status */}
            <div className="invoice-action-buttons">
              {invoiceData.status === "pending" ? (
                <>
                  <button
                    className="invoice-confirm-btn"
                    onClick={handleConfirmPayment}
                  >
                    ✓ Confirm Payment
                  </button>
                  <button
                    className="invoice-cancel-btn"
                    onClick={handleCancelTransaction}
                  >
                    ✗ Cancel Transaction
                  </button>
                  <button className="invoice-back-btn" onClick={handleBack}>
                    Back
                  </button>
                </>
              ) : (
                <button className="invoice-back-btn" onClick={handleBack}>
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="invoice-modal-overlay"
          onClick={() => setShowCancelModal(false)}
        >
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h3>Cancel Transaction</h3>
            </div>
            <div className="invoice-modal-content">
              <p>Are you sure you want to cancel this transaction?</p>
              <p>This action will refund the payment and cannot be undone.</p>
            </div>
            <div className="invoice-modal-actions">
              <button
                className="invoice-modal-cancel"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep Transaction
              </button>
              <button
                className="invoice-modal-confirm"
                onClick={confirmCancelTransaction}
              >
                Yes, Cancel & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
