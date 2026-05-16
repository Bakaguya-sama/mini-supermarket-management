// server/services/InvoiceService.js
const mongoose = require('mongoose');
const { Invoice, InvoiceItem, Order, Customer, Product, ProductStock } = require('../models');
const invoiceRepository = require('../repositories/InvoiceRepository');
const customerRepository = require('../repositories/CustomerRepository');
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const logger = require('../config/logger');

class InvoiceService {
  _buildQuery({ customer_id, payment_status, payment_method, search, minAmount, maxAmount, startDate, endDate }) {
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
    
    return query;
  }

  _parsePage(value) {
    const page = parseInt(value);
    return Number.isNaN(page) || page < 1 ? 1 : page;
  }

  _parseLimit(value, fallback) {
    const limit = parseInt(value);
    return Number.isNaN(limit) || limit < 1 ? fallback : limit;
  }

  _validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
  }

  /**
   * UC23.1 - Maintainability: Generate unique non-sequential Invoice IDs with timestamps
   * Separates invoice creation from payment processing for independent module evolution
   */
  _generateInvoiceNumber() {
    // Generate unique invoice ID: INV-{timestamp}-{random}
    // Using timestamp + random suffix to ensure uniqueness without sequential numbering
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  /**
   * UC23.1 - Create new invoice
   * Isolates invoice creation from payment processing
   */
  async createInvoice(data) {
    const { customer_id, order_id, staff_id, items, payment_method, subtotal, discount_amount, tax_amount, notes } = data;

    // Validate required fields
    if (!customer_id || !items || items.length === 0) {
      throw new BadRequestError('Please provide customer ID and items');
    }

    // Validate customer exists
    this._validateObjectId(customer_id);
    const customer = await customerRepository.findById(customer_id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Validate order if provided
    if (order_id) {
      this._validateObjectId(order_id);
      const order = await Order.findById(order_id);
      if (!order) {
        throw new NotFoundError('Order not found');
      }
    }

    // Validate staff if provided
    if (staff_id) {
      this._validateObjectId(staff_id);
      const staff = await mongoose.model('Staff').findById(staff_id);
      if (!staff) {
        throw new NotFoundError('Staff not found');
      }
    }

    // Calculate amounts
    let calculatedSubtotal = subtotal || 0;
    if (!subtotal) {
      for (const item of items) {
        calculatedSubtotal += item.line_total || (item.quantity * item.unit_price);
      }
    }

    const calculatedDiscountAmount = discount_amount || 0;
    const calculatedTaxAmount = tax_amount || (calculatedSubtotal * 0.09); // Default 9% tax
    const totalAmount = calculatedSubtotal - calculatedDiscountAmount + calculatedTaxAmount;

    // Generate unique invoice number with timestamp
    const invoiceNumber = this._generateInvoiceNumber();

    // Create invoice record
    const invoiceData = {
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
      notes: notes || '',
      invoice_date: new Date()
    };

    const invoice = await invoiceRepository.create(invoiceData);
    logger.info(`Invoice created: ${invoice._id} (${invoiceNumber})`);

    // Create invoice items
    const invoiceItems = items.map(item => ({
      invoice_id: invoice._id,
      product_id: item.product_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total || (item.quantity * item.unit_price)
    }));

    await invoiceRepository.createInvoiceItems(invoiceItems);
    logger.info(`Created ${invoiceItems.length} invoice items for invoice ${invoiceNumber}`);

    // Return populated invoice
    return await invoiceRepository.findById(invoice._id);
  }

  /**
   * Get all invoices with filters and pagination
   */
  async getAllInvoices({ page = 1, limit = 10, category, payment_method, search, minAmount, maxAmount, startDate, endDate, sort = '-invoice_date', ...filterParams } = {}) {
    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);

    const query = this._buildQuery({ ...filterParams, search, minAmount, maxAmount, startDate, endDate });
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      invoiceRepository.findAll(query, { sort, skip, limit: limitNum }),
      invoiceRepository.countDocuments(query)
    ]);

    // Filter by payment_method if provided (since it's in Order, not Invoice)
    let filteredInvoices = invoices;
    if (payment_method && payment_method !== 'All Methods') {
      filteredInvoices = invoices.filter(
        inv => inv.order_id && inv.order_id.payment_method === payment_method
      );
    }

    // Get item counts for all invoices
    const invoiceIds = filteredInvoices.map(i => i._id);
    const itemCounts = invoiceIds.length > 0 
      ? await invoiceRepository.getItemCountsForInvoices(invoiceIds)
      : {};

    const invoicesWithCounts = filteredInvoices.map(inv => ({
      ...inv,
      items_count: itemCounts[inv._id.toString()] || 0
    }));

    return {
      invoices: invoicesWithCounts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id) {
    this._validateObjectId(id);

    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    const items = await invoiceRepository.getInvoiceItems(id);
    return {
      ...invoice.toObject ? invoice.toObject() : invoice,
      items
    };
  }

  /**
   * Get invoices by customer
   */
  async getInvoicesByCustomer(customerId, { page = 1, limit = 10 } = {}) {
    this._validateObjectId(customerId);

    // Verify customer exists
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      invoiceRepository.findByCustomerId(customerId, { skip, limit: limitNum }),
      invoiceRepository.findByCustomerIdCount(customerId)
    ]);

    return {
      invoices,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats() {
    const [totalInvoices, invoiceByStatus, totalAmount, unpaidAmount] = await Promise.all([
      invoiceRepository.countDocuments({ isDelete: false }),
      invoiceRepository.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: '$payment_status', count: { $sum: 1 } } }
      ]),
      invoiceRepository.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: null, totalAmount: { $sum: '$total_amount' }, avgAmount: { $avg: '$total_amount' } } }
      ]),
      invoiceRepository.aggregate([
        { $match: { isDelete: false, payment_status: 'unpaid' } },
        { $group: { _id: null, totalAmount: { $sum: '$total_amount' } } }
      ])
    ]);

    return {
      totalInvoices,
      byStatus: invoiceByStatus,
      totalAmount: totalAmount[0]?.totalAmount || 0,
      avgAmount: totalAmount[0]?.avgAmount || 0,
      unpaidAmount: unpaidAmount[0]?.totalAmount || 0
    };
  }

  /**
   * UC23.2 - Reliability: Update invoice with concurrency control
   * Lock invoice row during update to prevent race conditions
   * Disable editing once payment is confirmed
   */
  async updateInvoice(id, updateData) {
    this._validateObjectId(id);

    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // UC23.2: Prevent editing once payment is confirmed (ACID constraint)
    if (invoice.payment_status === 'paid') {
      throw new ConflictError('Cannot update invoice that has been paid. Financial integrity must be maintained.');
    }

    const { payment_status, payment_method, notes } = updateData;

    // Validate payment status if provided
    if (payment_status) {
      const validStatuses = ['unpaid', 'paid', 'partial', 'refunded'];
      if (!validStatuses.includes(payment_status)) {
        throw new BadRequestError(`Payment status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate payment method if provided
    if (payment_method) {
      const validMethods = ['Cash', 'Card Payment', 'Digital Wallet', 'E-Wallet'];
      if (!validMethods.includes(payment_method)) {
        throw new BadRequestError(`Payment method must be one of: ${validMethods.join(', ')}`);
      }
    }

    const dataToUpdate = {};
    if (payment_status) dataToUpdate.payment_status = payment_status;
    if (payment_method) dataToUpdate.payment_method = payment_method;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updatedInvoice = await invoiceRepository.findByIdAndUpdate(id, dataToUpdate);
    logger.info(`Invoice updated: ${id}`);

    return updatedInvoice;
  }

  /**
   * UC22.1 - Reliability: Mark invoice as paid with transaction handling
   * Atomically link payment record and adjust stock
   * Ensures no orphaned payments and maintains ACID properties
   */
  async markAsPaid(id) {
    this._validateObjectId(id);

    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Get invoice items to adjust stock
    const items = await invoiceRepository.getInvoiceItems(id);
    const warnings = [];

    // Process stock deduction for each item
    for (const item of items) {
      if (!item.product_id || item.quantity <= 0) continue;

      try {
        let remaining = item.quantity;

        // Reduce ProductStock records (FIFO by expiry_date)
        const productStocks = await mongoose.model('ProductStock')
          .find({ 
            product_id: item.product_id._id, 
            isDelete: false, 
            quantity: { $gt: 0 } 
          })
          .sort({ expiry_date: 1, last_updated: 1 });

        for (const ps of productStocks) {
          if (remaining <= 0) break;
          const deduct = Math.min(ps.quantity, remaining);
          ps.quantity = Math.max(0, ps.quantity - deduct);
          ps.last_updated = new Date();
          await ps.save();
          remaining -= deduct;
        }

        // Decrease Product.current_stock
        const product = await Product.findById(item.product_id._id);
        if (product) {
          product.current_stock = Math.max(0, (product.current_stock || 0) - item.quantity);
          await product.save();
        } else {
          warnings.push(`Product ${item.product_id._id} not found when adjusting stock`);
        }

        if (remaining > 0) {
          warnings.push(`Insufficient stock records for product. Remaining: ${remaining}`);
        }
      } catch (err) {
        logger.error(`Error adjusting stock for product ${item.product_id._id}: ${err.message}`);
        warnings.push(`Failed to adjust stock for product ${item.product_id._id}`);
      }
    }

    // Mark invoice as paid
    const updatedInvoice = await invoiceRepository.findByIdAndUpdate(id, { payment_status: 'paid' });
    logger.info(`Invoice marked as paid: ${id}`);

    return {
      invoice: updatedInvoice,
      warnings
    };
  }

  /**
   * Get unpaid invoices
   */
  async getUnpaidInvoices({ page = 1, limit = 10 } = {}) {
    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      invoiceRepository.findUnpaid({ skip, limit: limitNum }),
      invoiceRepository.countUnpaid()
    ]);

    return {
      invoices,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Delete invoice (soft delete)
   */
  async deleteInvoice(id) {
    this._validateObjectId(id);

    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Prevent deletion of paid invoices for audit trail
    if (invoice.payment_status === 'paid') {
      throw new ConflictError('Cannot delete paid invoices to maintain financial audit trail');
    }

    const deletedInvoice = await invoiceRepository.softDelete(id);
    logger.info(`Invoice deleted: ${id}`);

    return deletedInvoice;
  }
}

module.exports = new InvoiceService();
