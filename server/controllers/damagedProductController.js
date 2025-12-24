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
      .populate({
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number capacity current_quantity'
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
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number capacity current_quantity'
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
      .populate({
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number'
      })
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
      shelf_id,
      damaged_quantity,
      status = 'reported',
      description,
      image_urls,
      resolution_action,
      notes
    } = req.body;

    // Validate required fields
    if (!damaged_quantity || damaged_quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Damaged quantity must be greater than 0'
      });
    }

    // Validate product exists
    const product = await Product.findById(product_id);
    if (!product || product.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Nếu có shelf_id, deduct từ shelf
    if (shelf_id) {
      // Get ProductShelf mapping
      const productShelf = await ProductShelf.findOne({
        product_id,
        shelf_id,
        isDelete: false
      });

      if (!productShelf) {
        return res.status(404).json({
          success: false,
          message: 'Product not found on this shelf'
        });
      }

      // Check if shelf has enough quantity
      if (productShelf.quantity < damaged_quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough quantity on shelf. Available: ${productShelf.quantity}, Requested: ${damaged_quantity}`
        });
      }

      // Get shelf
      const shelf = await Shelf.findById(shelf_id);
      if (!shelf || shelf.isDelete) {
        return res.status(404).json({
          success: false,
          message: 'Shelf not found'
        });
      }

      // Deduct from ProductShelf
      productShelf.quantity -= damaged_quantity;
      await productShelf.save();

      // Deduct from Shelf current_quantity
      shelf.current_quantity = Math.max(0, (shelf.current_quantity || 0) - damaged_quantity);
      await shelf.save();

      // Nếu ProductShelf quantity = 0, có thể soft delete
      if (productShelf.quantity === 0) {
        productShelf.isDelete = true;
        await productShelf.save();
      }
    }

    // Create damaged product report
    const damagedProduct = await DamagedProduct.create({
      product_id,
      shelf_id: shelf_id || null,
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
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number capacity current_quantity'
      });

    res.status(201).json({
      success: true,
      message: shelf_id 
        ? `Damaged product reported and deducted ${damaged_quantity} units from shelf`
        : 'Damaged product report created successfully',
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
// @desc    Adjust warehouse inventory for damaged product
// @route   PUT /api/damaged-products/:id/adjust-inventory
// @note    This deducts from warehouse (product.current_stock)
//          Shelf quantity was already deducted during create if shelf_id was provided
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

    // Update product warehouse stock
    const product = await Product.findById(damagedProduct.product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Deduct damaged quantity from warehouse current_stock
    const previousStock = product.current_stock;
    product.current_stock = Math.max(0, product.current_stock - damagedProduct.damaged_quantity);
    await product.save();

    // Mark as adjusted and resolved
    damagedProduct.inventory_adjusted = true;
    damagedProduct.status = 'resolved';
    await damagedProduct.save();

    res.status(200).json({
      success: true,
      message: 'Warehouse inventory adjusted successfully (shelf was already deducted)',
      data: {
        damagedProduct,
        product: {
          _id: product._id,
          name: product.name,
          previous_stock: previousStock,
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

    // Nếu chưa inventory_adjusted và có shelf_id, restore về shelf
    if (!damagedProduct.inventory_adjusted && damagedProduct.shelf_id) {
      const product_id = damagedProduct.product_id;
      const shelf_id = damagedProduct.shelf_id;
      const damaged_quantity = damagedProduct.damaged_quantity;

      // Tìm hoặc tạo lại ProductShelf mapping
      let productShelf = await ProductShelf.findOne({
        product_id,
        shelf_id,
        isDelete: false
      });

      if (!productShelf) {
        // Nếu đã bị xóa (quantity = 0), restore lại
        productShelf = await ProductShelf.findOneAndUpdate(
          { product_id, shelf_id },
          { 
            quantity: damaged_quantity,
            isDelete: false 
          },
          { upsert: true, new: true }
        );
      } else {
        // Nếu vẫn còn, cộng thêm quantity
        productShelf.quantity += damaged_quantity;
        await productShelf.save();
      }

      // Cập nhật Shelf current_quantity
      const shelf = await Shelf.findById(shelf_id);
      if (shelf) {
        shelf.current_quantity = (shelf.current_quantity || 0) + damaged_quantity;
        await shelf.save();
      }
    }

    // Soft delete damaged product record
    damagedProduct.isDelete = true;
    await damagedProduct.save();

    res.status(200).json({
      success: true,
      message: damagedProduct.inventory_adjusted
        ? 'Damaged product deleted (inventory was already adjusted)'
        : 'Damaged product deleted and quantity restored to shelf'
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
