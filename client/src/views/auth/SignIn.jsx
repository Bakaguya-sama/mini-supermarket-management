import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import apiClient from "../../services/apiClient";
import "./SignIn.css";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sign in attempt:", formData);
    console.log("User type:", activeTab);

    // Simple validation
    if (!formData.username || !formData.password) {
      setErrorMessage("Please enter username and password");
      return;
    }

    try {
      // Call backend API
      const response = await apiClient.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      });

      console.log("Full response:", response);
      console.log("Success flag:", response.success);

      // apiClient interceptor already unwraps response.data, so response = response.data
      if (response.success) {
        const { token, user } = response.data;

        console.log("Login successful:", user);
        console.log("User role:", user.role, "Active tab:", activeTab);

        // Check if user type matches selected tab
        if (user.role === "customer" && activeTab !== "customer") {
          setErrorMessage(
            "This is a customer account. Please select the Customer tab."
          );
          return;
        }
        if (
          (user.role === "staff" || user.role === "admin") &&
          activeTab !== "staff"
        ) {
          setErrorMessage(
            "This is a staff/admin account. Please select the Staff tab."
          );
          return;
        }

        console.log("Role validation passed, storing data...");

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userName", user.full_name || user.username);
        localStorage.setItem("userUsername", user.username);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("isLoggedIn", "true");

        // Store additional data based on role
        if (user.role === "customer") {
          localStorage.setItem("customerId", user.customer_id);
          localStorage.setItem(
            "membershipType",
            user.membership_type || "basic"
          );
          localStorage.setItem("pointsBalance", user.points_balance || 0);
        } else if (user.role === "staff" || user.role === "admin") {
          localStorage.setItem("staffId", user.staff_id || "");
          localStorage.setItem("position", user.position || "");
          localStorage.setItem("isManager", user.is_manager || false);

          // Store manager-specific data if exists
          if (user.is_manager) {
            localStorage.setItem("managerId", user.manager_id || "");
            localStorage.setItem("accessLevel", user.access_level || "");
            localStorage.setItem("isSuperuser", user.is_superuser || false);
          }
        }

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

        // Set token to axios default headers for future requests
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Navigate based on user role and position
        let redirectPath = "/dashboard"; // default

        if (user.role === "customer") {
          redirectPath = "/customer-portal";
        } else if (user.role === "admin") {
          // Admin role - check if manager
          if (user.is_manager) {
            redirectPath = "/dashboard"; // Manager dashboard
          } else {
            // Admin nhưng không phải manager - điều hướng về signin
            setErrorMessage(
              "Account configuration error. Please contact administrator."
            );
            return;
          }
        } else if (user.role === "staff") {
          // Staff role - điều hướng theo position
          const position = user.position?.toLowerCase();

          if (position === "delivery" || position === "delivery staff") {
            redirectPath = "/assigned-orders";
          } else if (position === "cashier") {
            redirectPath = "/invoice";
          } else if (
            position === "merchandise supervisor" ||
            position === "supervisor" ||
            position === "merchandise"
          ) {
            redirectPath = "/shelf-product";
          } else if (
            position === "warehouse" ||
            position === "warehouse staff"
          ) {
            redirectPath = "/products";
          } else {
            // Position không xác định - mặc định dashboard
            redirectPath = "/dashboard";
          }
        }

        console.log(
          "Navigating to:",
          redirectPath,
          "| Role:",
          user.role,
          "| Position:",
          user.position,
          "| isManager:",
          user.is_manager
        );
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Login error:", error);

      // apiClient interceptor rejects with error.response.data or custom error object
      let errorMsg = "An error occurred. Please try again.";

      if (typeof error === "string") {
        errorMsg = error;
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error.error) {
        errorMsg = error.error;
      }

      setErrorMessage(errorMsg);
    }
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
          <h4>🔑 Tài khoản test:</h4>
          <div className="accounts-grid">
            <div className="account-item">
              <strong>Manager:</strong> manager1 / password123
            </div>
            <div className="account-item">
              <strong>Delivery Staff:</strong> delivery1 / password123
            </div>
            <div className="account-item">
              <strong>Cashier:</strong> cashier1 / password123
            </div>
            <div className="account-item">
              <strong>Merchandise Supervisor:</strong> supervisor1 / password123
            </div>
            <div className="account-item">
              <strong>Warehouse Staff:</strong> warehouse1 / password123
            </div>
            <div className="account-item">
              <strong>Customer:</strong> customer1 / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
