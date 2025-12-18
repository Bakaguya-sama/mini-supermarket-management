import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaBox,
  FaUser,
  FaGift,
  FaComment,
  FaStore,
  FaSignOutAlt,
} from "react-icons/fa";
import CustomerShopPage from "./CustomerShopPage";
import CustomerCartPage from "./CustomerCartPage";
import CustomerOrdersPage from "./CustomerOrdersPage";
import CustomerProfilePage from "./CustomerProfilePage";
import CustomerMembershipPage from "./CustomerMembershipPage";
import CustomerFeedbackPage from "./CustomerFeedbackPage";
import CustomerProductDetailPage from "./CustomerProductDetailPage";
import Logo from "../../components/ui/Logo";
import apiClient from "../../services/apiClient";
import { cartService } from "../../services/cartService";
import "./CustomerPortal.css";

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("shop");
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Demo customer ID (first customer from seed data - will be replaced with real login later)
  const [customerId, setCustomerId] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [cartId, setCartId] = useState(null); // Cart ID for backend operations
  const [customerName, setCustomerName] = useState("Loading...");
  const [membershipPoints, setMembershipPoints] = useState(0);
  
  // Cart states (for badge count)
  const [cartItems, setCartItems] = useState([]);

  // Load demo customer ID on mount
  useEffect(() => {
    loadDemoCustomer();
  }, []);

  /**
   * Load first customer from database as demo customer
   * (Will be replaced with real authentication later)
   */
  const loadDemoCustomer = async () => {
    try {
      console.log('👤 Loading demo customer...');
      const response = await apiClient.get('/customers', { params: { limit: 1 } });
      
      if (response.data && response.data.length > 0) {
        const firstCustomer = response.data[0];
        setCustomerId(firstCustomer._id);
        setCustomerData(firstCustomer);
        
        // Set customer info
        setCustomerName(firstCustomer.account_id?.full_name || 'Guest Customer');
        setMembershipPoints(firstCustomer.points_balance || 0);
        
        console.log(`✅ Loaded customer: ${firstCustomer.account_id?.full_name}`);
        console.log(`💎 Points balance: ${firstCustomer.points_balance || 0}`);
        
        // Load cart for this customer
        await loadCustomerCart(firstCustomer._id);
      } else {
        console.error('❌ No customers found in database');
      }
    } catch (error) {
      console.error('❌ Error loading demo customer:', error);
    }
  };

  /**
   * Load cart for customer (auto-creates if not exists)
   */
  const loadCustomerCart = async (customerId) => {
    try {
      console.log('🛒 Loading cart for customer:', customerId);
      const result = await cartService.getCartByCustomer(customerId);
      
      if (result.success && result.data) {
        setCartId(result.data._id);
        console.log('✅ Cart loaded:', result.data._id);
        
        // Transform cart items to UI format
        const uiCartItems = (result.data.cartItems || []).map(item => ({
          id: item.product_id?._id || item._id,
          cartItemId: item._id,
          name: item.product_name || item.product_id?.name,
          category: item.product_id?.category || 'General',
          price: item.unit_price,
          quantity: item.quantity,
          image: item.product_id?.image_link || "https://placehold.co/100x100/e2e8f0/64748b?text=No+Image",
          unit: item.unit,
          sku: item.sku
        }));
        
        setCartItems(uiCartItems);
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
    }
  };

  /**
   * Add product to cart (backend API call)
   */
  const handleAddToCart = async (product) => {
    if (!cartId) {
      console.error('❌ No cart ID available');
      return;
    }

    try {
      console.log('🛒 Adding product to cart:', product);
      const result = await cartService.addItem(
        cartId, 
        product.id, 
        product.quantity || 1
      );

      if (result.success) {
        console.log('✅ Product added to cart');
        // Reload cart to sync with backend
        await loadCustomerCart(customerId);
      } else {
        console.error('❌ Failed to add product to cart:', result.message);
      }
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
    }
  };

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleUpdateCartItem = (id, quantity) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleViewProduct = (productId) => {
    setSelectedProductId(productId);
    setActiveView("product-detail");
  };

  const handleBackToShop = () => {
    setSelectedProductId(null);
    setActiveView("shop");
  };

  const handleCheckout = async () => {
    // Switch to orders view
    setActiveView("orders");
    
    // Reload customer data to get updated points balance
    if (customerId) {
      await loadCustomerCart(customerId);
      
      // Reload customer info to update points
      try {
        const response = await apiClient.get(`/customers/${customerId}`);
        if (response.data) {
          setCustomerData(response.data);
          setMembershipPoints(response.data.points_balance || 0);
          console.log(`💎 Updated points balance: ${response.data.points_balance || 0}`);
        }
      } catch (error) {
        console.error('❌ Error reloading customer data:', error);
      }
    }
  };

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUsername");
    localStorage.removeItem("isLoggedIn");

    // Clear cart items
    setCartItems([]);

    // Redirect to sign in page
    navigate("/signin");
  };

  const navItems = [
    { id: "shop", label: "Shop", icon: FaStore },
    { id: "cart", label: "Cart", icon: FaShoppingCart, badge: cartItemCount },
    { id: "orders", label: "My Orders", icon: FaBox },
    { id: "membership", label: "Membership", icon: FaGift },
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "feedback", label: "Feedback", icon: FaComment },
  ];

  return (
    <div className="customer-portal">
      {/* Header */}
      <header className="customer-header">
        <div className="customer-header-content">
          <div className="customer-header-left">
            <Logo size="small" layout="horizontal" />
          </div>
          <div className="customer-header-right">
            <div className="customer-user-info">
              <div className="customer-user-name">{customerName}</div>
              <div className="customer-user-points">
                {membershipPoints} Points
              </div>
            </div>
            <button className="customer-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="customer-nav">
        <div className="customer-nav-content">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`customer-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="customer-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="customer-main">
        {activeView === "shop" && (
          <CustomerShopPage
            onAddToCart={handleAddToCart}
            onViewCart={() => setActiveView("cart")}
            onViewProduct={handleViewProduct}
          />
        )}
        {activeView === "product-detail" && (
          <CustomerProductDetailPage
            key={selectedProductId}
            productId={selectedProductId}
            onBack={handleBackToShop}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
          />
        )}
        {activeView === "cart" && customerId && (
          <CustomerCartPage
            customerId={customerId}
            cartItems={cartItems}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            membershipPoints={membershipPoints}
            onCartLoaded={setCartItems}
          />
        )}
        {activeView === "orders" && customerId && <CustomerOrdersPage customerId={customerId} />}
        {activeView === "profile" && customerId && (
          <CustomerProfilePage customerId={customerId} customerData={customerData} />
        )}
        {activeView === "membership" && customerId && (
          <CustomerMembershipPage 
            customerId={customerId} 
            customerData={customerData}
            membershipPoints={membershipPoints} 
          />
        )}
        {activeView === "feedback" && <CustomerFeedbackPage />}
      </main>
    </div>
  );
};

export default CustomerPortal;
