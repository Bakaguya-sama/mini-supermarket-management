// controllers/supplierController.js
const { Supplier, Product } = require('../models');

// @desc    Get all suppliers with filters and pagination
// @route   GET /api/suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      is_active,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};
    if (is_active !== undefined) query.is_active = is_active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact_person_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const suppliers = await Supplier.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supplier.countDocuments(query);

    // Get product count for each supplier
    const suppliersWithProductCount = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({
          supplier_id: supplier._id,
          status: 'active'
        });
        return {
          ...supplier.toObject(),
          productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: suppliers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: suppliersWithProductCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers',
      error: error.message
    });
  }
};

// @desc    Get supplier statistics
// @route   GET /api/suppliers/stats
exports.getSupplierStats = async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ is_active: true });
    const inactiveSuppliers = await Supplier.countDocuments({ is_active: false });

    // Get suppliers with product counts
    const suppliersWithProducts = await Product.aggregate([
      { $match: { supplier_id: { $ne: null } } },
      {
        $group: {
          _id: '$supplier_id',
          productCount: { $sum: 1 },
          totalStock: { $sum: '$current_stock' }
        }
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: '_id',
          foreignField: '_id',
          as: 'supplier'
        }
      },
      { $unwind: '$supplier' },
      {
        $project: {
          supplierName: '$supplier.name',
          productCount: 1,
          totalStock: 1
        }
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalSuppliers,
        active: activeSuppliers,
        inactive: inactiveSuppliers,
        topSuppliers: suppliersWithProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier statistics',
      error: error.message
    });
  }
};

// @desc    Get all active suppliers
// @route   GET /api/suppliers/active
exports.getActiveSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ is_active: true })
      .select('name contact_person_name email phone')
      .sort('name');

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active suppliers',
      error: error.message
    });
  }
};

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get product count and list
    const productCount = await Product.countDocuments({
      supplier_id: supplier._id
    });

    const products = await Product.find({
      supplier_id: supplier._id
    })
      .select('name category current_stock price status')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...supplier.toObject(),
        productCount,
        recentProducts: products
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier',
      error: error.message
    });
  }
};

// @desc    Get all products from a supplier
// @route   GET /api/suppliers/:id/products
exports.getSupplierProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if supplier exists
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const query = { supplier_id: req.params.id };
    if (status) query.status = status;

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort('name');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      supplier: {
        id: supplier._id,
        name: supplier.name,
        contact_person_name: supplier.contact_person_name
      },
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier products',
      error: error.message
    });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
exports.createSupplier = async (req, res) => {
  try {
    const {
      name,
      contact_person_name,
      email,
      phone,
      website,
      address,
      tax_id,
      note,
      is_active = true
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide supplier name'
      });
    }

    // Check if supplier with same name already exists
    const existingSupplier = await Supplier.findOne({ name });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier with this name already exists'
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Supplier.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this email already exists'
        });
      }
    }

    const supplier = await Supplier.create({
      name,
      contact_person_name,
      email,
      phone,
      website,
      address,
      tax_id,
      note,
      is_active
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating supplier',
      error: error.message
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const {
      name,
      contact_person_name,
      email,
      phone,
      website,
      address,
      tax_id,
      note,
      is_active
    } = req.body;

    // Check if new name already exists (if name is being changed)
    if (name && name !== supplier.name) {
      const existingSupplier = await Supplier.findOne({ name });
      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this name already exists'
        });
      }
    }

    // Check if new email already exists (if email is being changed)
    if (email && email !== supplier.email) {
      const existingEmail = await Supplier.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Supplier with this email already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) supplier.name = name;
    if (contact_person_name !== undefined) supplier.contact_person_name = contact_person_name;
    if (email !== undefined) supplier.email = email;
    if (phone !== undefined) supplier.phone = phone;
    if (website !== undefined) supplier.website = website;
    if (address !== undefined) supplier.address = address;
    if (tax_id !== undefined) supplier.tax_id = tax_id;
    if (note !== undefined) supplier.note = note;
    if (is_active !== undefined) supplier.is_active = is_active;

    await supplier.save();

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating supplier',
      error: error.message
    });
  }
};

// @desc    Soft delete supplier (set is_active = false)
// @route   DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier has active products
    const activeProducts = await Product.countDocuments({
      supplier_id: supplier._id,
      status: 'active'
    });

    if (activeProducts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. There are ${activeProducts} active products associated with this supplier. Please discontinue or reassign these products first.`
      });
    }

    supplier.is_active = false;
    await supplier.save();

    res.status(200).json({
      success: true,
      message: 'Supplier deactivated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting supplier',
      error: error.message
    });
  }
};

// @desc    Permanently delete supplier
// @route   DELETE /api/suppliers/:id/permanent
exports.permanentDeleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier has any products
    const productCount = await Product.countDocuments({
      supplier_id: supplier._id
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot permanently delete supplier. There are ${productCount} products associated with this supplier. Please delete or reassign these products first.`
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Supplier permanently deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting supplier',
      error: error.message
    });
  }
};

// @desc    Activate supplier
// @route   PATCH /api/suppliers/:id/activate
exports.activateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    supplier.is_active = true;
    await supplier.save();

    res.status(200).json({
      success: true,
      message: 'Supplier activated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating supplier',
      error: error.message
    });
  }
};