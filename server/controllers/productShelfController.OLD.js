// controllers/productShelfController.js
const { ProductShelf, Product, Shelf } = require('../models');

// @desc    Get all product-shelf mappings with filters and pagination
// @route   GET /api/product-shelves
exports.getAllProductShelves = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      product_id,
      shelf_id,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { isDelete: false };
    if (product_id) query.product_id = product_id;
    if (shelf_id) query.shelf_id = shelf_id;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const productShelves = await ProductShelf.find(query)
      .populate({
        path: 'product_id',
        select: 'name category unit price current_stock image_link sku barcode'
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number category capacity isfull note'
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductShelf.countDocuments(query);

    res.status(200).json({
      success: true,
      count: productShelves.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: productShelves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product-shelf mappings',
      error: error.message
    });
  }
};

// @desc    Get product-shelf mapping statistics
// @route   GET /api/product-shelves/stats
exports.getProductShelfStats = async (req, res) => {
  try {
    const totalMappings = await ProductShelf.countDocuments({ isDelete: false });
    
    const totalQuantity = await ProductShelf.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const byShelves = await ProductShelf.aggregate([
      { $match: { isDelete: false } },
      { 
        $lookup: {
          from: 'shelves',
          localField: 'shelf_id',
          foreignField: '_id',
          as: 'shelf'
        }
      },
      { $unwind: '$shelf' },
      { 
        $group: { 
          _id: {
            shelf_id: '$shelf_id',
            shelf_number: '$shelf.shelf_number'
          }, 
          product_count: { $sum: 1 },
          total_quantity: { $sum: '$quantity' }
        } 
      },
      { $sort: { '_id.shelf_number': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_mappings: totalMappings,
        total_quantity: totalQuantity[0]?.total || 0,
        by_shelves: byShelves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product-shelf statistics',
      error: error.message
    });
  }
};

// @desc    Get single product-shelf mapping by ID
// @route   GET /api/product-shelves/:id
exports.getProductShelfById = async (req, res) => {
  try {
    const productShelf = await ProductShelf.findById(req.params.id)
      .populate({
        path: 'product_id',
        select: 'name description category unit price current_stock minimum_stock_level image_link sku barcode'
      })
      .populate({
        path: 'shelf_id',
        select: 'shelf_number category capacity isfull note warehouse_id'
      });

    if (!productShelf || productShelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Product-shelf mapping not found'
      });
    }

    res.status(200).json({
      success: true,
      data: productShelf
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product-shelf mapping',
      error: error.message
    });
  }
};

// @desc    Get all shelves for a specific product
// @route   GET /api/product-shelves/product/:productId/shelves
exports.getShelvesByProduct = async (req, res) => {
  try {
    const productShelves = await ProductShelf.find({
      product_id: req.params.productId,
      isDelete: false
    }).populate({
      path: 'shelf_id',
      select: 'shelf_number category capacity isfull note'
    });

    const product = await Product.findById(req.params.productId).select('name category');

    res.status(200).json({
      success: true,
      count: productShelves.length,
      data: {
        product,
        shelves: productShelves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shelves for product',
      error: error.message
    });
  }
};

// @desc    Get all products on a specific shelf
// @route   GET /api/product-shelves/shelf/:shelfId/products
exports.getProductsByShelf = async (req, res) => {
  try {
    const productShelves = await ProductShelf.find({
      shelf_id: req.params.shelfId,
      isDelete: false
    }).populate({
      path: 'product_id',
      select: 'name category unit price current_stock image_link sku'
    });

    const shelf = await Shelf.findById(req.params.shelfId).select('shelf_number category capacity isfull');

    res.status(200).json({
      success: true,
      count: productShelves.length,
      data: {
        shelf,
        products: productShelves
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products on shelf',
      error: error.message
    });
  }
};

// @desc    Create new product-shelf mapping (assign product to shelf)
// @route   POST /api/product-shelves
exports.createProductShelf = async (req, res) => {
  try {
    const {
      product_id,
      shelf_id,
      quantity = 0
    } = req.body;

    // Validate product exists
    const product = await Product.findById(product_id);
    if (!product || product.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate shelf exists
    const shelf = await Shelf.findById(shelf_id);
    if (!shelf || shelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Shelf not found'
      });
    }

    // Check if mapping already exists
    const existingMapping = await ProductShelf.findOne({ 
      product_id, 
      shelf_id,
      isDelete: false
    });
    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: 'Product is already assigned to this shelf'
      });
    }

    // Create mapping
    const productShelf = await ProductShelf.create({
      product_id,
      shelf_id,
      quantity
    });

    // Populate for response
    const populatedProductShelf = await ProductShelf.findById(productShelf._id)
      .populate('product_id', 'name category unit')
      .populate('shelf_id', 'shelf_number category');

    res.status(201).json({
      success: true,
      message: 'Product assigned to shelf successfully',
      data: populatedProductShelf
    });
  } catch (error) {
    // Handle unique constraint error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product is already assigned to this shelf'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating product-shelf mapping',
      error: error.message
    });
  }
};

// @desc    Update product-shelf mapping quantity
// @route   PUT /api/product-shelves/:id
exports.updateProductShelf = async (req, res) => {
  try {
    let productShelf = await ProductShelf.findById(req.params.id);

    if (!productShelf || productShelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Product-shelf mapping not found'
      });
    }

    const { quantity } = req.body;

    if (quantity !== undefined) {
      productShelf.quantity = quantity;
    }

    await productShelf.save();

    // Populate for response
    const populatedProductShelf = await ProductShelf.findById(productShelf._id)
      .populate('product_id', 'name category unit')
      .populate('shelf_id', 'shelf_number category');

    res.status(200).json({
      success: true,
      message: 'Product-shelf mapping updated successfully',
      data: populatedProductShelf
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product-shelf mapping',
      error: error.message
    });
  }
};

// @desc    Move product from one shelf to another
// @route   PUT /api/product-shelves/:id/move
exports.moveProductToShelf = async (req, res) => {
  try {
    const { new_shelf_id, quantity } = req.body;

    const productShelf = await ProductShelf.findById(req.params.id);

    if (!productShelf || productShelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Product-shelf mapping not found'
      });
    }

    // Validate new shelf exists
    const newShelf = await Shelf.findById(new_shelf_id);
    if (!newShelf || newShelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'New shelf not found'
      });
    }

    const oldShelfId = productShelf.shelf_id;

    // Check if product already on new shelf
    const existingMapping = await ProductShelf.findOne({
      product_id: productShelf.product_id,
      shelf_id: new_shelf_id,
      isDelete: false
    });

    if (existingMapping) {
      // If exists, just add quantity
      existingMapping.quantity += quantity || productShelf.quantity;
      await existingMapping.save();
      
      // Delete old mapping
      productShelf.isDelete = true;
      await productShelf.save();

      const result = await ProductShelf.findById(existingMapping._id)
        .populate('product_id', 'name category')
        .populate('shelf_id', 'shelf_number category');

      return res.status(200).json({
        success: true,
        message: 'Product moved to shelf successfully (merged with existing)',
        data: result
      });
    } else {
      // Move to new shelf
      productShelf.shelf_id = new_shelf_id;
      if (quantity !== undefined) {
        productShelf.quantity = quantity;
      }
      await productShelf.save();

      const result = await ProductShelf.findById(productShelf._id)
        .populate('product_id', 'name category')
        .populate('shelf_id', 'shelf_number category');

      return res.status(200).json({
        success: true,
        message: 'Product moved to shelf successfully',
        data: result
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error moving product to shelf',
      error: error.message
    });
  }
};

// @desc    Delete (soft delete) product-shelf mapping
// @route   DELETE /api/product-shelves/:id
exports.deleteProductShelf = async (req, res) => {
  try {
    const productShelf = await ProductShelf.findById(req.params.id);

    if (!productShelf || productShelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Product-shelf mapping not found'
      });
    }

    productShelf.isDelete = true;
    await productShelf.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from shelf successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product-shelf mapping',
      error: error.message
    });
  }
};

// @desc    Bulk assign products to shelf
// @route   POST /api/product-shelves/bulk/assign
exports.bulkAssignToShelf = async (req, res) => {
  try {
    const { shelf_id, products } = req.body;
    // products = [{ product_id, quantity }, ...]

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of products'
      });
    }

    // Validate shelf exists
    const shelf = await Shelf.findById(shelf_id);
    if (!shelf || shelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: 'Shelf not found'
      });
    }

    const results = [];
    const errors = [];

    for (const item of products) {
      try {
        const { product_id, quantity = 0 } = item;

        // Check if already exists
        const existing = await ProductShelf.findOne({ 
          product_id, 
          shelf_id,
          isDelete: false
        });

        if (existing) {
          errors.push({ product_id, error: 'Already assigned to this shelf' });
          continue;
        }

        const productShelf = await ProductShelf.create({
          product_id,
          shelf_id,
          quantity
        });

        results.push(productShelf);
      } catch (err) {
        errors.push({ product_id: item.product_id, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Assigned ${results.length} product(s) to shelf`,
      data: {
        created: results.length,
        errors: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk assigning products',
      error: error.message
    });
  }
};
