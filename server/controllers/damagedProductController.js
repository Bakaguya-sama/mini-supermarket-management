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
          select: 'name contact_person_name phone email address'
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
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

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

    // Nếu có shelf_id, GIẢM SỐ LƯỢNG TỪ SHELF (quan trọng!)
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
          message: 'Product not found on this shelf. Please verify the shelf location.'
        });
      }

      // Kiểm tra shelf có đủ số lượng không
      if (productShelf.quantity < damaged_quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity on shelf. Available: ${productShelf.quantity}, Damaged: ${damaged_quantity}`
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

      // GIẢM TỪ ProductShelf (QUAN TRỌNG: Đây là nơi giảm số lượng product trên shelf)
      const previousShelfQty = productShelf.quantity;
      productShelf.quantity -= damaged_quantity;
      await productShelf.save();

      console.log(`[DAMAGED PRODUCT] Reduced shelf quantity: ${previousShelfQty} -> ${productShelf.quantity} (product: ${product.name}, shelf: ${shelf.shelf_number})`);

      // GIẢM TỪ Shelf current_quantity
      const previousShelfTotal = shelf.current_quantity;
      shelf.current_quantity = Math.max(0, (shelf.current_quantity || 0) - damaged_quantity);
      await shelf.save();

      console.log(`[DAMAGED PRODUCT] Reduced shelf total: ${previousShelfTotal} -> ${shelf.current_quantity} (shelf: ${shelf.shelf_number})`);

      // Nếu ProductShelf quantity = 0, soft delete
      if (productShelf.quantity === 0) {
        productShelf.isDelete = true;
        await productShelf.save();
        console.log(`[DAMAGED PRODUCT] ProductShelf soft deleted (quantity = 0)`);
      }
    }

    // Tạo damaged product report
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
      inventory_adjusted: false, // Chưa adjust warehouse inventory
      notes
    });

    console.log(`[DAMAGED PRODUCT] Created damaged product report: ${damagedProduct._id}`);

    // Populate for response với đầy đủ thông tin supplier
    const populatedDamagedProduct = await DamagedProduct.findById(damagedProduct._id)
      .populate({
        path: 'product_id',
        select: 'name category unit price supplier_id current_stock image_link sku barcode',
        populate: {
          path: 'supplier_id',
          select: 'name contact_person_name phone email address'
        }
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number capacity current_quantity'
      });

    res.status(201).json({
      success: true,
      message: shelf_id 
        ? `Damaged product reported. Deducted ${damaged_quantity} units from shelf ${populatedDamagedProduct.shelf_id?.shelf_number || 'N/A'}.`
        : 'Damaged product report created successfully (no shelf specified)',
      data: populatedDamagedProduct
    });
  } catch (error) {
    console.error('[DAMAGED PRODUCT ERROR]', error);
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
    // Lấy tất cả fields từ request body
    const updateFields = req.body;
    
    console.log('[DAMAGED PRODUCT UPDATE] Received update request:', {
      id: req.params.id,
      body: updateFields
    });

    // DANH SÁCH CÁC FIELD KHÔNG ĐƯỢC PHÉP UPDATE
    const restrictedFields = ['damaged_quantity', 'product_id', 'shelf_id', 'product_name', 'unit'];

    // Lấy damaged product hiện tại
    let damagedProduct = await DamagedProduct.findById(req.params.id);

    if (!damagedProduct || damagedProduct.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Damaged product not found'
      });
    }

    // Kiểm tra nếu user cố update các field không được phép với giá trị KHÁC giá trị hiện tại
    for (const field of restrictedFields) {
      if (updateFields[field] !== undefined && 
          updateFields[field] !== damagedProduct[field]?.toString() &&
          updateFields[field] !== damagedProduct[field]) {
        console.log(`[DAMAGED PRODUCT UPDATE] Rejected: Attempted to update restricted field: ${field}`);
        return res.status(400).json({
          success: false,
          message: `Cannot update ${field}. Only information fields (status, description, resolution_action, notes, image_urls, inventory_adjusted) can be updated.`
        });
      }
    }

    // CHỈ UPDATE CÁC FIELD INFORMATION CHO PHÉP
    const allowedFields = ['status', 'description', 'resolution_action', 'inventory_adjusted', 'notes', 'image_urls'];
    
    let updatedFields = [];
    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        damagedProduct[field] = updateFields[field];
        updatedFields.push(field);
      }
    }
    
    console.log('[DAMAGED PRODUCT UPDATE] Updated fields:', updatedFields);

    await damagedProduct.save();

    // Populate for response với đầy đủ thông tin supplier
    const populatedDamagedProduct = await DamagedProduct.findById(damagedProduct._id)
      .populate({
        path: 'product_id',
        select: 'name category unit price supplier_id current_stock image_link',
        populate: {
          path: 'supplier_id',
          select: 'name contact_person_name phone email address'
        }
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number shelf_name section_number slot_number capacity current_quantity'
      });

    res.status(200).json({
      success: true,
      message: 'Damaged product information updated successfully',
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

    // QUAN TRỌNG: Khi xóa damaged product record, KHÔNG RESTORE số lượng vào shelf
    // Vì product đã bị hỏng thực sự, xóa record chỉ để dọn dẹp dữ liệu
    // Số lượng đã được trừ khi tạo damaged product và không thể hoàn trả
    
    console.log(`[DAMAGED PRODUCT DELETE] Deleting damaged product record: ${damagedProduct._id} (quantity: ${damagedProduct.damaged_quantity}, shelf: ${damagedProduct.shelf_id})`);

    // Soft delete damaged product record
    damagedProduct.isDelete = true;
    await damagedProduct.save();

    res.status(200).json({
      success: true,
      message: 'Damaged product record deleted successfully. Note: Shelf quantity was already reduced and will not be restored.'
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
