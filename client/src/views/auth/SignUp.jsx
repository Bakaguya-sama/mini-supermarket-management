import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import apiClient from "../../services/apiClient";
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
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
    console.log("Sign up attempt:", formData);

    // Simple validation
    if (!formData.username || !formData.email || !formData.password) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const response = await apiClient.post("/auth/register/customer", payload);

      if (response && response.success) {
        // Registration successful - redirect user to Sign In (do not auto-login)
        // Optionally show a message on Sign In page in future enhancements
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setSuccessMessage("Sign up successfully!");
        navigate("/signin");
      } else {
        setErrorMessage(response?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      let msg = "An error occurred. Please try again.";
      if (typeof err === "string") msg = err;
      else if (err?.message) msg = err.message;
      else if (err?.data?.message) msg = err.data.message;
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
      <SuccessMessage
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />
      <div className="signup-card">
        <Logo />

        <form onSubmit={handleSubmit} className="signup-form">
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
            <label className="form-label">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              icon="✉️"
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              icon="🔒"
              required
            />
          </div>

          <Button
            type="submit"
            size="large"
            className="signup-button"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <div className="signup-footer">
          <span className="footer-text">Already have an account? </span>
          <a href="/signin" className="contact-admin">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
