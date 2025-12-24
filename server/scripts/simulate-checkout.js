const mongoose = require("mongoose");
require("dotenv").config();
const {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Staff,
  DeliveryOrder,
} = require("../models");

async function run(customerId) {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket"
  );

  // Find active cart for customer
  const cart = await Cart.findOne({
    customer_id: customerId,
    status: "active",
  });
  if (!cart) {
    console.error("No active cart for customer", customerId);
    process.exit(1);
  }

  const cartItems = await CartItem.find({
    cart_id: cart._id,
    status: "active",
  }).populate("product_id");
  if (cartItems.length === 0) {
    console.error("No items in cart");
    process.exit(1);
  }

  let totalAmount = 0;
  cartItems.forEach((ci) => (totalAmount += ci.line_total));

  const order = await Order.create({
    order_number: `TEST-${Date.now()}`,
    customer_id: customerId,
    orderItems: [],
    total_amount: totalAmount,
    tracking_number: `TRK-${Date.now()}`,
    notes: "Simulation",
    status: "pending",
  });

  const orderItems = await OrderItem.insertMany(
    cartItems.map((ci) => ({
      order_id: order._id,
      product_id: ci.product_id._id,
      quantity: ci.quantity,
      unit_price: ci.unit_price,
    }))
  );
  await Order.findByIdAndUpdate(order._id, {
    orderItems: orderItems.map((oi) => oi._id),
  });

  // Simulate auto assign
  const assignedStaff = await Staff.findOneAndUpdate(
    { position: "Delivery", is_active: true },
    { $inc: { current_assignments: 1 } },
    { sort: { current_assignments: 1 }, new: true }
  );
  console.log("Assigned staff:", assignedStaff.account_id);

  const do1 = await DeliveryOrder.create({
    order_id: order._id,
    staff_id: assignedStaff._id,
    tracking_number: `TRACK-${Date.now()}`,
    notes: "Auto assigned by simulation",
    status: "assigned",
  });

  console.log("Delivery order created:", do1._id);

  const updatedStaff = await Staff.findById(assignedStaff._id);
  console.log(
    "Staff current_assignments after assign:",
    updatedStaff.current_assignments
  );

  await mongoose.connection.close();
}

const customerId = process.argv[2];
if (!customerId) {
  console.error("Usage: node simulate-checkout.js <customerId>");
  process.exit(1);
}
run(customerId).catch((e) => {
  console.error(e);
  process.exit(1);
});
