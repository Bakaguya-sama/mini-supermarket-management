// scripts/backfill-expiry-dates.js
// Backfill expiry_date for existing Product documents
const mongoose = require("mongoose");
require("dotenv").config();
const { Product, ProductStock, ProductShelf } = require("../models");

const MONGO_URL =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket";

const addDays = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt;
};

const categoryDefaultDays = {
  "Dairy & Eggs": () => 30 + Math.floor(Math.random() * 15), // 30-44 days
  Bakery: () => 3 + Math.floor(Math.random() * 4), // 3-6 days
  Beverages: () => 365 + Math.floor(Math.random() * 60), // ~1 year
  Grains: () => 365 * 2 + Math.floor(Math.random() * 180), // 2-2.5 years
  Snacks: () => 365 * 2,
  Household: () => 365 * 2,
  default: () => 365,
};

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to", MONGO_URL);

  const products = await Product.find({
    $or: [{ expiry_date: { $exists: false } }, { expiry_date: null }],
  });
  console.log(`Found ${products.length} products without expiry_date`);

  let updated = 0;
  for (const p of products) {
    const daysFn =
      categoryDefaultDays[p.category] || categoryDefaultDays.default;
    const days = daysFn();
    const expiry = addDays(days);
    await Product.updateOne({ _id: p._id }, { $set: { expiry_date: expiry } });
    updated++;
    console.log(
      `Set expiry for ${p.name} (${p._id}) => ${expiry
        .toISOString()
        .slice(0, 10)}`
    );
  }

  console.log(`Updated ${updated} products`);

  // Backfill ProductStock records (inherit product expiry if present, otherwise pick default by category)
  const stocks = await ProductStock.find({
    $or: [{ expiry_date: { $exists: false } }, { expiry_date: null }],
  });
  console.log(
    `Found ${stocks.length} product stock records without expiry_date`
  );
  let stockUpdated = 0;
  for (const s of stocks) {
    const prod = await Product.findById(s.product_id);
    let expiryToSet;
    if (prod && prod.expiry_date) {
      expiryToSet = prod.expiry_date;
    } else {
      const fn =
        (prod && categoryDefaultDays[prod.category]) ||
        categoryDefaultDays.default;
      expiryToSet = addDays(fn());
    }
    await ProductStock.updateOne(
      { _id: s._id },
      { $set: { expiry_date: expiryToSet } }
    );
    stockUpdated++;
    console.log(
      `Set expiry for ProductStock ${s._id} (product ${
        prod?.name
      }) => ${expiryToSet.toISOString().slice(0, 10)}`
    );
  }
  console.log(`Updated ${stockUpdated} product stock records`);

  // Backfill ProductShelf mappings
  const shelves = await ProductShelf.find({
    $or: [{ expiry_date: { $exists: false } }, { expiry_date: null }],
  });
  console.log(
    `Found ${shelves.length} product-shelf mappings without expiry_date`
  );
  let shelfUpdated = 0;
  for (const sh of shelves) {
    const prod = await Product.findById(sh.product_id);
    let expiryToSet;
    if (prod && prod.expiry_date) {
      expiryToSet = prod.expiry_date;
    } else {
      const fn =
        (prod && categoryDefaultDays[prod.category]) ||
        categoryDefaultDays.default;
      expiryToSet = addDays(fn());
    }
    await ProductShelf.updateOne(
      { _id: sh._id },
      { $set: { expiry_date: expiryToSet } }
    );
    shelfUpdated++;
    console.log(
      `Set expiry for ProductShelf ${sh._id} (product ${
        prod?.name
      }) => ${expiryToSet.toISOString().slice(0, 10)}`
    );
  }
  console.log(`Updated ${shelfUpdated} product-shelf mappings`);

  await mongoose.disconnect();
  console.log("Disconnected");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
