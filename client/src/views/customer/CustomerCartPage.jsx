import React, { useState, useEffect } from "react";
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
import { cartService } from "../../services/cartService";
import promotionService from "../../services/promotionService";
import orderService from "../../services/orderService";
import "./CustomerCartPage.css";

const CustomerCartPage = ({
  customerId, // NEW: Customer ID for API calls
  cartItems, // Will be synced with backend
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onCheckout,
  membershipPoints,
  onCartLoaded, // NEW: Callback to update parent with backend cart
}) => {
  // API states
  const [backendCart, setBackendCart] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  
  // UI states
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showAllPromotions, setShowAllPromotions] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load cart when customerId is available
  useEffect(() => {
    if (customerId) {
      loadCart();
    }
  }, [customerId]);

  // Load promotions when cart loads or items change
  useEffect(() => {
    if (cartItems.length > 0) {
      loadApplicablePromotions();
    } else {
      setAvailablePromotions([]);
    }
  }, [cartItems]);

  /**
   * Load cart from backend for current customer
   */
  const loadCart = async () => {
    setIsLoading(true);
    try {
      console.log(`🛒 Loading cart for customer: ${customerId}`);
      const result = await cartService.getCartByCustomer(customerId);

      if (result.success && result.data) {
        setBackendCart(result.data);
        setCartId(result.data._id);
        
        // Transform backend cart items to UI format
        const uiCartItems = (result.data.cartItems || []).map(item => ({
          id: item.product_id?._id || item._id,
          cartItemId: item._id, // Store cart item ID for updates
          name: item.product_name || item.product_id?.name,
          category: item.product_id?.category || 'General',
          price: item.unit_price,
          quantity: item.quantity,
          image: item.product_id?.image_link || "https://placehold.co/100x100/e2e8f0/64748b?text=No+Image",
          unit: item.unit,
          sku: item.sku
        }));

        // Update parent component with cart items
        if (onCartLoaded) {
          onCartLoaded(uiCartItems);
        }

        console.log(`✅ Cart loaded with ${uiCartItems.length} items`);
      } else {
        setErrorMessage(result.message || 'Failed to load cart');
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      setErrorMessage('Failed to load cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load applicable promotions from backend based on cart subtotal
   */
  const loadApplicablePromotions = async () => {
    try {
      const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      console.log(`🎁 Loading applicable promotions for subtotal: $${subtotal}`);
      const result = await promotionService.getApplicablePromotions(subtotal);

      if (result.success && result.data) {
        // Transform backend promotions to UI format
        const formattedPromotions = result.data.map(promo => ({
          id: promo.id,
          code: promo.code,
          discount: promo.type === 'percentage' ? promo.discountValue / 100 : 0,
          discountAmount: promo.discountAmount, // Calculated discount in dollars
          description: promo.description,
          type: promo.type, // 'percentage' or 'fixed'
          discountValue: promo.discountValue,
          minOrder: promo.minPurchase,
          validUntil: new Date(promo.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          terms: promo.terms
        }));

        setAvailablePromotions(formattedPromotions);
        console.log(`✅ Loaded ${formattedPromotions.length} applicable promotions`);
      }
    } catch (error) {
      console.error('❌ Error loading promotions:', error);
      // Don't show error to user, just use empty promotions list
      setAvailablePromotions([]);
    }
  };

  /**
   * Update item quantity in backend
   */
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (!cartItemId) {
      console.error('❌ No cart item ID provided');
      return;
    }

    try {
      console.log(`🛒 Updating quantity for item ${cartItemId} to ${newQuantity}`);
      
      if (newQuantity <= 0) {
        // Remove item if quantity is 0
        await handleRemoveItem(cartItemId);
        return;
      }

      const result = await cartService.updateQuantity(cartItemId, newQuantity);

      if (result.success) {
        setSuccessMessage('Cart updated!');
        await loadCart(); // Reload cart to sync
      } else {
        setErrorMessage(result.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      setErrorMessage('Failed to update quantity. Please try again.');
    }
  };

  /**
   * Remove item from cart
   */
  const handleRemoveItem = async (cartItemId) => {
    if (!cartItemId) {
      console.error('❌ No cart item ID provided');
      return;
    }

    try {
      console.log(`🛒 Removing item: ${cartItemId}`);
      const result = await cartService.removeItem(cartItemId);

      if (result.success) {
        setSuccessMessage('Item removed from cart');
        await loadCart(); // Reload cart to sync
      } else {
        setErrorMessage(result.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('❌ Error removing item:', error);
      setErrorMessage('Failed to remove item. Please try again.');
    }
  };

  /**
   * Clear entire cart
   */
  const handleClearAllItems = async () => {
    if (!cartId) {
      console.error('❌ No cart ID available');
      return;
    }

    try {
      console.log(`🛒 Clearing cart: ${cartId}`);
      const result = await cartService.clearCart(cartId);

      if (result.success) {
        setSuccessMessage('Cart cleared!');
        await loadCart(); // Reload cart to sync
      } else {
        setErrorMessage(result.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      setErrorMessage('Failed to clear cart. Please try again.');
    }
  };

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
  
  // Calculate promo discount (supports both percentage and fixed)
  let promoDiscount = 0;
  if (selectedPromo) {
    if (selectedPromo.type === 'percentage') {
      promoDiscount = subtotal * selectedPromo.discount;
    } else if (selectedPromo.type === 'fixed') {
      promoDiscount = Math.min(selectedPromo.discountValue, subtotal);
    }
  }
  
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

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty!");
      return;
    }

    try {
      setIsLoading(true);
      console.log('🛒 Starting checkout process...');

      // Prepare order notes with promotion and points info
      const orderNotes = [];
      if (selectedPromo) {
        orderNotes.push(`Promo: ${selectedPromo.code} - ${selectedPromo.description}`);
        orderNotes.push(`Discount: ${selectedPromo.type === 'percentage' ? `${selectedPromo.discountValue}%` : `$${selectedPromo.discountValue}`} = -$${promoDiscount.toFixed(2)}`);
      }
      if (pointsToRedeem > 0) {
        orderNotes.push(`Points Redeemed: ${pointsToRedeem} points = -$${pointsDiscount.toFixed(2)}`);
      }

      // Create order from cart
      const result = await orderService.createOrder({
        customer_id: customerId,
        cart_id: cartId,
        notes: orderNotes.length > 0 ? orderNotes.join(' | ') : 'No discounts applied'
      });

      if (result.success) {
        setSuccessMessage(`Order placed successfully! Total: $${total.toFixed(2)}`);
        console.log('✅ Order created:', result.data);
        console.log(`💰 Original: $${subtotal.toFixed(2)} → Final: $${total.toFixed(2)} (Saved: $${(subtotal - total).toFixed(2)})`);
        
        // TODO: Deduct points from customer balance (will be handled by backend later)
        if (pointsToRedeem > 0) {
          console.log(`🎁 ${pointsToRedeem} points redeemed (to be deducted from customer)`);
        }
        
        // Clear cart UI
        setSelectedPromo(null);
        setPointsToRedeem(0);
        
        // Reload cart (should be empty after checkout)
        await loadCart();
        
        // Call parent callback
        if (onCheckout) {
          onCheckout(result.data);
        }
      } else {
        setErrorMessage(result.message || 'Failed to create order');
        console.error('❌ Checkout failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Error during checkout:', error);
      setErrorMessage('Failed to complete checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="customer-cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

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
            <button onClick={handleClearAllItems} className="clear-cart-btn">
              <FaTrash />
              Clear Cart
            </button>
          </div>

          {/* Cart Items */}
          <div className="customer-cart-items">
            {cartItems.map((item) => (
              <div key={item.cartItemId || item.id} className="customer-cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-category">{item.category}</p>
                  <p className="cart-item-price">${item.price.toFixed(2)}{item.unit && `/${item.unit}`}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.cartItemId)}
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
                          {promo.type === 'percentage' 
                            ? `${promo.discountValue}% OFF`
                            : `$${promo.discountValue.toFixed(0)} OFF`
                          }
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
