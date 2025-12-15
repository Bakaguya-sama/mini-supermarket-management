import React, { useState } from "react";
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
import "./CustomerPortal.css";

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("shop");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [customerName] = useState("John Smith");
  const [membershipPoints] = useState(1250);

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

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
        {activeView === "cart" && (
          <CustomerCartPage
            cartItems={cartItems}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onCheckout={() => setActiveView("orders")}
            membershipPoints={membershipPoints}
          />
        )}
        {activeView === "orders" && <CustomerOrdersPage />}
        {activeView === "profile" && <CustomerProfilePage />}
        {activeView === "membership" && (
          <CustomerMembershipPage membershipPoints={membershipPoints} />
        )}
        {activeView === "feedback" && <CustomerFeedbackPage />}
      </main>
    </div>
  );
};

export default CustomerPortal;
