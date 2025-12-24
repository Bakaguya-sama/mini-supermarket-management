// controllers/invoiceController.js - INVOICE API HOÀN CHỈNH
const { Invoice, InvoiceItem, Order, Customer, Product } = require('../models');
const mongoose = require('mongoose');

/**
 * @desc    Get all invoices with filters
 * @route   GET /api/invoices
 * @access  Public
 */
exports.getAllInvoices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer_id,
      payment_status,
      payment_method,
      search,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sort = '-invoice_date'
    } = req.query;

    // Build query
    const query = { isDelete: false };
    if (customer_id) query.customer_id = customer_id;
    if (payment_status) query.payment_status = payment_status;
    if (search) {
      query.$or = [
        { invoice_number: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    if (minAmount || maxAmount) {
      query.total_amount = {};
      if (minAmount) query.total_amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.total_amount.$lte = parseFloat(maxAmount);
    }
    if (startDate || endDate) {
      query.invoice_date = {};
      if (startDate) query.invoice_date.$gte = new Date(startDate);
      if (endDate) query.invoice_date.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with optional payment_method filter
    let invoicesQuery = Invoice.find(query)
      .populate({
        path: 'customer_id',
        select: 'account_id membership_type',
        populate: {
          path: 'account_id',
          select: 'full_name email phone_number'
        }
      })
      .populate('order_id', 'order_number status payment_method')
      .populate({
        path: 'staff_id',
        select: 'account_id position',
        populate: {
          path: 'account_id',
          select: 'full_name email'
        }
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    let invoices = await invoicesQuery;

    // Filter by payment_method if provided (since it's in Order, not Invoice)
    if (payment_method && payment_method !== 'All Methods') {
      invoices = invoices.filter(invoice => 
        invoice.order_id && invoice.order_id.payment_method === payment_method
      );
    }

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

/**
 * @desc    Get single invoice by ID
 * @route   GET /api/invoices/:id
 * @access  Public
 */
exports.getInvoiceById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice ID'
      });
    }

    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'customer_id',
        select: 'account_id membership_type total_spent',
        populate: {
          path: 'account_id',
          select: 'full_name email phone_number'
        }
      })
      .populate({
        path: 'order_id',
        select: 'order_number status total_amount delivery_date payment_method'
      })
      .populate({
        path: 'staff_id',
        select: 'account_id position',
        populate: {
          path: 'account_id',
          select: 'full_name email'
        }
      });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Get invoice items
    const items = await InvoiceItem.find({ invoice_id: req.params.id })
      .populate('product_id', 'name sku category retail_price');

    res.status(200).json({
      success: true,
      data: {
        ...invoice.toObject(),
        items
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Get invoices by customer
 * @route   GET /api/invoices/customer/:customerId
 * @access  Public
 */
exports.getInvoicesByCustomer = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify customer exists
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const invoices = await Invoice.find({ customer_id: req.params.customerId, isDelete: false })
      .populate('order_id', 'order_number status')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-invoice_date');

    const total = await Invoice.countDocuments({ customer_id: req.params.customerId, isDelete: false });

    res.status(200).json({
      success: true,
      customer: {
        id: customer._id,
        account_id: customer.account_id
      },
      count: invoices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer invoices',
      error: error.message
    });
  }
};

/**
 * @desc    Get invoice statistics
 * @route   GET /api/invoices/stats
 * @access  Public
 */
exports.getInvoiceStats = async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments({ isDelete: false });

    const invoiceByStatus = await Invoice.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: '$payment_status', count: { $sum: 1 } } }
    ]);

    const totalAmount = await Invoice.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, totalAmount: { $sum: '$total_amount' }, avgAmount: { $avg: '$total_amount' } } }
    ]);

    const unpaidAmount = await Invoice.aggregate([
      { $match: { isDelete: false, payment_status: 'unpaid' } },
      { $group: { _id: null, totalAmount: { $sum: '$total_amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalInvoices,
        byStatus: invoiceByStatus,
        totalAmount: totalAmount[0]?.totalAmount || 0,
        avgAmount: totalAmount[0]?.avgAmount || 0,
        unpaidAmount: unpaidAmount[0]?.totalAmount || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Create new invoice
 * @route   POST /api/invoices
 * @access  Public
 */
exports.createInvoice = async (req, res) => {
  try {
    const {
      customer_id,
      order_id,
      staff_id,
      items,
      payment_method,
      subtotal,
      discount_amount,
      tax_amount,
      notes
    } = req.body;

    // Validate required fields
    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer ID and items'
      });
    }

    // Verify customer exists
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify order exists (if provided)
    if (order_id) {
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    }

    // Verify staff exists (if provided)
    if (staff_id) {
      const staff = await mongoose.model('Staff').findById(staff_id);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Calculate amounts
    let calculatedSubtotal = subtotal || 0;
    if (!subtotal) {
      // Calculate from items if not provided
      for (const item of items) {
        calculatedSubtotal += item.line_total;
      }
    }

    const calculatedDiscountAmount = discount_amount || 0;
    const calculatedTaxAmount = tax_amount || (calculatedSubtotal * 0.09); // Default 9% tax
    const totalAmount = calculatedSubtotal - calculatedDiscountAmount + calculatedTaxAmount;

    // Create invoice
    const invoice = await Invoice.create({
      invoice_number: invoiceNumber,
      customer_id,
      order_id: order_id || null,
      staff_id: staff_id || null,
      payment_method: payment_method || 'Cash',
      subtotal: calculatedSubtotal,
      discount_amount: calculatedDiscountAmount,
      tax_amount: calculatedTaxAmount,
      total_amount: totalAmount,
      payment_status: 'unpaid',
      notes,
      invoice_date: new Date()
    });

    // Create invoice items
    for (const item of items) {
      await InvoiceItem.create({
        invoice_id: invoice._id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total
      });
    }

    await invoice.populate([
      { path: 'customer_id' },
      { path: 'order_id' },
      { path: 'staff_id', populate: { path: 'account_id', select: 'full_name email' } }
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Update invoice payment status
 * @route   PUT /api/invoices/:id
 * @access  Public
 */
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const {
      payment_status,
      payment_method,
      notes
    } = req.body;

    // Update payment status
    if (payment_status) {
      if (!['unpaid', 'paid', 'partial', 'refunded'].includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }
      invoice.payment_status = payment_status;
    }

    // Update payment method
    if (payment_method) {
      if (!['Cash', 'Card Payment', 'Digital Wallet', 'E-Wallet'].includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
      }
      invoice.payment_method = payment_method;
    }

    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();
    await invoice.populate([
      { path: 'customer_id' },
      { path: 'order_id' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

/**
 * @desc    Mark invoice as paid
 * @route   PATCH /api/invoices/:id/mark-paid
 * @access  Public
 */
exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    invoice.payment_status = 'paid';
    await invoice.save();

    await invoice.populate([
      { path: 'customer_id' },
      { path: 'order_id' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking invoice as paid',
      error: error.message
    });
  }
};

/**
 * @desc    Get unpaid invoices
 * @route   GET /api/invoices/filter/unpaid
 * @access  Public
 */
exports.getUnpaidInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const invoices = await Invoice.find({ payment_status: 'unpaid', isDelete: false })
      .populate('customer_id', 'account_id membership_type')
      .populate('order_id', 'order_number status')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-invoice_date');

    const total = await Invoice.countDocuments({ payment_status: 'unpaid', isDelete: false });

    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unpaid invoices',
      error: error.message
    });
  }
};

/**
 * @desc    Delete invoice (soft delete)
 * @route   DELETE /api/invoices/:id
 * @access  Public
 */
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    invoice.isDelete = true;
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};
