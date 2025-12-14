// controllers/damagedProductController.js
const { DamagedProduct, Product, Shelf, ProductShelf } = require('../models');

// @desc    Get all damaged products with filters and pagination
// @route   GET /api/damaged-products
exports.getAllDamagedProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      product_id,
      search,
      resolution_action,
      inventory_adjusted,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { isDelete: false };
    if (status) query.status = status;
    if (product_id) query.product_id = product_id;
    if (resolution_action) query.resolution_action = resolution_action;
    if (inventory_adjusted !== undefined) query.inventory_adjusted = inventory_adjusted === 'true';
    
    if (search) {
      query.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const damagedProducts = await DamagedProduct.find(query)
      .populate({
        path: 'product_id',
        select: 'name category unit price supplier_id current_stock image_link sku barcode',
        populate: {
          path: 'supplier_id',
          select: 'name contact_person_name phone email'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DamagedProduct.countDocuments(query);

    res.status(200).json({
      success: true,
      count: damagedProducts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: damagedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching damaged products',
      error: error.message
    });
  }
};

// @desc    Get damaged product statistics
// @route   GET /api/damaged-products/stats
exports.getDamagedProductStats = async (req, res) => {
  try {
    const totalDamaged = await DamagedProduct.countDocuments({ isDelete: false });
    
    const byStatus = await DamagedProduct.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalQuantity: { $sum: '$damaged_quantity' } } }
    ]);
    
    const byResolutionAction = await DamagedProduct.aggregate([
      { $match: { isDelete: false, resolution_action: { $ne: null } } },
      { $group: { _id: '$resolution_action', count: { $sum: 1 } } }
    ]);
    
    const totalQuantityDamaged = await DamagedProduct.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, total: { $sum: '$damaged_quantity' } } }
    ]);
    
    const pendingReview = await DamagedProduct.countDocuments({ 
      status: { $in: ['reported', 'reviewed'] }, 
      isDelete: false 
    });
    
    const notAdjusted = await DamagedProduct.countDocuments({ 
      inventory_adjusted: false,
      isDelete: false 
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalDamaged,
        totalQuantityDamaged: totalQuantityDamaged[0]?.total || 0,
        pendingReview,
        notAdjusted,
        byStatus,
        byResolutionAction
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching damaged product statistics',
      error: error.message
    });
  }
};

// @desc    Get single damaged product by ID
// @route   GET /api/damaged-products/:id
exports.getDamagedProductById = async (req, res) => {
  try {
    const damagedProduct = await DamagedProduct.findById(req.params.id)
      .populate({
        path: 'product_id',
        select: 'name description category unit price supplier_id current_stock minimum_stock_level maximum_stock_level image_link sku barcode',
        populate: {
          path: 'supplier_id',
          select: 'name contact_person_name phone email address'
        }
      });

    if (!damagedProduct || damagedProduct.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Damaged product not found'
      });
    }

    // Get shelf information for this product
    const productShelves = await ProductShelf.find({ 
      product_id: damagedProduct.product_id,
      isDelete: false 
    }).populate({
      path: 'shelf_id',
      select: 'shelf_number category capacity isfull note'
    });

    res.status(200).json({
      success: true,
      data: {
        ...damagedProduct.toObject(),
        shelves: productShelves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching damaged product',
      error: error.message
    });
  }
};

// @desc    Get damaged products by product ID
// @route   GET /api/damaged-products/product/:productId
exports.getDamagedProductsByProductId = async (req, res) => {
  try {
    const damagedProducts = await DamagedProduct.find({
      product_id: req.params.productId,
      isDelete: false
    })
      .populate('product_id', 'name category unit price current_stock')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: damagedProducts.length,
      data: damagedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching damaged products by product',
      error: error.message
    });
  }
};

// @desc    Create new damaged product report
// @route   POST /api/damaged-products
exports.createDamagedProduct = async (req, res) => {
  try {
    const {
      product_id,
      damaged_quantity,
      status = 'reported',
      description,
      image_urls,
      resolution_action,
      notes
    } = req.body;

    // Validate product exists
    const product = await Product.findById(product_id);
    if (!product || product.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create damaged product report
    const damagedProduct = await DamagedProduct.create({
      product_id,
      product_name: product.name,
      damaged_quantity,
      unit: product.unit,
      status,
      description,
      image_urls,
      resolution_action,
      inventory_adjusted: false,
      notes
    });

    // Populate for response
    const populatedDamagedProduct = await DamagedProduct.findById(damagedProduct._id)
      .populate({
        path: 'product_id',
        select: 'name category unit price supplier_id',
        populate: {
          path: 'supplier_id',
          select: 'name contact_person_name'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Damaged product report created successfully',
      data: populatedDamagedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating damaged product report',
      error: error.message
    });
  }
};

// @desc    Update damaged product report
// @route   PUT /api/damaged-products/:id
exports.updateDamagedProduct = async (req, res) => {
  try {
    const {
      status,
      description,
      resolution_action,
      inventory_adjusted,
      notes,
      image_urls
    } = req.body;

    let damagedProduct = await DamagedProduct.findById(req.params.id);

    if (!damagedProduct || damagedProduct.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Damaged product not found'
      });
    }

    // Update fields
    if (status) damagedProduct.status = status;
    if (description) damagedProduct.description = description;
    if (resolution_action) damagedProduct.resolution_action = resolution_action;
    if (inventory_adjusted !== undefined) damagedProduct.inventory_adjusted = inventory_adjusted;
    if (notes) damagedProduct.notes = notes;
    if (image_urls) damagedProduct.image_urls = image_urls;

    await damagedProduct.save();

    // Populate for response
    const populatedDamagedProduct = await DamagedProduct.findById(damagedProduct._id)
      .populate({
        path: 'product_id',
        select: 'name category unit price supplier_id',
        populate: {
          path: 'supplier_id',
          select: 'name contact_person_name'
        }
      });

    res.status(200).json({
      success: true,
      message: 'Damaged product updated successfully',
      data: populatedDamagedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating damaged product',
      error: error.message
    });
  }
};

// @desc    Adjust inventory for damaged product
// @route   PUT /api/damaged-products/:id/adjust-inventory
exports.adjustInventoryForDamaged = async (req, res) => {
  try {
    const damagedProduct = await DamagedProduct.findById(req.params.id);

    if (!damagedProduct || damagedProduct.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Damaged product not found'
      });
    }

    if (damagedProduct.inventory_adjusted) {
      return res.status(400).json({
        success: false,
        message: 'Inventory already adjusted for this damaged product'
      });
    }

    // Update product stock
    const product = await Product.findById(damagedProduct.product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Deduct damaged quantity from current stock
    product.current_stock = Math.max(0, product.current_stock - damagedProduct.damaged_quantity);
    await product.save();

    // Mark as adjusted
    damagedProduct.inventory_adjusted = true;
    damagedProduct.status = 'resolved';
    await damagedProduct.save();

    res.status(200).json({
      success: true,
      message: 'Inventory adjusted successfully',
      data: {
        damagedProduct,
        product: {
          _id: product._id,
          name: product.name,
          previous_stock: product.current_stock + damagedProduct.damaged_quantity,
          current_stock: product.current_stock,
          deducted: damagedProduct.damaged_quantity
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adjusting inventory',
      error: error.message
    });
  }
};

// @desc    Delete (soft delete) damaged product
// @route   DELETE /api/damaged-products/:id
exports.deleteDamagedProduct = async (req, res) => {
  try {
    const damagedProduct = await DamagedProduct.findById(req.params.id);

    if (!damagedProduct || damagedProduct.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Damaged product not found'
      });
    }

    damagedProduct.isDelete = true;
    await damagedProduct.save();

    res.status(200).json({
      success: true,
      message: 'Damaged product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting damaged product',
      error: error.message
    });
  }
};

// @desc    Get shelves for a specific damaged product's product
// @route   GET /api/damaged-products/:id/shelves
exports.getDamagedProductShelves = async (req, res) => {
  try {
    const damagedProduct = await DamagedProduct.findById(req.params.id);

    if (!damagedProduct || damagedProduct.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Damaged product not found'
      });
    }

    // Get all shelves containing this product
    const productShelves = await ProductShelf.find({ 
      product_id: damagedProduct.product_id,
      isDelete: false 
    }).populate({
      path: 'shelf_id',
      select: 'shelf_number category capacity isfull note warehouse_id'
    });

    res.status(200).json({
      success: true,
      count: productShelves.length,
      data: {
        product_id: damagedProduct.product_id,
        product_name: damagedProduct.product_name,
        shelves: productShelves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shelves for damaged product',
      error: error.message
    });
  }
};

// @desc    Bulk update damaged products status
// @route   PUT /api/damaged-products/bulk/update-status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of damaged product IDs'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }

    const result = await DamagedProduct.updateMany(
      { _id: { $in: ids }, isDelete: false },
      { status }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} damaged product(s)`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk updating damaged products',
      error: error.message
    });
  }
};
