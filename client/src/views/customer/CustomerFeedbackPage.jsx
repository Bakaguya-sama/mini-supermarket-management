import React, { useState, useEffect } from "react";
import { FaStar, FaPaperPlane, FaSmile, FaMeh, FaFrown } from "react-icons/fa";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import feedbackService from "../../services/feedbackService";
import { customerService } from "../../services/customerService";
import "./CustomerFeedbackPage.css";

const CustomerFeedbackPage = () => {
  // Demo customer ID (since login is not implemented yet)
  const DEMO_CUSTOMER_ID = "693eb4f8426223a311761459"; // Võ Thị Hoa - Gold Member

  const [feedbackType, setFeedbackType] = useState("complaint");
  const [rating, setRating] = useState(0);
  const [sentiment, setSentiment] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [customerData, setCustomerData] = useState(null);
  const [pastFeedbacks, setPastFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load customer data and past feedbacks on mount
  useEffect(() => {
    loadCustomerData();
    loadPastFeedbacks();
  }, []);

  const loadCustomerData = async () => {
    try {
      const result = await customerService.getById(DEMO_CUSTOMER_ID);
      if (result.success && result.data) {
        setCustomerData(result.data);
        // Pre-fill form with customer data
        setFormData({
          name: result.data.account_id?.full_name || "",
          email: result.data.account_id?.email || "",
          subject: "",
          message: "",
        });
        console.log('✅ Customer data loaded:', result.data);
      } else {
        console.warn('⚠️ No customer data found');
      }
    } catch (error) {
      console.error('❌ Error loading customer:', error);
    }
  };

  const loadPastFeedbacks = async () => {
    try {
      setLoading(true);
      const result = await feedbackService.getCustomerFeedbacks(DEMO_CUSTOMER_ID);
      if (result.success && result.data) {
        setPastFeedbacks(result.data);
        console.log(`✅ Loaded ${result.data.length} past feedbacks`);
      }
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading past feedbacks:', error);
      setLoading(false);
    }
  };

  const feedbackTypes = [
    { value: "complaint", label: "Complaint", uiLabel: "Complaint" },
    { value: "suggestion", label: "Suggestion", uiLabel: "Suggestion" },
    { value: "praise", label: "Praise", uiLabel: "Praise" },
  ];

  // Map UI feedback types to backend category
  const getFeedbackCategory = (type) => {
    const mapping = {
      "general": "suggestion",
      "product": "complaint",
      "service": "praise",
      "delivery": "complaint",
      "website": "suggestion",
      "complaint": "complaint",
      "suggestion": "suggestion",
      "praise": "praise"
    };
    return mapping[type] || "suggestion";
  };

  const sentiments = [
    { value: "positive", label: "Great", icon: FaSmile, color: "#22c55e" },
    { value: "neutral", label: "Okay", icon: FaMeh, color: "#f59e0b" },
    { value: "negative", label: "Poor", icon: FaFrown, color: "#ef4444" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!sentiment) {
      setErrorMessage("Please select your experience rating");
      return;
    }
    if (rating === 0) {
      setErrorMessage("Please provide a star rating");
      return;
    }
    if (!formData.subject.trim()) {
      setErrorMessage("Please provide a subject");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage("Please share your feedback details");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      // Prepare feedback data for API
      const feedbackData = {
        category: getFeedbackCategory(feedbackType),
        subject: formData.subject.trim(),
        detail: formData.message.trim(),
        customer_id: DEMO_CUSTOMER_ID,
        rating: rating,
        sentiment: sentiment
      };

      console.log('📤 Submitting feedback:', feedbackData);

      // Submit feedback via API
      const result = await feedbackService.create(feedbackData);

      if (result.success) {
        // Show success message with bonus points info
        const bonusMsg = result.bonusPoints > 0 
          ? ` You've earned ${result.bonusPoints} bonus points!` 
          : '';
        setSuccessMessage(`Thank you for your feedback! We appreciate your input.${bonusMsg}`);
        
        // Reset form
        setFormData({ 
          ...formData, 
          subject: "", 
          message: "" 
        });
        setRating(0);
        setSentiment("");
        setFeedbackType("complaint");

        // Reload past feedbacks to show the new one
        setTimeout(() => {
          loadPastFeedbacks();
        }, 500);

        console.log('✅ Feedback submitted successfully:', result);
      } else {
        setErrorMessage(result.message || 'Failed to submit feedback. Please try again.');
        console.error('❌ Feedback submission failed:', result.message);
      }
    } catch (error) {
      setErrorMessage('An error occurred while submitting feedback. Please try again.');
      console.error('❌ Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
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
            <button 
              type="submit" 
              className="submit-feedback-btn"
              disabled={submitting}
            >
              <FaPaperPlane />
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Past Feedbacks Section */}
        {pastFeedbacks.length > 0 && (
          <div className="past-feedbacks-section">
            <h3>Your Previous Feedback</h3>
            <div className="feedbacks-list">
              {pastFeedbacks.map((feedback) => (
                <div key={feedback._id} className="feedback-card">
                  <div className="feedback-card-header">
                    <span className={`feedback-category ${feedback.category}`}>
                      {feedback.category === 'complaint' && '⚠️ Complaint'}
                      {feedback.category === 'suggestion' && '💡 Suggestion'}
                      {feedback.category === 'praise' && '⭐ Praise'}
                    </span>
                    <span className={`feedback-status ${feedback.status}`}>
                      {feedback.status === 'open' && '🔵 Open'}
                      {feedback.status === 'in_progress' && '🟡 In Progress'}
                      {feedback.status === 'resolved' && '✅ Resolved'}
                      {feedback.status === 'closed' && '⚫ Closed'}
                    </span>
                  </div>
                  <h4>{feedback.subject}</h4>
                  <p>{feedback.detail}</p>
                  <div className="feedback-card-footer">
                    <span className="feedback-date">
                      {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {feedback.assigned_to_staff_id && (
                      <span className="feedback-assigned">
                        📋 Assigned to {feedback.assigned_to_staff_id.account_id?.full_name || 'Staff'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
