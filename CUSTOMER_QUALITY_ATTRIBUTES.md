# Customer Quality Attributes (UC2)

This document maps UC2 quality attributes to the backend implementation for Customer APIs.

## UC2.1 - Security: Manager adds customer account
- Activity: Manager: Add customer account
- Element: server/controllers/customerController.js, server/routes/customerRoutes.js, server/middleware/auth.js
- Strategy/Tactic: Authenticate/Authorize admin via JWT; hash password when provided; enforce email/phone uniqueness at database level.
- Implementation:
  - POST /api/customers is protected by authenticate + requireAdmin.
  - Passwords are hashed with bcrypt when provided.
  - Account email is unique by schema; phone is unique via index.

## UC2.2 - Conceptual Integrity: Manager updates customer info
- Activity: Manager: Update customer info
- Element: server/controllers/customerController.js (Update Action), server/services/CustomerService.js
- Strategy/Tactic: Accept a partial object with only modified fields.
- Implementation:
  - Update handler only applies provided fields (membership_type, notes, points_balance).

## UC2.3 - Performance: Manager searches customers
- Activity: Manager: Search customers
- Element: server/controllers/customerController.js (Search Query), server/services/CustomerService.js
- Strategy/Tactic: Query indexed columns and return paginated results (limit 20).
- Implementation:
  - Search uses Account full_name lookup with index.
  - Result pagination enforces a max limit of 20 when search is used.

## UC2.4 - Scalability: Manager views all customers
- Activity: Manager: View all customers
- Element: server/controllers/customerController.js (List Action), server/services/CustomerService.js
- Strategy/Tactic: Use database COUNT for totals instead of in-memory counting.
- Implementation:
  - Total count uses countDocuments alongside paged list retrieval.
