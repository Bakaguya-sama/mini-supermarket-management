const mongoose = require("mongoose");
require("dotenv").config();
const { Cart, Customer } = require("../models");

async function run() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket"
  );
  const carts = await Cart.find({ status: "active" }).limit(10);
  console.log("Active carts:");
  for (const c of carts) {
    console.log(
      `- cart ${c._id} | customer_id: ${c.customer_id} | subtotal: ${c.subtotal}`
    );
  }
  await mongoose.connection.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
