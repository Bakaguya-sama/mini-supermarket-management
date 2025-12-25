const mongoose = require("mongoose");
const connectDB = require("../config/database");
const { Product, ProductStock, ProductBatch } = require("../models");
const { exec } = require("child_process");

jest.setTimeout(20000);

beforeAll(async () => {
  process.env.MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/mini_supermarket_test";
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Product.deleteMany({});
  await ProductStock.deleteMany({});
  await ProductBatch.deleteMany({});
});

test("convert-stocks-to-batches migrates stocks and updates product current_stock", async () => {
  const product = await Product.create({
    name: "Migrated Product",
    unit: "Piece",
  });

  const stock = await ProductStock.create({
    product_id: product._id,
    quantity: 8,
    expiry_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });

  // Run migration script as a child process with test DB env
  await new Promise((resolve, reject) => {
    const child = exec(
      "node scripts/convert-stocks-to-batches.js",
      { env: { ...process.env, MONGODB_URI: process.env.MONGODB_URI } },
      (error, stdout, stderr) => {
        if (error) return reject(error);
        resolve({ stdout, stderr });
      }
    );
  });

  // After migration, a ProductBatch should exist with source productStock and quantity 8
  const batches = await ProductBatch.find({ product_id: product._id });
  expect(batches.length).toBeGreaterThanOrEqual(1);
  expect(batches[0].quantity).toBe(8);

  // Product current_stock should be updated
  const refreshedProduct = await Product.findById(product._id);
  expect(refreshedProduct.current_stock).toBe(8);
});
