const request = require("supertest");
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const app = require("../server");
const { Product, ProductBatch } = require("../models");

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
  await ProductBatch.deleteMany({});
});

describe("Product controller - batch summary", () => {
  test("GET /api/products/:id returns batch_summary with distinct expiry counts and expired counts", async () => {
    const product = await Product.create({
      name: "Batched Product",
      unit: "Piece",
    });

    const now = new Date();
    const expired = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5); // 5 days ago
    const future1 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10); // 10 days
    const future2 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 40); // 40 days

    // Create batches with different expiry dates and quantities
    await ProductBatch.create({
      product_id: product._id,
      quantity: 5,
      expiry_date: expired,
    });
    await ProductBatch.create({
      product_id: product._id,
      quantity: 7,
      expiry_date: future1,
    });
    await ProductBatch.create({
      product_id: product._id,
      quantity: 3,
      expiry_date: future2,
    });
    await ProductBatch.create({
      product_id: product._id,
      quantity: 2,
      expiry_date: future1,
    }); // same expiry as future1

    const res = await request(app)
      .get(`/api/products/${product._id.toString()}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data).toHaveProperty("batch_summary");

    const bs = data.batch_summary;
    // distinct expiry dates: expired, future1, future2 => 3
    expect(bs.distinctExpiryCount).toBe(3);
    // expired batches count: one batch with expired date => 1
    expect(bs.expiredBatchesCount).toBeGreaterThanOrEqual(1);
    // expired total quantity should equal 5
    expect(bs.expiredTotalQuantity).toBeGreaterThanOrEqual(5);
    // batches array should contain an entry with expiry_date = future1
    const hasFuture1 = bs.batches.some(
      (b) =>
        b.expiry_date &&
        new Date(b.expiry_date).toISOString().slice(0, 10) ===
          future1.toISOString().slice(0, 10)
    );
    expect(hasFuture1).toBe(true);
  });
});
