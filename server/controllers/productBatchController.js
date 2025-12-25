// controllers/productBatchController.js
const { ProductBatch, Product, Shelf } = require("../models");

// Create new batch
exports.createBatch = async (req, res) => {
  try {
    const {
      product_id,
      batch_id,
      quantity = 0,
      expiry_date,
      sku,
      barcode,
      supplier_id,
      warehouse_id,
      shelf_id,
      purchase_date,
      cost,
      source = "manual",
    } = req.body;

    if (!product_id) {
      return res
        .status(400)
        .json({ success: false, message: "product_id is required" });
    }

    const qty = parseInt(quantity) || 0;
    if (qty < 0) {
      return res
        .status(400)
        .json({ success: false, message: "quantity must be >= 0" });
    }

    // Validate product
    const product = await Product.findById(product_id);
    if (!product || product.isDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Validate expiry_date if provided
    let expiryObj;
    if (expiry_date) {
      expiryObj = new Date(expiry_date);
      if (isNaN(expiryObj))
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiry_date" });
    }

    const batch = await ProductBatch.create({
      product_id,
      batch_id,
      quantity: qty,
      expiry_date: expiryObj,
      sku,
      barcode,
      supplier_id,
      warehouse_id,
      shelf_id,
      purchase_date: purchase_date ? new Date(purchase_date) : undefined,
      cost,
      source,
    });

    // Update product current_stock
    if (qty !== 0) {
      await Product.findByIdAndUpdate(product_id, {
        $inc: { current_stock: qty },
      });
    }

    const populated = await ProductBatch.findById(batch._id)
      .populate({
        path: "product_id",
        select: "name sku barcode current_stock",
      })
      .populate({ path: "shelf_id", select: "shelf_number" });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error("Error creating batch:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating batch",
        error: error.message,
      });
  }
};

// Get all batches (with filters)
exports.getAllBatches = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      product_id,
      sku,
      barcode,
      status,
      expiry_before,
      expiry_after,
      sort = "-createdAt",
    } = req.query;

    const query = { isDelete: false };
    if (product_id) query.product_id = product_id;
    if (sku) query.sku = sku;
    if (barcode) query.barcode = barcode;
    if (status) query.status = status;

    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_before" });
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_after" });
        query.expiry_date.$gte = d2;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const batches = await ProductBatch.find(query)
      .populate({ path: "product_id", select: "name sku barcode" })
      .populate({ path: "shelf_id", select: "shelf_number" })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductBatch.countDocuments(query);

    res
      .status(200)
      .json({
        success: true,
        count: batches.length,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        data: batches,
      });
  } catch (error) {
    console.error("Error fetching batches:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching batches",
        error: error.message,
      });
  }
};

// Get single batch
exports.getBatchById = async (req, res) => {
  try {
    const batch = await ProductBatch.findById(req.params.id)
      .populate({ path: "product_id", select: "name sku barcode" })
      .populate({ path: "shelf_id", select: "shelf_number" });

    if (!batch || batch.isDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching batch",
        error: error.message,
      });
  }
};

// Get batches by product id with totals
exports.getBatchesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { expiry_before, expiry_after } = req.query;

    const query = { product_id: productId, isDelete: false };
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_before" });
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_after" });
        query.expiry_date.$gte = d2;
      }
    }

    const batches = await ProductBatch.find(query)
      .populate({ path: "shelf_id", select: "shelf_number" })
      .sort("expiry_date");

    const totalQuantity = batches.reduce((s, b) => s + (b.quantity || 0), 0);

    const product = await Product.findById(productId).select(
      "name current_stock"
    );

    res
      .status(200)
      .json({
        success: true,
        count: batches.length,
        data: { product, total_quantity: totalQuantity, batches },
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching product batches",
        error: error.message,
      });
  }
};

// Update batch
exports.updateBatch = async (req, res) => {
  try {
    const updates = req.body;
    const batch = await ProductBatch.findById(req.params.id);
    if (!batch || batch.isDelete)
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });

    // If quantity changes, adjust product stock
    if (updates.quantity !== undefined) {
      const newQty = parseInt(updates.quantity) || 0;
      const delta = newQty - (batch.quantity || 0);
      if (delta !== 0) {
        await Product.findByIdAndUpdate(batch.product_id, {
          $inc: { current_stock: delta },
        });
      }
    }

    // Validate expiry if provided
    if (updates.expiry_date) {
      const d = new Date(updates.expiry_date);
      if (isNaN(d))
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiry_date" });
      updates.expiry_date = d;
    }

    Object.assign(batch, updates);
    await batch.save();

    const populated = await ProductBatch.findById(batch._id).populate({
      path: "product_id",
      select: "name sku barcode",
    });

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating batch",
        error: error.message,
      });
  }
};

// Adjust batch quantity by delta: { delta: number }
exports.adjustBatchQuantity = async (req, res) => {
  try {
    const { delta } = req.body;
    if (delta === undefined || delta === null)
      return res
        .status(400)
        .json({ success: false, message: "delta is required" });
    const d = parseInt(delta);
    if (isNaN(d))
      return res
        .status(400)
        .json({ success: false, message: "delta must be a number" });

    const batch = await ProductBatch.findById(req.params.id);
    if (!batch || batch.isDelete)
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });

    const newQty = (batch.quantity || 0) + d;
    if (newQty < 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "Resulting quantity cannot be negative",
        });

    batch.quantity = newQty;
    await batch.save();

    // Adjust product stock accordingly
    if (d !== 0) {
      await Product.findByIdAndUpdate(batch.product_id, {
        $inc: { current_stock: d },
      });
    }

    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error adjusting batch quantity",
        error: error.message,
      });
  }
};

// Soft delete batch
exports.deleteBatch = async (req, res) => {
  try {
    const batch = await ProductBatch.findById(req.params.id);
    if (!batch || batch.isDelete)
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });

    // Subtract remaining quantity from product stock
    const qty = batch.quantity || 0;
    if (qty !== 0) {
      await Product.findByIdAndUpdate(batch.product_id, {
        $inc: { current_stock: -qty },
      });
    }

    batch.isDelete = true;
    await batch.save();

    res.status(200).json({ success: true, message: "Batch deleted (soft)" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting batch",
        error: error.message,
      });
  }
};
