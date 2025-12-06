import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import useAuth from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import SuccessNotification from "../../components/Notification/SuccessNotification";
import ErrorNotification from "../../components/Notification/ErrorNotification";
import "./SignIn.css";

// Sample user accounts for different roles
const SAMPLE_ACCOUNTS = {
  // Manager accounts
  admin: {
    password: "admin123",
    role: "manager",
    name: "Admin Manager",
    type: "staff",
  },
  manager: {
    password: "manager123",
    role: "manager",
    name: "Store Manager",
    type: "staff",
  },
  // Delivery staff accounts
  delivery: {
    password: "delivery123",
    role: "delivery_staff",
    name: "John Delivery",
    type: "staff",
  },
  "john.delivery": {
    password: "delivery123",
    role: "delivery_staff",
    name: "John Smith",
    type: "staff",
  },
  // Merchandise supervisor accounts
  merchandise: {
    password: "merchandise123",
    role: "merchandise_supervisor",
    name: "Sarah Merchandise",
    type: "staff",
  },
  "sarah.merch": {
    password: "merch123",
    role: "merchandise_supervisor",
    name: "Sarah Wilson",
    type: "staff",
  },
  // Warehouse staff accounts
  warehouse: {
    password: "warehouse123",
    role: "warehouse_staff",
    name: "Mike Warehouse",
    type: "staff",
  },
  "mike.warehouse": {
    password: "warehouse123",
    role: "warehouse_staff",
    name: "Mike Johnson",
    type: "staff",
  },
  // Cashier accounts
  cashier: {
    password: "cashier123",
    role: "cashier",
    name: "Emma Cashier",
    type: "staff",
  },
  "emma.cash": {
    password: "cashier123",
    role: "cashier",
    name: "Emma Davis",
    type: "staff",
  },
  // Customer accounts
  customer1: {
    password: "customer123",
    role: "customer",
    name: "Regular Customer",
    type: "customer",
  },
};

const SignIn = () => {
  const [activeTab, setActiveTab] = useState("customer");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError, successNotification, errorNotification } =
    useNotification();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.username || !formData.password) {
      showError("Validation Error", "Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting login with:", formData.username);
      const result = await login(formData.username, formData.password);
      console.log("Login result:", result);
      showSuccess("Login Successful", "Welcome back!");
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("❌ Login error caught in SignIn:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Error object:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Login failed. Please check your credentials.";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error("❌ Final error message to show:", errorMessage);
      showError("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <Logo />

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button
            type="button"
            className={`tab-button ${activeTab === "customer" ? "active" : ""}`}
            onClick={() => setActiveTab("customer")}
          >
            Customer
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === "staff" ? "active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <Input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              icon="👤"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              icon="🔒"
              required
            />
          </div>

          <div className="form-options">
            <Checkbox
              checked={formData.rememberMe}
              onChange={handleInputChange}
              label="Remember me"
              name="rememberMe"
            />
            <a href="/forget-password" className="forgot-password">
              Forget your password?
            </a>
          </div>

          <Button type="submit" size="large" className="signin-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="signin-footer">
          <span className="footer-text">Don't have account? </span>
          {activeTab === `customer` ? (
            <a href="/signup" className="contact-admin">
              Create an account
            </a>
          ) : (
            <a href="#" className="contact-admin disabled">
              Contact admin
            </a>
          )}
        </div>

        {/* Demo Accounts Information */}
        <div className="demo-accounts">
          <h4>Demo Accounts:</h4>

          {activeTab === "staff" ? (
            <div className="accounts-grid">
              <div className="account-item">
                <strong>Manager:</strong> admin / admin123
              </div>
              <div className="account-item">
                <strong>Delivery:</strong> delivery / delivery123
              </div>
              <div className="account-item">
                <strong>Merchandise:</strong> merchandise / merchandise123
              </div>
              <div className="account-item">
                <strong>Warehouse:</strong> warehouse / warehouse123
              </div>
              <div className="account-item">
                <strong>Cashier:</strong> cashier / cashier123
              </div>
            </div>
          ) : (
            <div className="accounts-grid">
              <div className="account-item">
                <strong>Customer:</strong> customer1 / customer123
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Components */}
      {successNotification.isVisible && (
        <SuccessNotification
          title={successNotification.title}
          message={successNotification.message}
          onClose={() => {}}
        />
      )}
      {errorNotification.isVisible && (
        <ErrorNotification
          title={errorNotification.title}
          message={errorNotification.message}
          onClose={() => {}}
        />
      )}
    </div>
  );
};

export default SignIn;
