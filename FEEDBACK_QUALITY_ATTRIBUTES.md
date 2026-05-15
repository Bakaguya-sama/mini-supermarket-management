# Feedback Quality Attributes (UC7, UC21)

This document maps feedback-related quality attributes to backend implementation.

## UC7.1 - Usability: Customer submit feedback
- Activity: Customer: Submit feedback
- Element: server/controllers/feedbackController.js, server/routes/feedbackRoutes.js
- Strategy/Tactic: Sanitize user comments to prevent XSS and return a confirmation with a trackable reference number.
- Implementation:
  - Input fields are sanitized before persistence.
  - Response includes `reference_code` using the feedback ID.

## UC21.4 - Maintainability: Customer rate order
- Activity: Customer: Rate order
- Element: server/controllers/feedbackController.js
- Strategy/Tactic: Isolate responsibilities by storing ratings in a separate OrderFeedback collection; only allow rating when Order status is Delivered.
- Implementation:
  - When `order_id` and `rating` are provided, the order must exist, belong to the customer, and be `delivered`.
  - Rating is stored in `OrderFeedback`, linked to the feedback record.
