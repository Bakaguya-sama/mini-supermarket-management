import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import authService from "../../services/authService";
import "./ForgetPass.css";

const ForgetPass = () => {
  const [currentStep, setCurrentStep] = useState("email"); // "email", "verification", or "success"
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user types
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(formData.email);
      
      if (response.success) {
        setSuccessMessage(response.message);
        setCurrentStep("verification");
      } else {
        setError(response.message || "Không thể gửi mã xác thực");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi gửi mã xác thực");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyResetCode({
        email: formData.email,
        code: formData.verificationCode,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        setSuccessMessage(response.message);
        setCurrentStep("success");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      } else {
        setError(response.message || "Mã xác thực không hợp lệ");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi xác thực mã");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await authService.resendVerificationCode(formData.email);
      
      if (response.success) {
        setSuccessMessage(response.message);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(response.message || "Không thể gửi lại mã");
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi gửi lại mã");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="forget-pass-container">
      <div className="forget-pass-card">
        <Logo />

        {/* Show error message */}
        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '5px',
            color: '#c33',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Show success message */}
        {successMessage && (
          <div style={{
            padding: '10px',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '5px',
            color: '#3c3',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        {currentStep === "email" ? (
          <>
            <div className="forget-pass-header">
              <h2 className="forget-pass-title">Forgot Password</h2>
              <p className="forget-pass-subtitle">
                Enter your email address and we'll send you a verification code
                to reset your password.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="forget-pass-form">
              <div className="forget-pass-group">
                <label className="forget-pass-label">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  icon="✉️"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                size="large" 
                className="forget-pass-button"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          </>
        ) : currentStep === "verification" ? (
          <>
            <div className="forget-pass-header">
              <h2 className="forget-pass-title">Enter Verification Code</h2>
              <p className="forget-pass-subtitle">
                We've sent a verification code to{" "}
                <strong>{formData.email}</strong>
              </p>
            </div>

            <form
              onSubmit={handleVerificationSubmit}
              className="forget-pass-form"
            >
              <div className="forget-pass-group">
                <label className="forget-pass-label">Verification Code</label>
                <Input
                  type="text"
                  name="verificationCode"
                  placeholder="Enter 6-digit verification code"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  icon="🔢"
                  maxLength="6"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="forget-pass-group">
                <label className="forget-pass-label">New Password</label>
                <Input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password (min 6 characters)"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  icon="🔒"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="forget-pass-group">
                <label className="forget-pass-label">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  icon="🔒"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="forget-pass-actions">
                <Button
                  type="button"
                  size="large"
                  className="forget-pass-resend-button"
                  onClick={handleResendCode}
                  disabled={isResending || isLoading}
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </Button>

                <Button
                  type="submit"
                  size="large"
                  className="forget-pass-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="forget-pass-header">
              <div style={{
                fontSize: '48px',
                textAlign: 'center',
                margin: '20px 0'
              }}>
                ✅
              </div>
              <h2 className="forget-pass-title">Password Reset Successful!</h2>
              <p className="forget-pass-subtitle">
                Your password has been successfully reset.
                <br />
                Redirecting to login page...
              </p>
            </div>
          </>
        )}

        <div className="forget-pass-footer">
          <span className="forget-pass-footer-text">
            Remember your password?{" "}
          </span>
          <button
            type="button"
            className="forget-pass-back-link"
            onClick={handleBackToSignIn}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgetPass;
