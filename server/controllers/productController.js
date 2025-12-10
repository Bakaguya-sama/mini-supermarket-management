// controllers/productController.js
const { Product, Supplier, ProductShelf, ProductStock } = require('../models');

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
      sort = '-createdAt'
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
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const products = await Product.find(query)
      .populate('supplier_id', 'name contact_person_name email phone')
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
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
exports.getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const inactiveProducts = await Product.countDocuments({ status: 'inactive' });
    const discontinuedProducts = await Product.countDocuments({ status: 'discontinued' });
    
    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$current_stock' } } }
    ]);
    
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$current_stock', '$minimum_stock_level'] }
    });
    
    const totalInventoryValue = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$current_stock', '$price'] } } } }
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
        byCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics',
      error: error.message
    });
  }
};

// @desc    Get products with low stock
// @route   GET /api/products/low-stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const products = await Product.find({
      $expr: { $lte: ['$current_stock', '$minimum_stock_level'] },
      status: 'active'
    })
      .populate('supplier_id', 'name contact_person_name phone email')
      .limit(parseInt(limit))
      .sort('current_stock');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message
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
      status: 'active'
    })
      .populate('supplier_id', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('name');

    const total = await Product.countDocuments({
      category: req.params.category,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier_id');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get shelf locations for this product
    const shelfLocations = await ProductShelf.find({ product_id: product._id })
      .populate('shelf_id');

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        shelfLocations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
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
      status = 'active',
      supplier_id,
      category
    } = req.body;

    // Validate required fields
    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name and unit'
      });
    }

    // Validate supplier if provided
    if (supplier_id) {
      const supplier = await Supplier.findById(supplier_id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
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
      category
    });

    await product.populate('supplier_id', 'name contact_person_name email phone');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
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
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      unit,
      minimum_stock_level,
      maximum_stock_level,
      storage_location,
      price,
      status,
      supplier_id,
      category
    } = req.body;

    // Validate supplier if provided
    if (supplier_id && supplier_id !== product.supplier_id?.toString()) {
      const supplier = await Supplier.findById(supplier_id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (unit !== undefined) product.unit = unit;
    if (minimum_stock_level !== undefined) product.minimum_stock_level = minimum_stock_level;
    if (maximum_stock_level !== undefined) product.maximum_stock_level = maximum_stock_level;
    if (storage_location !== undefined) product.storage_location = storage_location;
    if (price !== undefined) product.price = price;
    if (status !== undefined) product.status = status;
    if (supplier_id !== undefined) product.supplier_id = supplier_id;
    if (category !== undefined) product.category = category;

    await product.save();
    await product.populate('supplier_id', 'name contact_person_name email phone');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Soft delete product (set status to discontinued)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.status = 'discontinued';
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product discontinued successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error discontinuing product',
      error: error.message
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
        message: 'Product not found'
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
      message: 'Product and related data permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting product',
      error: error.message
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
        message: 'Product not found'
      });
    }

    if (current_stock !== undefined) {
      product.current_stock = current_stock;
    } else if (adjustment_type && adjustment_value !== undefined) {
      if (adjustment_type === 'add') {
        product.current_stock += parseInt(adjustment_value);
      } else if (adjustment_type === 'subtract') {
        product.current_stock -= parseInt(adjustment_value);
        if (product.current_stock < 0) product.current_stock = 0;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide current_stock or adjustment_type with adjustment_value'
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product stock',
      error: error.message
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
        message: 'Please provide a valid price'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const oldPrice = product.price;
    product.price = price;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product price updated successfully',
      data: {
        product,
        oldPrice,
        newPrice: price
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product price',
      error: error.message
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
        message: 'Product not found'
      });
    }

    product.status = 'active';
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product activated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating product',
      error: error.message
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
      .populate('supplier_id', 'name contact_person_name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('name');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by supplier',
      error: error.message
    });
  }
};