// server/controllers/supplier.controller.js
const models = require('../models');

// ==================== GET ALL SUPPLIERS ====================
exports.getAllSuppliers = async (req, res) => {
  try {
    const { status = 'active', search, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (status) query.isActive = status === 'active';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPersonName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const suppliers = await models.Supplier.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await models.Supplier.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách nhà cung cấp thành công',
      data: suppliers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllSuppliers:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách nhà cung cấp',
      error: error.message
    });
  }
};

// ==================== GET SUPPLIER BY ID ====================
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await models.Supplier.findById(id).lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Nhà cung cấp không tồn tại'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin nhà cung cấp thành công',
      data: supplier
    });
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin nhà cung cấp',
      error: error.message
    });
  }
};

// ==================== CREATE SUPPLIER ====================
exports.createSupplier = async (req, res) => {
  try {
    const { 
      name, 
      contactPersonName, 
      email, 
      phone, 
      address,
      website,
      taxId,
      note
    } = req.body;

    if (!name || !contactPersonName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Các trường bắt buộc: name, contactPersonName, email, phone'
      });
    }

    // Check duplicate email
    const existingSupplier = await models.Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(409).json({
        success: false,
        message: 'Email nhà cung cấp đã tồn tại'
      });
    }

    const newSupplier = await models.Supplier.create({
      name,
      contactPersonName,
      email,
      phone,
      address,
      website,
      taxId,
      note,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo nhà cung cấp thành công',
      data: newSupplier
    });
  } catch (error) {
    console.error('Error in createSupplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tạo nhà cung cấp',
      error: error.message
    });
  }
};

// ==================== UPDATE SUPPLIER ====================
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      contactPersonName, 
      email, 
      phone, 
      address,
      website,
      taxId,
      note,
      isActive
    } = req.body;

    const supplier = await models.Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Nhà cung cấp không tồn tại'
      });
    }

    // Check email duplication
    if (email && email !== supplier.email) {
      const existingEmail = await models.Supplier.findOne({
        email,
        _id: { $ne: id }
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (contactPersonName) updateData.contactPersonName = contactPersonName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (website) updateData.website = website;
    if (taxId) updateData.taxId = taxId;
    if (note) updateData.note = note;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSupplier = await models.Supplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật nhà cung cấp thành công',
      data: updatedSupplier
    });
  } catch (error) {
    console.error('Error in updateSupplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật nhà cung cấp',
      error: error.message
    });
  }
};

// ==================== DELETE SUPPLIER ====================
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.body;

    const supplier = await models.Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Nhà cung cấp không tồn tại'
      });
    }

    if (hardDelete) {
      await models.Supplier.findByIdAndDelete(id);
    } else {
      await models.Supplier.findByIdAndUpdate(id, { isActive: false });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa nhà cung cấp thành công'
    });
  } catch (error) {
    console.error('Error in deleteSupplier:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xóa nhà cung cấp',
      error: error.message
    });
  }
};

// ==================== GET ACTIVE SUPPLIERS ====================
exports.getActiveSuppliers = async (req, res) => {
  try {
    const suppliers = await models.Supplier.find({ isActive: true })
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách nhà cung cấp hoạt động thành công',
      data: suppliers
    });
  } catch (error) {
    console.error('Error in getActiveSuppliers:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy danh sách nhà cung cấp',
      error: error.message
    });
  }
};

// ==================== GET SUPPLIER STATISTICS ====================
exports.getSupplierStatistics = async (req, res) => {
  try {
    const totalSuppliers = await models.Supplier.countDocuments();
    const activeSuppliers = await models.Supplier.countDocuments({ isActive: true });
    const inactiveSuppliers = totalSuppliers - activeSuppliers;

    // Get products per supplier
    const suppliersWithProducts = await models.Product.aggregate([
      {
        $group: {
          _id: '$supplierId',
          productCount: { $sum: 1 }
        }
      }
    ]);

    const statistics = {
      total: totalSuppliers,
      active: activeSuppliers,
      inactive: inactiveSuppliers,
      topSuppliers: suppliersWithProducts.slice(0, 5)
    };

    return res.status(200).json({
      success: true,
      message: 'Lấy thống kê nhà cung cấp thành công',
      data: statistics
    });
  } catch (error) {
    console.error('Error in getSupplierStatistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê nhà cung cấp',
      error: error.message
    });
  }
};
