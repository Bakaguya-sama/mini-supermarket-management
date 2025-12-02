import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state directly from localStorage to avoid setState in useEffect
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "manager";
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("userName") || "User";
  });

  // Handle authentication check and redirect
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // Redirect to signin if not logged in
    if (!isLoggedIn && location.pathname !== "/signin") {
      navigate("/signin");
    }
  }, [navigate, location.pathname]);

  // Calculate active menu item based on current path (no state needed)
  const getActiveMenuItem = () => {
    const path = location.pathname;

    // Handle staff sub-routes (add, edit, etc.)
    if (path.startsWith("/staff")) {
      return "staff";
    }

    // Handle goods sub-routes
    if (path.startsWith("/products") || path.startsWith("/inventory")) {
      // Return different menu item id based on user role
      return userRole === "warehouse_staff" ? "inventory" : "products";
    }

    // Handle promotion sub-routes
    if (path.startsWith("/promotion")) {
      return "promotion";
    }

    // Handle report sub-routes
    if (path.startsWith("/report")) {
      return "report";
    }

    // Delivery staff
    if (path.startsWith("/assigned-orders")) return "assigned-orders";

    if (path.startsWith("/order-history")) return "order-history";

    // Merchandise supervisor
    if (path.startsWith("/damaged-product")) return "damaged-product";
    if (path.startsWith("/shelf-product")) return "shelf-product";

    // Cashier
    if (path.startsWith("/customer")) return "customer";
    if (path.startsWith("/invoice")) return "invoice";

    // Map exact paths to menu items
    const pathToMenuItem = {
      "/dashboard": "dashboard",
      "/instruction": "instruction",
      "/supplier": "supplier",
      "/profile": "profile",
      "/settings": "settings",
      "/help": "help",
    };

    return pathToMenuItem[path] || "dashboard";
  };

  const activeMenuItem = getActiveMenuItem();

  const handleMenuItemClick = (item) => {
    if (item.action === "signout") {
      // Handle sign out
      navigate("/signin");
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSearch = (searchTerm) => {
    console.log("Searching for:", searchTerm);
    // Implement search functionality here
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    navigate("/profile");
  };

  const handleSignOut = () => {
    console.log("Sign out clicked");
    // Clear stored authentication data
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userUsername");
    localStorage.removeItem("isLoggedIn");
    navigate("/signin");
  };

  return (
    <div className="layout">
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        userRole={userRole}
      />
      <div className="layout-content">
        <Header
          userName={userName}
          userRole={userRole}
          onSearch={handleSearch}
          onProfileClick={handleProfileClick}
          onSignOut={handleSignOut}
        />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
