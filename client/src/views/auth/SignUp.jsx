import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    //TODO: Check if the entered username had been existed. This username had been existed in the system. Please choose another username.

    // Navigate to sign in after successful registration
    navigate("/auth/signin");
  };

  return (
    <div className="signup-container">
      <ErrorMessage
        message={errorMessage}
        onClose={() => setErrorMessage("")}
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

          <Button type="submit" size="large" className="signup-button">
            Sign Up
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
