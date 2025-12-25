// controllers/productStockController.js
const { ProductStock, Product, Shelf } = require("../models");

// @desc    Get all product stocks with filters and pagination
// @route   GET /api/product-stocks
exports.getAllProductStocks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      product_id,
      shelf_id,
      warehouse_id,
      status,
      search,
      expiry_before,
      expiry_after,
      sort = "-last_updated",
    } = req.query;

    // Build query
    const query = { isDelete: false };
    if (product_id) query.product_id = product_id;
    if (shelf_id) query.shelf_id = shelf_id;
    if (warehouse_id) query.warehouse_id = warehouse_id;
    if (status) query.status = status;

    // expiry filters
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_before date" });
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_after date" });
        query.expiry_date.$gte = d2;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const productStocks = await ProductStock.find(query)
      .populate({
        path: "product_id",
        select:
          "name category unit price current_stock minimum_stock_level image_link sku barcode",
      })
      .populate({
        path: "shelf_id",
        select: "shelf_number category capacity",
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductStock.countDocuments(query);

    res.status(200).json({
      success: true,
      count: productStocks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: productStocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product stocks",
      error: error.message,
    });
  }
};

// @desc    Get product stock statistics
// @route   GET /api/product-stocks/stats
exports.getProductStockStats = async (req, res) => {
  try {
    const totalRecords = await ProductStock.countDocuments({ isDelete: false });

    const byStatus = await ProductStock.aggregate([
      { $match: { isDelete: false } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const totalQuantity = await ProductStock.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    const lowStockCount = await ProductStock.countDocuments({
      status: "low_stock",
      isDelete: false,
    });

    const byShelves = await ProductStock.aggregate([
      { $match: { isDelete: false, shelf_id: { $ne: null } } },
      {
        $lookup: {
          from: "shelves",
          localField: "shelf_id",
          foreignField: "_id",
          as: "shelf",
        },
      },
      { $unwind: "$shelf" },
      {
        $group: {
          _id: {
            shelf_id: "$shelf_id",
            shelf_number: "$shelf.shelf_number",
          },
          product_count: { $sum: 1 },
          total_quantity: { $sum: "$quantity" },
        },
      },
      { $sort: { "_id.shelf_number": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_records: totalRecords,
        total_quantity: totalQuantity[0]?.total || 0,
        low_stock_count: lowStockCount,
        by_status: byStatus,
        by_shelves: byShelves,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product stock statistics",
      error: error.message,
    });
  }
};

// @desc    Get single product stock by ID
// @route   GET /api/product-stocks/:id
exports.getProductStockById = async (req, res) => {
  try {
    const productStock = await ProductStock.findById(req.params.id)
      .populate({
        path: "product_id",
        select:
          "name description category unit price current_stock minimum_stock_level maximum_stock_level image_link sku barcode",
      })
      .populate({
        path: "shelf_id",
        select: "shelf_number category capacity isfull note warehouse_id",
      });

    if (!productStock || productStock.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Product stock record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: productStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product stock",
      error: error.message,
    });
  }
};

// @desc    Get product stock by product ID
// @route   GET /api/product-stocks/product/:productId
exports.getStockByProduct = async (req, res) => {
  try {
    const { expiry_before, expiry_after } = req.query;

    const query = { product_id: req.params.productId, isDelete: false };
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_before date" });
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_after date" });
        query.expiry_date.$gte = d2;
      }
    }

    const productStocks = await ProductStock.find(query)
      .populate({
        path: "shelf_id",
        select: "shelf_number category capacity",
      })
      .sort("shelf_id");

    const product = await Product.findById(req.params.productId).select(
      "name category unit current_stock minimum_stock_level maximum_stock_level"
    );

    const totalInShelves = productStocks.reduce(
      (sum, stock) => sum + stock.quantity,
      0
    );

    res.status(200).json({
      success: true,
      count: productStocks.length,
      data: {
        product,
        total_in_shelves: totalInShelves,
        stocks: productStocks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stock by product",
      error: error.message,
    });
  }
};

// @desc    Get product stock by shelf ID
// @route   GET /api/product-stocks/shelf/:shelfId
exports.getStockByShelf = async (req, res) => {
  try {
    const { expiry_before, expiry_after } = req.query;

    const query = { shelf_id: req.params.shelfId, isDelete: false };
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_before date" });
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_after date" });
        query.expiry_date.$gte = d2;
      }
    }

    const productStocks = await ProductStock.find(query)
      .populate({
        path: "product_id",
        select: "name category unit price current_stock image_link sku",
      })
      .sort("product_id");

    const shelf = await Shelf.findById(req.params.shelfId).select(
      "shelf_number category capacity isfull"
    );

    const totalQuantity = productStocks.reduce(
      (sum, stock) => sum + stock.quantity,
      0
    );

    res.status(200).json({
      success: true,
      count: productStocks.length,
      data: {
        shelf,
        total_quantity: totalQuantity,
        stocks: productStocks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stock by shelf",
      error: error.message,
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/product-stocks/low-stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const lowStocks = await ProductStock.find({
      status: "low_stock",
      isDelete: false,
    })
      .populate({
        path: "product_id",
        select: "name category unit price minimum_stock_level supplier_id",
        populate: {
          path: "supplier_id",
          select: "name contact_person_name phone",
        },
      })
      .populate({
        path: "shelf_id",
        select: "shelf_number category",
      })
      .limit(parseInt(limit))
      .sort("quantity");

    res.status(200).json({
      success: true,
      count: lowStocks.length,
      data: lowStocks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching low stock products",
      error: error.message,
    });
  }
};

// @desc    Create new product stock record
// @route   POST /api/product-stocks
exports.createProductStock = async (req, res) => {
  try {
    const {
      product_id,
      warehouse_id,
      shelf_id,
      section,
      slot,
      status = "available",
      quantity = 0,
      damaged_quantity,
      reason,
      expiry_date,
    } = req.body;

    // Validate expiry_date if provided
    let expiryDateObj;
    if (
      expiry_date !== undefined &&
      expiry_date !== null &&
      expiry_date !== ""
    ) {
      expiryDateObj = new Date(expiry_date);
      if (isNaN(expiryDateObj)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiry_date" });
      }
    }

    // Validate product exists
    const product = await Product.findById(product_id);
    if (!product || product.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate shelf exists (if provided)
    if (shelf_id) {
      const shelf = await Shelf.findById(shelf_id);
      if (!shelf || shelf.isDelete) {
        return res.status(404).json({
          success: false,
          message: "Shelf not found",
        });
      }
    }

    // Create product stock
    const productStock = await ProductStock.create({
      product_id,
      warehouse_id,
      shelf_id,
      section,
      slot,
      status,
      quantity,
      damaged_quantity,
      reason,
      expiry_date: expiryDateObj || undefined,
      last_updated: new Date(),
    });

    // Populate for response
    const populatedProductStock = await ProductStock.findById(productStock._id)
      .populate("product_id", "name category unit")
      .populate("shelf_id", "shelf_number category");

    res.status(201).json({
      success: true,
      message: "Product stock record created successfully",
      data: populatedProductStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product stock",
      error: error.message,
    });
  }
};

// @desc    Update product stock record
// @route   PUT /api/product-stocks/:id
exports.updateProductStock = async (req, res) => {
  try {
    let productStock = await ProductStock.findById(req.params.id);

    if (!productStock || productStock.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Product stock record not found",
      });
    }

    const {
      shelf_id,
      section,
      slot,
      status,
      quantity,
      damaged_quantity,
      reason,
      expiry_date,
    } = req.body;

    // expiry_date handling (allow clearing)
    if (expiry_date !== undefined) {
      if (expiry_date === null || expiry_date === "") {
        productStock.expiry_date = null;
      } else {
        const expiryDateObj = new Date(expiry_date);
        if (isNaN(expiryDateObj)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_date" });
        }
        productStock.expiry_date = expiryDateObj;
      }
    }

    // Update fields
    if (shelf_id) {
      const shelf = await Shelf.findById(shelf_id);
      if (!shelf || shelf.isDelete) {
        return res.status(404).json({
          success: false,
          message: "Shelf not found",
        });
      }
      productStock.shelf_id = shelf_id;
    }
    if (section !== undefined) productStock.section = section;
    if (slot !== undefined) productStock.slot = slot;
    if (status) productStock.status = status;
    if (quantity !== undefined) productStock.quantity = quantity;
    if (damaged_quantity !== undefined)
      productStock.damaged_quantity = damaged_quantity;
    if (reason !== undefined) productStock.reason = reason;

    productStock.last_updated = new Date();
    await productStock.save();

    // Populate for response
    const populatedProductStock = await ProductStock.findById(productStock._id)
      .populate("product_id", "name category unit")
      .populate("shelf_id", "shelf_number category");

    res.status(200).json({
      success: true,
      message: "Product stock updated successfully",
      data: populatedProductStock,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product stock",
      error: error.message,
    });
  }
};

// @desc    Adjust stock quantity (increase/decrease)
// @route   PUT /api/product-stocks/:id/adjust
exports.adjustStockQuantity = async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    // adjustment can be positive (increase) or negative (decrease)

    if (adjustment === undefined || adjustment === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a non-zero adjustment value",
      });
    }

    const productStock = await ProductStock.findById(req.params.id);

    if (!productStock || productStock.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Product stock record not found",
      });
    }

    const oldQuantity = productStock.quantity;
    productStock.quantity = Math.max(0, productStock.quantity + adjustment);

    if (reason) {
      productStock.reason = reason;
    }

    productStock.last_updated = new Date();
    await productStock.save();

    const populatedProductStock = await ProductStock.findById(productStock._id)
      .populate("product_id", "name category unit")
      .populate("shelf_id", "shelf_number category");

    res.status(200).json({
      success: true,
      message: "Stock quantity adjusted successfully",
      data: {
        ...populatedProductStock.toObject(),
        adjustment_info: {
          old_quantity: oldQuantity,
          adjustment: adjustment,
          new_quantity: productStock.quantity,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adjusting stock quantity",
      error: error.message,
    });
  }
};

// @desc    Delete (soft delete) product stock record
// @route   DELETE /api/product-stocks/:id
exports.deleteProductStock = async (req, res) => {
  try {
    const productStock = await ProductStock.findById(req.params.id);

    if (!productStock || productStock.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Product stock record not found",
      });
    }

    productStock.isDelete = true;
    await productStock.save();

    res.status(200).json({
      success: true,
      message: "Product stock record deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product stock",
      error: error.message,
    });
  }
};

// @desc    Bulk update stock status
// @route   PUT /api/product-stocks/bulk/update-status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of product stock IDs",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide a status",
      });
    }

    const result = await ProductStock.updateMany(
      { _id: { $in: ids }, isDelete: false },
      { status, last_updated: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} product stock record(s)`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error bulk updating product stocks",
      error: error.message,
    });
  }
};
