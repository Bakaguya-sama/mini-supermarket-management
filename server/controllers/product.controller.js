// server/controllers/product.controller.js
const models = require('../models');

// ==================== GET ALL PRODUCTS ====================
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, status, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const products = await models.Product.find(query)
      .populate('supplierId', 'name email phone')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await models.Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

// ==================== GET PRODUCT BY ID ====================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await models.Product.findById(id)
      .populate('supplierId', 'name email phone address')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin sản phẩm thành công',
      data: product
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin sản phẩm',
      error: error.message
    });
  }
};

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      unit, 
      price, 
      minimumStockLevel,
      maximumStockLevel,
      supplierId, 
      category,
      currentStock = 0
    } = req.body;

    if (!name || !unit || !price || !supplierId) {
      return res.status(400).json({
        success: false,
        message: 'Các trường bắt buộc: name, unit, price, supplierId'
      });
    }

    // Verify supplier exists
    const supplier = await models.Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Nhà cung cấp không tồn tại'
      });
    }

    const newProduct = await models.Product.create({
      name,
      description,
      unit,
      price,
      currentStock,
      minimumStockLevel: minimumStockLevel || 10,
      maximumStockLevel: maximumStockLevel || 1000,
      supplierId,
      category: category || 'Uncategorized',
      status: 'available'
    });

    await newProduct.populate('supplierId', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: newProduct
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo sản phẩm',
      error: error.message
    });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      minimumStockLevel,
      maximumStockLevel,
      category,
      status
    } = req.body;

    const product = await models.Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = price;
    if (minimumStockLevel) updateData.minimumStockLevel = minimumStockLevel;
    if (maximumStockLevel) updateData.maximumStockLevel = maximumStockLevel;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    const updatedProduct = await models.Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('supplierId', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật sản phẩm',
      error: error.message
    });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await models.Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    // Soft delete
    await models.Product.findByIdAndUpdate(id, { status: 'discontinued' });

    return res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa sản phẩm',
      error: error.message
    });
  }
};

// ==================== UPDATE STOCK ====================
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'add' } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'quantity là bắt buộc'
      });
    }

    const product = await models.Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    let newStock;
    if (operation === 'add') {
      newStock = product.currentStock + quantity;
    } else if (operation === 'subtract') {
      newStock = product.currentStock - quantity;
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Không đủ hàng trong kho'
        });
      }
    } else {
      newStock = quantity;
    }

    // Update status based on stock
    let status = 'available';
    if (newStock === 0) status = 'out_of_stock';
    if (newStock < product.minimumStockLevel) status = 'available'; // Low stock but still available

    const updatedProduct = await models.Product.findByIdAndUpdate(
      id,
      { currentStock: newStock, status },
      { new: true }
    ).populate('supplierId', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật kho hàng thành công',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error in updateStock:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật kho hàng',
      error: error.message
    });
  }
};

// ==================== GET PRODUCTS BY CATEGORY ====================
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (page - 1) * limit;
    const products = await models.Product.find({ category, status: 'available' })
      .populate('supplierId', 'name')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await models.Product.countDocuments({ category, status: 'available' });

    return res.status(200).json({
      success: true,
      message: `Lấy danh sách sản phẩm ${category} thành công`,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

// ==================== GET LOW STOCK PRODUCTS ====================
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await models.Product.find({
      $expr: { $lt: ['$currentStock', '$minimumStockLevel'] }
    }).populate('supplierId', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm hết kho thành công',
      data: products
    });
  } catch (error) {
    console.error('Error in getLowStockProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách sản phẩm hết kho',
      error: error.message
    });
  }
};

// ==================== GET PRODUCT STATISTICS ====================
exports.getProductStatistics = async (req, res) => {
  try {
    const totalProducts = await models.Product.countDocuments({ status: 'available' });
    const lowStockProducts = await models.Product.countDocuments({
      $expr: { $lt: ['$currentStock', '$minimumStockLevel'] }
    });
    const outOfStock = await models.Product.countDocuments({ status: 'out_of_stock' });
    
    const categories = await models.Product.distinct('category');

    const statistics = {
      total: totalProducts,
      lowStock: lowStockProducts,
      outOfStock,
      categories: categories.length,
      categoryList: categories
    };

    return res.status(200).json({
      success: true,
      message: 'Lấy thống kê sản phẩm thành công',
      data: statistics
    });
  } catch (error) {
    console.error('Error in getProductStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê sản phẩm',
      error: error.message
    });
  }
};
