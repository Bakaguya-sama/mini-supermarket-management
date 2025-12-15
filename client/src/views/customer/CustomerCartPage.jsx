import React, { useState } from "react";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaTag,
  FaGift,
} from "react-icons/fa";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import "./CustomerCartPage.css";

const CustomerCartPage = ({
  cartItems,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onCheckout,
  membershipPoints,
}) => {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showAllPromotions, setShowAllPromotions] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const availablePromotions = [
    {
      id: 1,
      code: "WEEKEND20",
      discount: 0.2,
      description: "20% off on all fresh produce",
      category: "Fresh Produce",
      validUntil: "Nov 10, 2025",
    },
    {
      id: 2,
      code: "SAVE15",
      discount: 0.15,
      description: "15% off on orders over $50",
      minOrder: 50,
      validUntil: "Dec 31, 2025",
    },
    {
      id: 3,
      code: "FIRST10",
      discount: 0.1,
      description: "10% off for first-time customers",
      validUntil: "Dec 31, 2025",
    },
  ];

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Filter applicable promotions (meet minOrder requirement)
  const applicablePromotions = availablePromotions
    .filter((promo) => !promo.minOrder || subtotal >= promo.minOrder)
    .sort((a, b) => b.discount - a.discount); // Sort by best discount first

  // Show only 1 by default, or all if showAllPromotions is true
  const displayedPromotions = showAllPromotions
    ? applicablePromotions
    : applicablePromotions.slice(0, 1);
  const promoDiscount = selectedPromo ? subtotal * selectedPromo.discount : 0;
  const pointsDiscount = pointsToRedeem * 0.01; // 100 points = $1
  const total = Math.max(0, subtotal - promoDiscount - pointsDiscount);

  const maxPointsRedeemable = Math.min(
    membershipPoints,
    Math.floor(subtotal * 100)
  );

  const handleSelectPromo = (promo) => {
    if (selectedPromo && selectedPromo.id === promo.id) {
      setSelectedPromo(null);
    } else {
      setSelectedPromo(promo);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty!");
      return;
    }
    setSuccessMessage(`Order placed! Total: $${total.toFixed(2)}`);
    onClearCart();
    setSelectedPromo(null);
    setPointsToRedeem(0);
    onCheckout();
  };

  if (cartItems.length === 0) {
    return (
      <div className="customer-cart-empty">
        <FaShoppingCart className="empty-cart-icon" />
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div className="customer-cart">
      <div className="customer-cart-container">
        <div className="customer-cart-main">
          {/* Header */}
          <div className="customer-cart-header">
            <h2>Shopping Cart</h2>
            <button onClick={onClearCart} className="clear-cart-btn">
              <FaTrash />
              Clear Cart
            </button>
          </div>

          {/* Cart Items */}
          <div className="customer-cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="customer-cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-category">{item.category}</p>
                  <p className="cart-item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => onUpdateItem(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateItem(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="cart-item-remove"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="customer-cart-summary">
          <h3>Order Summary</h3>

          {/* Promo Code */}
          <div className="cart-summary-section">
            <label>
              <FaTag /> Available Promotions
            </label>
            {applicablePromotions.length > 0 ? (
              <>
                <div className="promotions-list-cart">
                  {displayedPromotions.map((promo) => (
                    <div
                      key={promo.id}
                      className={`promo-card ${
                        selectedPromo && selectedPromo.id === promo.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectPromo(promo)}
                    >
                      <div className="promo-card-header">
                        <div className="promo-discount-badge">
                          {Math.round(promo.discount * 100)}% OFF
                        </div>
                        <div className="promo-code-label">{promo.code}</div>
                      </div>
                      <div className="promo-card-description">
                        {promo.description}
                      </div>
                      <div className="promo-card-footer">
                        {promo.category && (
                          <span className="promo-category">
                            {promo.category}
                          </span>
                        )}
                        {promo.minOrder && (
                          <span className="promo-min-order">
                            Min: ${promo.minOrder}
                          </span>
                        )}
                        <span className="promo-validity">
                          Valid until {promo.validUntil}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {applicablePromotions.length > 1 && (
                  <button
                    className="view-more-promos-btn"
                    onClick={() => setShowAllPromotions(!showAllPromotions)}
                  >
                    {showAllPromotions
                      ? "Show Less"
                      : `View More (${applicablePromotions.length - 1} more)`}
                  </button>
                )}
              </>
            ) : (
              <div className="no-promotions">
                <p>No promotions available for your current order</p>
              </div>
            )}
          </div>

          {/* Points Redemption */}
          <div className="cart-summary-section">
            <label>
              <FaGift /> Redeem Points
            </label>
            <p className="points-info">
              You have {membershipPoints} points (Max: {maxPointsRedeemable})
            </p>
            <div className="points-input-group">
              <input
                type="number"
                min="0"
                max={maxPointsRedeemable}
                value={pointsToRedeem}
                onChange={(e) => {
                  const value = Math.min(
                    maxPointsRedeemable,
                    Math.max(0, parseInt(e.target.value) || 0)
                  );
                  setPointsToRedeem(value);
                }}
              />
              <span className="points-value">
                = ${(pointsToRedeem * 0.01).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="cart-summary-breakdown">
            <div className="breakdown-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {selectedPromo && (
              <div className="breakdown-row discount">
                <span>Promo Discount ({selectedPromo.code})</span>
                <span>-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            {pointsToRedeem > 0 && (
              <div className="breakdown-row discount">
                <span>Points Discount</span>
                <span>-${pointsDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="breakdown-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={handleCheckout} className="checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
    </div>
  );
};

export default CustomerCartPage;
