# Cart Quality Attributes (C21)

This document maps C21 quality attributes to the backend implementation for Cart APIs.

## C21.1 - Scalability: Customer adds products to cart
- Activity: Customer: Add products to cart
- Element: server/controllers/cartController.js, server/routes/cartRoutes.js
- Strategy/Tactic: Maintain multiple copies using server-side session-based caching for cart data to handle high concurrent users during flash sales without data loss.
- Implementation:
  - Cart reads check Redis session cache by customer before hitting the database.
  - Cart writes update Redis session cache after add/update/remove/clear/checkout operations.
  - Cache keys: cart:session:<cartId> and cart:session:customer:<customerId> with TTL.
