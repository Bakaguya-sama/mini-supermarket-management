import React, { useState } from "react";
import { FaStar, FaPaperPlane, FaSmile, FaMeh, FaFrown } from "react-icons/fa";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import "./CustomerFeedbackPage.css";

const CustomerFeedbackPage = () => {
  const [feedbackType, setFeedbackType] = useState("general");
  const [rating, setRating] = useState(0);
  const [sentiment, setSentiment] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const feedbackTypes = [
    { value: "general", label: "General Feedback" },
    { value: "product", label: "Product Quality" },
    { value: "service", label: "Customer Service" },
    { value: "delivery", label: "Delivery Experience" },
    { value: "website", label: "Website/App" },
  ];

  const sentiments = [
    { value: "positive", label: "Great", icon: FaSmile, color: "#22c55e" },
    { value: "neutral", label: "Okay", icon: FaMeh, color: "#f59e0b" },
    { value: "negative", label: "Poor", icon: FaFrown, color: "#ef4444" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sentiment) {
      setErrorMessage("Please select your experience rating");
      return;
    }
    if (rating === 0) {
      setErrorMessage("Please provide a star rating");
      return;
    }
    setSuccessMessage("Thank you for your feedback! We appreciate your input.");
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" });
    setRating(0);
    setSentiment("");
    setFeedbackType("general");
  };

  return (
    <div className="customer-feedback">
      <div className="customer-feedback-container">
        {/* Header */}
        <div className="feedback-header">
          <h2>We'd Love Your Feedback!</h2>
          <p>Help us improve your shopping experience</p>
        </div>

        {/* Feedback Form */}
        <div className="feedback-form-card">
          <form onSubmit={handleSubmit}>
            {/* Sentiment Selection */}
            <div className="form-section">
              <label className="section-label">How was your experience?</label>
              <div className="sentiment-buttons">
                {sentiments.map((item) => {
                  const SentimentIcon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`sentiment-btn ${
                        sentiment === item.value ? "active" : ""
                      }`}
                      onClick={() => setSentiment(item.value)}
                      style={{
                        borderColor:
                          sentiment === item.value ? item.color : "#e5e7eb",
                        background:
                          sentiment === item.value
                            ? `${item.color}15`
                            : "white",
                      }}
                    >
                      <SentimentIcon style={{ color: item.color }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div className="form-section">
              <label className="section-label">
                Rate your overall experience
              </label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= rating ? "active" : ""}`}
                    onClick={() => setRating(star)}
                  >
                    <FaStar />
                  </button>
                ))}
                <span className="rating-text">
                  {rating > 0 ? `${rating} out of 5 stars` : "Click to rate"}
                </span>
              </div>
            </div>

            {/* Feedback Type */}
            <div className="form-section">
              <label className="section-label">Feedback Category</label>
              <div className="feedback-type-grid">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`type-btn ${
                      feedbackType === type.value ? "active" : ""
                    }`}
                    onClick={() => setFeedbackType(type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="form-grid">
              <div className="customer-form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="customer-form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div className="customer-form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of your feedback"
                required
              />
            </div>

            {/* Message */}
            <div className="customer-form-group">
              <label htmlFor="message">Your Feedback</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                placeholder="Tell us more about your experience..."
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-feedback-btn">
              <FaPaperPlane />
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="feedback-info">
          <h3>Why Your Feedback Matters</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">💬</div>
              <div className="info-text">
                <h4>We Listen</h4>
                <p>Every piece of feedback is reviewed by our team</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">🔄</div>
              <div className="info-text">
                <h4>Continuous Improvement</h4>
                <p>Your input helps us enhance our services</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">🎁</div>
              <div className="info-text">
                <h4>Earn Rewards</h4>
                <p>Get 50 bonus points for detailed feedback</p>
              </div>
            </div>
          </div>
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

export default CustomerFeedbackPage;
