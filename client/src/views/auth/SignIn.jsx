import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import ErrorMessage from "../../components/Messages/ErrorMessage";
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
  // Load remembered credentials from localStorage
  const getRememberedCredentials = () => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedUsername && rememberedPassword) {
      return {
        username: rememberedUsername,
        password: rememberedPassword,
        rememberMe: true,
      };
    }

    return {
      username: "",
      password: "",
      rememberMe: false,
    };
  };

  const getRememberedTab = () => {
    return localStorage.getItem("rememberedTab") || "customer";
  };

  const [activeTab, setActiveTab] = useState(getRememberedTab);
  const [formData, setFormData] = useState(getRememberedCredentials);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign in attempt:", formData);
    console.log("User type:", activeTab);

    // Simple validation
    if (!formData.username || !formData.password) {
      setErrorMessage("Please enter username and password");
      return;
    }

    // Check against sample accounts
    const account = SAMPLE_ACCOUNTS[formData.username.toLowerCase()];

    if (!account) {
      setErrorMessage(
        "Username not found. Please check your username and try again."
      );
      return;
    }

    if (account.password !== formData.password) {
      setErrorMessage("Incorrect password. Please try again.");
      return;
    }

    // Check if user type matches account type
    if (account.type !== activeTab) {
      setErrorMessage(
        `This account is for ${account.type}, please select the correct tab`
      );
      return;
    }

    // Store user data in localStorage for demo purposes
    localStorage.setItem("userRole", account.role);
    localStorage.setItem("userName", account.name);
    localStorage.setItem("userUsername", formData.username);
    localStorage.setItem("isLoggedIn", "true");

    // Handle remember me
    if (formData.rememberMe) {
      localStorage.setItem("rememberedUsername", formData.username);
      localStorage.setItem("rememberedPassword", formData.password);
      localStorage.setItem("rememberedTab", activeTab);
    } else {
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberedTab");
    }

    console.log("Login successful:", {
      username: formData.username,
      role: account.role,
      name: account.name,
      type: account.type,
    });

    // Navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="signin-container">
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
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

          <Button type="submit" size="large" className="signin-button">
            Sign In
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
    </div>
  );
};

export default SignIn;
