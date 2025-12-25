// scripts/convert-stocks-to-batches.js
// Convert existing ProductStock and ProductShelf records into ProductBatch documents
const mongoose = require("mongoose");
require("dotenv").config();
const {
  ProductStock,
  ProductShelf,
  Product,
  ProductBatch,
} = require("../models");

const MONGO_URL =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mini_supermarket";

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to", MONGO_URL);

  // Process ProductStock records
  const stocks = await ProductStock.find({
    quantity: { $gt: 0 },
    migrated: { $ne: true },
    isDelete: false,
  });
  console.log(`Found ${stocks.length} product stock records to migrate`);
  let createdFromStocks = 0;
  for (const s of stocks) {
    // avoid duplicate
    const exists = await ProductBatch.findOne({
      source: "productStock",
      source_id: s._id,
    });
    if (exists) {
      await ProductStock.updateOne(
        { _id: s._id },
        { $set: { migrated: true } }
      );
      continue;
    }

    const product = await Product.findById(s.product_id);
    const batchData = {
      product_id: s.product_id,
      batch_id: s._id.toString(),
      quantity: s.quantity || 0,
      expiry_date: s.expiry_date || (product ? product.expiry_date : undefined),
      sku: product?.sku || undefined,
      barcode: product?.barcode || undefined,
      warehouse_id: s.warehouse_id,
      shelf_id: s.shelf_id,
      purchase_date: s.last_updated || undefined,
      source: "productStock",
      source_id: s._id,
      migrated: true,
    };

    await ProductBatch.create(batchData);
    await ProductStock.updateOne({ _id: s._id }, { $set: { migrated: true } });
    createdFromStocks++;
  }

  console.log(`Created ${createdFromStocks} batches from ProductStock`);

  // Process ProductShelf mappings (if any quantities not yet represented)
  const shelves = await ProductShelf.find({
    quantity: { $gt: 0 },
    isDelete: false,
  });
  console.log(`Found ${shelves.length} product-shelf mappings`);
  let createdFromShelves = 0;
  for (const sh of shelves) {
    const exists = await ProductBatch.findOne({
      source: "productShelf",
      source_id: sh._id,
    });
    if (exists) continue;

    const product = await Product.findById(sh.product_id);
    const batchData = {
      product_id: sh.product_id,
      batch_id: sh._id.toString(),
      quantity: sh.quantity || 0,
      expiry_date:
        sh.expiry_date || (product ? product.expiry_date : undefined),
      sku: product?.sku || undefined,
      barcode: product?.barcode || undefined,
      shelf_id: sh.shelf_id,
      purchase_date: undefined,
      source: "productShelf",
      source_id: sh._id,
      migrated: true,
    };

    await ProductBatch.create(batchData);
    createdFromShelves++;
  }

  console.log(
    `Created ${createdFromShelves} batches from ProductShelf mappings`
  );

  // Recalculate product current_stock from batches
  const products = await Product.find({});
  let updatedProducts = 0;
  for (const p of products) {
    const agg = await ProductBatch.aggregate([
      { $match: { product_id: p._id, isDelete: false } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    const total = agg[0]?.total || 0;
    await Product.updateOne({ _id: p._id }, { $set: { current_stock: total } });
    updatedProducts++;
  }

  console.log(`Updated ${updatedProducts} products current_stock from batches`);

  await mongoose.disconnect();
  console.log("Disconnected");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
