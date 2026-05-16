// server/repositories/InvoiceRepository.js
const { Invoice, InvoiceItem } = require('../models');

class InvoiceRepository {
  async findAll(query, { sort = '-invoice_date', skip = 0, limit = 10 } = {}) {
    return await Invoice.find(query)
      .populate({
        path: 'customer_id',
        select: 'account_id membership_type',
        populate: {
          path: 'account_id',
          select: 'full_name email phone'
        }
      })
      .populate('order_id', 'order_number status')
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
      .limit(limit)
      .lean();
  }

  async countDocuments(query) {
    return await Invoice.countDocuments(query);
  }

  async findById(id) {
    return await Invoice.findById(id)
      .populate({
        path: 'customer_id',
        select: 'account_id membership_type total_spent',
        populate: {
          path: 'account_id',
          select: 'full_name email phone'
        }
      })
      .populate({
        path: 'order_id',
        select: 'order_number status total_amount delivery_date'
      })
      .populate({
        path: 'staff_id',
        select: 'account_id position',
        populate: {
          path: 'account_id',
          select: 'full_name email'
        }
      });
  }

  async create(invoiceData) {
    return await Invoice.create(invoiceData);
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const defaultOptions = { new: true, runValidators: true };
    return await Invoice.findByIdAndUpdate(
      id,
      updateData,
      { ...defaultOptions, ...options }
    )
      .populate({
        path: 'customer_id',
        select: 'account_id'
      })
      .populate('order_id', 'order_number status');
  }

  async findByCustomerId(customerId, { skip = 0, limit = 10 } = {}) {
    return await Invoice.find({
      customer_id: customerId,
      isDelete: false
    })
      .populate('order_id', 'order_number status')
      .skip(skip)
      .limit(limit)
      .sort('-invoice_date')
      .lean();
  }

  async findByCustomerIdCount(customerId) {
    return await Invoice.countDocuments({
      customer_id: customerId,
      isDelete: false
    });
  }

  async findUnpaid({ skip = 0, limit = 10 } = {}) {
    return await Invoice.find({
      payment_status: 'unpaid',
      isDelete: false
    })
      .populate({
        path: 'customer_id',
        select: 'account_id',
        populate: {
          path: 'account_id',
          select: 'full_name email'
        }
      })
      .populate('order_id', 'order_number')
      .skip(skip)
      .limit(limit)
      .sort('-invoice_date')
      .lean();
  }

  async countUnpaid() {
    return await Invoice.countDocuments({
      payment_status: 'unpaid',
      isDelete: false
    });
  }

  async softDelete(id) {
    return await Invoice.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
  }

  async aggregate(pipeline) {
    return await Invoice.aggregate(pipeline);
  }

  async findByInvoiceNumber(invoiceNumber) {
    return await Invoice.findOne({
      invoice_number: invoiceNumber,
      isDelete: false
    });
  }

  // Get invoice items with product details
  async getInvoiceItems(invoiceId) {
    return await InvoiceItem.find({
      invoice_id: invoiceId,
      isDelete: false
    })
      .populate('product_id', 'name sku category retail_price')
      .lean();
  }

  // Create invoice items in bulk
  async createInvoiceItems(itemsData) {
    return await InvoiceItem.insertMany(itemsData);
  }

  // Get item count map for multiple invoices
  async getItemCountsForInvoices(invoiceIds) {
    const counts = await InvoiceItem.aggregate([
      { $match: { invoice_id: { $in: invoiceIds }, isDelete: false } },
      { $group: { _id: '$invoice_id', count: { $sum: 1 } } }
    ]);
    return counts.reduce((m, c) => {
      m[c._id.toString()] = c.count;
      return m;
    }, {});
  }
}

module.exports = new InvoiceRepository();
