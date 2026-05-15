# Delivery Order Quality Attributes (UC25-UC26)

This document maps delivery-order quality attributes to backend implementation.

## UC25.1 - Performance: Delivery staff view order info (Detail Query)
- Activity: Delivery staff: View order info
- Element: server/controllers/deliveryOrderController.js
- Strategy/Tactic: Optimize indexed lookup by OrderID; return full delivery details quickly for mobile staff.
- Implementation:
  - Detail lookup falls back to find by order_id if a delivery-order id is not found.
  - Uses existing order_id index (deliveryOrderSchema index includes order_id).

## UC25.2 - Manageability: Delivery staff accept delivery task (Accept Action)
- Activity: Delivery staff: Accept delivery task
- Element: server/controllers/deliveryOrderController.js, server/models/index.js
- Strategy/Tactic: Record state change from Pending to Accepted with timestamp; prevent race conditions.
- Implementation:
  - Added deliveryOrder.assignment_status (pending/accepted) and accepted_at timestamp.
  - Atomic update when moving from assigned -> in_transit sets assignment_status=accepted and accepted_at.
  - Returns 409 if already accepted, preventing duplicate acceptance.

## UC25.3 - Manageability: Delivery staff update order status (Status Update)
- Activity: Delivery staff: Update order status
- Element: server/controllers/deliveryOrderController.js
- Strategy/Tactic: Enforce strict state transitions; validate logical progression; emit status change log immediately.
- Implementation:
  - Enforced allowed transitions: assigned -> in_transit -> delivered (failed allowed from assigned/in_transit).
  - Logs status change immediately after successful update.

## UC26.1 - Performance: Delivery staff view specific order (Detail Query)
- Activity: Delivery staff: View specific order
- Element: server/controllers/deliveryOrderController.js
- Strategy/Tactic: Indexed lookup by OrderID with staff authorization; return mobile-ready details.
- Implementation:
  - Staff access check ensures only assigned staff can view the delivery order.
  - OrderID fallback lookup uses the indexed order_id field.

## UC26.2 - Performance: Delivery staff view delivery history (History Query)
- Activity: Delivery staff: View delivery history
- Element: server/controllers/deliveryOrderController.js
- Strategy/Tactic: Paginate (20/page) and compute success rate with aggregate queries.
- Implementation:
  - Enforced max page size of 20.
  - Aggregates status counts and returns success_rate metrics in response.
