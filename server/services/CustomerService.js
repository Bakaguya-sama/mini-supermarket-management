// server/services/CustomerService.js
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Account, Order, Cart } = require('../models');
const customerRepository = require('../repositories/CustomerRepository');
const accountRepository = require('../repositories/AccountRepository');
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');

class CustomerService {
  _buildQuery({ membership_type, minSpent, maxSpent, accountIds }) {
    const query = {};
    if (membership_type) query.membership_type = membership_type;
    if (minSpent || maxSpent) {
      query.total_spent = {};
      if (minSpent) query.total_spent.$gte = parseFloat(minSpent);
      if (maxSpent) query.total_spent.$lte = parseFloat(maxSpent);
    }
    if (accountIds) query.account_id = { $in: accountIds };
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

  async getAllCustomers({ page = 1, limit = 10, sort = '-createdAt', membership_type, minSpent, maxSpent, search } = {}) {
    const pageNum = this._parsePage(page);
    let limitNum = this._parseLimit(limit, 10);

    let accountIds;
    if (search) {
      limitNum = Math.min(this._parseLimit(limit, 20), 20);
      const accounts = await accountRepository.findIdsByFullName(search);
      if (accounts.length === 0) {
        return { customers: [], total: 0, page: pageNum, pages: 0 };
      }
      accountIds = accounts.map((a) => a._id);
    }

    const query = this._buildQuery({ membership_type, minSpent, maxSpent, accountIds });
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      customerRepository.findAll(query, { sort, skip, limit: limitNum }),
      customerRepository.countDocuments(query)
    ]);

    return { customers, total, page: pageNum, pages: Math.ceil(total / limitNum) };
  }

  async getCustomerById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid customer ID');
    }

    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer not found');

    const [orders, carts] = await Promise.all([
      Order.countDocuments({ customer_id: id }),
      Cart.countDocuments({ customer_id: id })
    ]);

    return {
      ...customer.toObject(),
      stats: {
        totalOrders: orders,
        activeCarts: carts
      }
    };
  }

  async getCustomerByAccount(accountId) {
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      throw new BadRequestError('Invalid account ID');
    }

    const customer = await customerRepository.findOne({ account_id: accountId });
    if (!customer) throw new NotFoundError('Customer not found for this account');

    return customer;
  }

  async getCustomerStats() {
    const totalCustomers = await customerRepository.countDocuments({ isDelete: false });
    const activeCustomers = await customerRepository.countDocuments({ isDelete: false });

    const customersByMembership = await customerRepository.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: '$membership_type', count: { $sum: 1 } } }
    ]);

    const totalSpent = await customerRepository.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, totalAmount: { $sum: '$total_spent' }, avgAmount: { $avg: '$total_spent' } } }
    ]);

    const topCustomers = await customerRepository.findAll(
      { isDelete: false },
      { sort: '-total_spent', limit: 5 }
    );

    return {
      totalCustomers,
      activeCustomers,
      byMembership: customersByMembership,
      totalSpent: totalSpent[0]?.totalAmount || 0,
      avgSpent: totalSpent[0]?.avgAmount || 0,
      topCustomers
    };
  }

  async createCustomer(data) {
    let accountId = data.account_id;
    const { membership_type, notes, username, email, full_name, phone, address, password } = data;

    if (!accountId) {
      if (!username || !email || !full_name) {
        throw new BadRequestError('Please provide account_id OR (username, email, full_name)');
      }

      const existingUsername = await accountRepository.findByUsername(username);
      if (existingUsername) throw new BadRequestError('Username or email already exists');

      const existingEmail = await accountRepository.findByEmail(email);
      if (existingEmail) throw new BadRequestError('Username or email already exists');

      if (phone) {
        const existingPhone = await accountRepository.findByPhone(phone);
        if (existingPhone) throw new BadRequestError('Phone already exists');
      }

      const password_hash = password ? await bcrypt.hash(password, 10) : '';

      const newAccount = await accountRepository.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        full_name,
        phone: phone || undefined,
        address: address || '',
        role: 'customer',
        is_active: true,
        password_hash
      });

      accountId = newAccount._id;
    } else {
      const account = await Account.findById(accountId);
      if (!account) throw new NotFoundError('Account not found');
    }

    const existingCustomer = await customerRepository.findOne({ account_id: accountId });
    if (existingCustomer) throw new BadRequestError('Customer already exists for this account');

    const customer = await customerRepository.create({
      account_id: accountId,
      membership_type: membership_type || 'Standard',
      notes: notes || '',
      points_balance: 0,
      total_spent: 0,
      registered_at: new Date()
    });

    await customer.populate('account_id', 'username email full_name phone address');
    return customer;
  }

  async updateCustomer(id, updates) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid customer ID');
    }

    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer not found');

    const { membership_type, notes, points_balance } = updates;

    if (membership_type !== undefined) customer.membership_type = membership_type;
    if (notes !== undefined) customer.notes = notes;
    if (points_balance !== undefined) customer.points_balance = points_balance;

    await customerRepository.save(customer);
    await customer.populate('account_id', 'username email full_name phone address');

    return customer;
  }

  async updatePoints(id, pointsToAdd) {
    if (pointsToAdd === undefined) {
      throw new BadRequestError('Please provide points to add');
    }

    const customer = await customerRepository.findByIdAndUpdate(
      id,
      { $inc: { points_balance: pointsToAdd } },
      { new: true }
    );

    if (!customer) throw new NotFoundError('Customer not found');
    return customer;
  }

  async updateTotalSpent(id, amount) {
    if (!amount) {
      throw new BadRequestError('Please provide amount');
    }

    const customer = await customerRepository.findByIdAndUpdate(
      id,
      { $inc: { total_spent: parseFloat(amount) } },
      { new: true }
    );

    if (!customer) throw new NotFoundError('Customer not found');
    return customer;
  }

  async getCustomerOrders(id, { page = 1, limit = 10 } = {}) {
    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ customer_id: id })
        .populate('payment_id')
        .skip(skip)
        .limit(limitNum)
        .sort('-createdAt'),
      Order.countDocuments({ customer_id: id })
    ]);

    return { orders, total, page: pageNum, pages: Math.ceil(total / limitNum) };
  }

  async deleteCustomer(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError('Customer not found');

    customer.isDelete = true;
    await customerRepository.save(customer);

    return customer;
  }
}

module.exports = new CustomerService();
