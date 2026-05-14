// server/repositories/CustomerRepository.js
const { Customer } = require('../models');

class CustomerRepository {
  async findAll(query, { sort = '-createdAt', skip = 0, limit = 10 } = {}) {
    return await Customer.find(query)
      .populate('account_id', 'username email full_name phone address')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countDocuments(query) {
    return await Customer.countDocuments(query);
  }

  async findById(id) {
    return await Customer.findById(id)
      .populate('account_id', 'username email full_name phone address avatar_link');
  }

  async findOne(query) {
    return await Customer.findOne(query)
      .populate('account_id', 'username email full_name phone address');
  }

  async create(customerData) {
    return await Customer.create(customerData);
  }

  async save(customer) {
    return await customer.save();
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return await Customer.findByIdAndUpdate(id, update, options)
      .populate('account_id', 'username email full_name');
  }

  async aggregate(pipeline) {
    return await Customer.aggregate(pipeline);
  }

  async findByAccountId(accountId) {
    return await Customer.findOne({ 
      account_id: accountId,
      isDelete: false 
    });
  }
}

module.exports = new CustomerRepository();
