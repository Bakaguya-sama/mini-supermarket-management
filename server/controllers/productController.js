// controllers/productController.js
const {
  Product,
  Supplier,
  ProductShelf,
  ProductStock,
  ProductBatch,
} = require("../models");

// @desc    Get all products with filters and pagination
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      supplier_id,
      search,
      minPrice,
      maxPrice,
      expiry_before,
      expiry_after,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (supplier_id) query.supplier_id = supplier_id;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Expiry date range filter
    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_before date" });
        }
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_after date" });
        }
        query.expiry_date.$gte = d2;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const products = await Product.find(query)
      .populate("supplier_id", "name contact_person_name email phone")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
exports.getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: "active" });
    const inactiveProducts = await Product.countDocuments({
      status: "inactive",
    });
    const discontinuedProducts = await Product.countDocuments({
      status: "discontinued",
    });

    const byCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$current_stock" },
        },
      },
    ]);

    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ["$current_stock", "$minimum_stock_level"] },
    });

    const totalInventoryValue = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$current_stock", "$price"] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        discontinued: discontinuedProducts,
        lowStockCount,
        totalInventoryValue: totalInventoryValue[0]?.total || 0,
        byCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product statistics",
      error: error.message,
    });
  }
};

// @desc    Get products with low stock
// @route   GET /api/products/low-stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const products = await Product.find({
      $expr: { $lte: ["$current_stock", "$minimum_stock_level"] },
      status: "active",
    })
      .populate("supplier_id", "name contact_person_name phone email")
      .limit(parseInt(limit))
      .sort("current_stock");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching low stock products",
      error: error.message,
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({
      category: req.params.category,
      status: "active",
    })
      .populate("supplier_id", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort("name");

    const total = await Product.countDocuments({
      category: req.params.category,
      status: "active",
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products by category",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "supplier_id"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get shelf locations for this product
    const shelfLocations = await ProductShelf.find({
      product_id: product._id,
    }).populate("shelf_id");

    // Aggregate batch summary (distinct expiry dates, counts, quantities)
    const batchAgg = await ProductBatch.aggregate([
      { $match: { product_id: product._id, isDelete: false } },
      {
        $group: {
          _id: "$expiry_date",
          batchCount: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const now = new Date();
    const batches = batchAgg.map((b) => ({
      expiry_date: b._id ? b._id : null,
      batchCount: b.batchCount,
      totalQuantity: b.totalQuantity,
    }));

    const distinctExpiryCount = batches.filter(
      (b) => b.expiry_date !== null
    ).length;
    const expiredBatches = batches.filter(
      (b) => b.expiry_date && new Date(b.expiry_date) < now
    );
    const expiredBatchesCount = expiredBatches.reduce(
      (s, b) => s + (b.batchCount || 0),
      0
    );
    const expiredTotalQuantity = expiredBatches.reduce(
      (s, b) => s + (b.totalQuantity || 0),
      0
    );
    const earliestExpiry =
      batches.find((b) => b.expiry_date !== null)?.expiry_date || null;

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        shelfLocations,
        batch_summary: {
          distinctExpiryCount,
          batches,
          expiredBatchesCount,
          expiredTotalQuantity,
          earliestExpiry,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      unit,
      current_stock = 0,
      minimum_stock_level,
      maximum_stock_level,
      storage_location,
      price = 0,
      status = "active",
      supplier_id,
      category,
      image_link,
      expiry_date,
    } = req.body;

    // Validate required fields
    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        message: "Please provide product name and unit",
      });
    }

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
      const now = new Date();
      if (expiryDateObj < now) {
        return res.status(400).json({
          success: false,
          message: "expiry_date cannot be in the past",
        });
      }
    }

    // Validate supplier if provided
    if (supplier_id) {
      const supplier = await Supplier.findById(supplier_id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this name already exists",
      });
    }

    // Validate current_stock against maximum_stock_level if provided
    if (maximum_stock_level !== undefined && current_stock !== undefined) {
      const curr = parseInt(current_stock);
      const max = parseInt(maximum_stock_level);
      if (!isNaN(max) && max > 0 && curr > max) {
        return res.status(400).json({
          success: false,
          message: "Current stock cannot be greater than maximum stock level",
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      unit,
      current_stock,
      minimum_stock_level,
      maximum_stock_level,
      storage_location,
      price,
      status,
      supplier_id,
      category,
      image_link,
      expiry_date: expiryDateObj || undefined,
    });

    await product.populate(
      "supplier_id",
      "name contact_person_name email phone"
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      unit,
      current_stock,
      minimum_stock_level,
      maximum_stock_level,
      storage_location,
      price,
      status,
      supplier_id,
      category,
      image_link,
      expiry_date,
    } = req.body;

    // Validate supplier if provided
    if (supplier_id && supplier_id !== product.supplier_id?.toString()) {
      const supplier = await Supplier.findById(supplier_id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }
    }
    // Validate current_stock against maximum_stock_level if provided
    if (maximum_stock_level !== undefined && current_stock !== undefined) {
      const curr = parseInt(current_stock);
      const max = parseInt(maximum_stock_level);
      if (!isNaN(max) && max > 0 && curr > max) {
        return res.status(400).json({
          success: false,
          message: "Current stock cannot be greater than maximum stock level",
        });
      }
    }
    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (unit !== undefined) product.unit = unit;
    if (current_stock !== undefined)
      product.current_stock = parseInt(current_stock) || 0;
    if (minimum_stock_level !== undefined)
      product.minimum_stock_level = minimum_stock_level;
    if (maximum_stock_level !== undefined)
      product.maximum_stock_level = maximum_stock_level;
    if (storage_location !== undefined)
      product.storage_location = storage_location;
    if (price !== undefined) product.price = price;
    if (status !== undefined) product.status = status;
    if (supplier_id !== undefined) product.supplier_id = supplier_id;
    if (category !== undefined) product.category = category;
    if (image_link !== undefined) product.image_link = image_link;

    // expiry_date handling (allow clearing with null or empty string)
    if (expiry_date !== undefined) {
      if (expiry_date === null || expiry_date === "") {
        product.expiry_date = null;
      } else {
        const expiryDateObj = new Date(expiry_date);
        if (isNaN(expiryDateObj)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_date" });
        }
        const now = new Date();
        if (expiryDateObj < now) {
          return res.status(400).json({
            success: false,
            message: "expiry_date cannot be in the past",
          });
        }
        product.expiry_date = expiryDateObj;
      }
    }

    // If restockBatch present, create a batch and update product stock accordingly
    const { restockBatch } = req.body;
    let createdBatch = null;
    if (restockBatch && typeof restockBatch === "object") {
      const qty = parseInt(restockBatch.quantity) || 0;
      if (qty < 0)
        return res.status(400).json({
          success: false,
          message: "restockBatch.quantity must be >= 0",
        });

      const expiryObj = restockBatch.expiry_date
        ? new Date(restockBatch.expiry_date)
        : undefined;
      if (restockBatch.expiry_date && isNaN(expiryObj)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restockBatch.expiry_date",
        });
      }

      createdBatch = await ProductBatch.create({
        product_id: product._id,
        batch_id: restockBatch.batch_id || undefined,
        quantity: qty,
        expiry_date: expiryObj,
        sku: restockBatch.sku || product.sku || undefined,
        barcode: restockBatch.barcode || product.barcode || undefined,
        supplier_id:
          restockBatch.supplier_id || product.supplier_id || undefined,
        shelf_id: restockBatch.shelf_id || undefined,
        purchase_date: restockBatch.purchase_date
          ? new Date(restockBatch.purchase_date)
          : undefined,
        cost: restockBatch.cost || undefined,
        source: "restock",
      });

      // Increment product current_stock
      if (qty !== 0) {
        await Product.findByIdAndUpdate(product._id, {
          $inc: { current_stock: qty },
        });
        // refresh product.current_stock
        const refreshed = await Product.findById(product._id);
        product.current_stock = refreshed.current_stock;
      }
    }

    await product.save();
    await product.populate(
      "supplier_id",
      "name contact_person_name email phone"
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product, createdBatch },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// @desc    Soft delete product (set isDelete = true)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Soft delete - set isDelete to true
    product.isDelete = true;
    product.status = "discontinued";
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product marked as deleted successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// @desc    Permanently delete product
// @route   DELETE /api/products/:id/permanent
exports.permanentDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete related ProductShelf entries
    await ProductShelf.deleteMany({ product_id: product._id });

    // Delete related ProductStock entries
    await ProductStock.deleteMany({ product_id: product._id });

    // Delete product
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product and related data permanently deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error permanently deleting product",
      error: error.message,
    });
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
exports.updateProductStock = async (req, res) => {
  try {
    const { current_stock, adjustment_type, adjustment_value } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (current_stock !== undefined) {
      product.current_stock = current_stock;
    } else if (adjustment_type && adjustment_value !== undefined) {
      if (adjustment_type === "add") {
        product.current_stock += parseInt(adjustment_value);
      } else if (adjustment_type === "subtract") {
        product.current_stock -= parseInt(adjustment_value);
        if (product.current_stock < 0) product.current_stock = 0;
      }
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Please provide current_stock or adjustment_type with adjustment_value",
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product stock updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product stock",
      error: error.message,
    });
  }
};

// @desc    Update product price
// @route   PATCH /api/products/:id/price
exports.updateProductPrice = async (req, res) => {
  try {
    const { price } = req.body;

    if (price === undefined || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid price",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const oldPrice = product.price;
    product.price = price;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product price updated successfully",
      data: {
        product,
        oldPrice,
        newPrice: price,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product price",
      error: error.message,
    });
  }
};

// @desc    Activate product
// @route   PATCH /api/products/:id/activate
exports.activateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.status = "active";
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product activated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error activating product",
      error: error.message,
    });
  }
};

// @desc    Get products by supplier
// @route   GET /api/products/supplier/:supplierId
exports.getProductsBySupplier = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { supplier_id: req.params.supplierId };
    if (status) query.status = status;

    const products = await Product.find(query)
      .populate("supplier_id", "name contact_person_name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort("name");

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products by supplier",
      error: error.message,
    });
  }
};
