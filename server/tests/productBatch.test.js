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

describe("ProductBatch API", () => {
  test("should create batch and increment product stock", async () => {
    const product = await Product.create({ name: "Test Milk", unit: "Bottle" });

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const res = await request(app)
      .post("/api/product-batches")
      .send({
        product_id: product._id.toString(),
        quantity: 10,
        expiry_date: expiry.toISOString(),
        sku: "SKU123",
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.quantity).toBe(10);

    const refreshed = await Product.findById(product._id);
    expect(refreshed.current_stock).toBe(10);
  });

  test("should list batches by product and give totals", async () => {
    const product = await Product.create({ name: "Yogurt", unit: "Cup" });
    await ProductBatch.create({ product_id: product._id, quantity: 5 });
    await ProductBatch.create({ product_id: product._id, quantity: 7 });

    const res = await request(app)
      .get(`/api/product-batches/product/${product._id.toString()}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.total_quantity).toBe(12);
    expect(res.body.count).toBe(2);
  });

  test("should adjust batch quantity and update product stock", async () => {
    const product = await Product.create({ name: "Cheese", unit: "Block" });
    const batch = await ProductBatch.create({
      product_id: product._id,
      quantity: 10,
    });

    // Manually set product stock to reflect batch
    await Product.findByIdAndUpdate(product._id, {
      $set: { current_stock: 10 },
    });

    const res = await request(app)
      .put(`/api/product-batches/${batch._id.toString()}/adjust`)
      .send({ delta: -3 })
      .expect(200);

    expect(res.body.success).toBe(true);
    const updatedBatch = await ProductBatch.findById(batch._id);
    expect(updatedBatch.quantity).toBe(7);

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.current_stock).toBe(7);
  });

  test("should soft-delete batch and decrement product stock", async () => {
    const product = await Product.create({ name: "Butter", unit: "Pack" });
    const batch = await ProductBatch.create({
      product_id: product._id,
      quantity: 6,
    });
    await Product.findByIdAndUpdate(product._id, {
      $set: { current_stock: 6 },
    });

    const res = await request(app)
      .delete(`/api/product-batches/${batch._id.toString()}`)
      .expect(200);

    expect(res.body.success).toBe(true);

    const deleted = await ProductBatch.findById(batch._id);
    expect(deleted.isDelete).toBe(true);

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.current_stock).toBe(0);
  });
});
