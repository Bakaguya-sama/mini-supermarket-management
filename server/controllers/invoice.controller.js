// server/controllers/invoice.controller.js
const models = require('../models');

// Get all invoices with pagination
exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.paymentStatus = status;
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerId.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await models.Invoice.find(filter)
      .populate('customerId', 'membershipType')
      .populate({
        path: 'customerId',
        populate: { path: 'accountId', select: 'fullName email' }
      })
      .populate('orderId', 'orderNumber status')
      .limit(Number(limit))
      .skip(skip)
      .sort({ invoiceDate: -1 });

    const total = await models.Invoice.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách hóa đơn thành công',
      data: invoices,
      pagination: { total, page: Number(page), limit: Number(limit), pages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hóa đơn',
      error: error.message
    });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await models.Invoice.findById(req.params.id)
      .populate({
        path: 'customerId',
        populate: { path: 'accountId', select: 'fullName email phone' }
      })
      .populate('orderId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Get invoice items
    const items = await models.InvoiceItem.find({ invoiceId: req.params.id })
      .populate('productId', 'name unit price');

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin hóa đơn thành công',
      data: { ...invoice.toObject(), items }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin hóa đơn',
      error: error.message
    });
  }
};

// Get invoices by customer ID
exports.getInvoicesByCustomer = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const invoices = await models.Invoice.find({ customerId: req.params.customerId })
      .populate('orderId', 'orderNumber status')
      .limit(Number(limit))
      .skip(skip)
      .sort({ invoiceDate: -1 });

    const total = await models.Invoice.countDocuments({ customerId: req.params.customerId });
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách hóa đơn của khách hàng thành công',
      data: invoices,
      pagination: { total, page: Number(page), limit: Number(limit), pages }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hóa đơn',
      error: error.message
    });
  }
};

// Get invoices by order ID
exports.getInvoicesByOrder = async (req, res) => {
  try {
    const invoices = await models.Invoice.find({ orderId: req.params.orderId })
      .populate('customerId', 'membershipType')
      .populate({
        path: 'customerId',
        populate: { path: 'accountId', select: 'fullName' }
      });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách hóa đơn của đơn hàng thành công',
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hóa đơn',
      error: error.message
    });
  }
};

// Create new invoice
exports.createInvoice = async (req, res) => {
  try {
    const { customerId, orderId, items, notes } = req.body;

    // Validate required fields
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'customerId và items là bắt buộc'
      });
    }

    // Check if customer exists
    const customer = await models.Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Generate invoice number
    const count = await models.Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const product = await models.Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Sản phẩm ${item.productId} không tồn tại`
        });
      }
      const itemTotal = (item.quantity || 1) * (item.unitPrice || product.price);
      totalAmount += itemTotal;
    }

    // Create invoice
    const invoice = await models.Invoice.create({
      invoiceNumber,
      customerId,
      orderId,
      totalAmount,
      notes,
      paymentStatus: 'unpaid'
    });

    // Create invoice items
    for (const item of items) {
      const product = await models.Product.findById(item.productId);
      await models.InvoiceItem.create({
        invoiceId: invoice._id,
        productId: item.productId,
        description: product.name,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || product.price,
        amount: (item.quantity || 1) * (item.unitPrice || product.price)
      });
    }

    const populatedInvoice = await models.Invoice.findById(invoice._id)
      .populate({
        path: 'customerId',
        populate: { path: 'accountId', select: 'fullName email' }
      })
      .populate('orderId');

    res.status(201).json({
      success: true,
      message: 'Tạo hóa đơn thành công',
      data: populatedInvoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo hóa đơn',
      error: error.message
    });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { notes } = req.body;

    const invoice = await models.Invoice.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true, runValidators: true }
    ).populate({
      path: 'customerId',
      populate: { path: 'accountId', select: 'fullName' }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật hóa đơn thành công',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật hóa đơn',
      error: error.message
    });
  }
};

// Update invoice payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['unpaid', 'paid', 'partial'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái thanh toán không hợp lệ'
      });
    }

    const invoice = await models.Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    ).populate({
      path: 'customerId',
      populate: { path: 'accountId', select: 'fullName' }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái thanh toán',
      error: error.message
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await models.Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn'
      });
    }

    // Delete invoice items
    await models.InvoiceItem.deleteMany({ invoiceId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Xóa hóa đơn thành công',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hóa đơn',
      error: error.message
    });
  }
};

// Get invoice statistics
exports.getInvoiceStatistics = async (req, res) => {
  try {
    const total = await models.Invoice.countDocuments();
    
    const statusCounts = await models.Invoice.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    const totalRevenue = await models.Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const averageInvoiceAmount = await models.Invoice.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ]);

    const invoicesByMonth = await models.Invoice.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' }
          },
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê hóa đơn thành công',
      data: {
        total,
        statusCounts,
        totalRevenue: totalRevenue[0]?.total || 0,
        averageInvoiceAmount: averageInvoiceAmount[0]?.avg || 0,
        invoicesByMonth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};
