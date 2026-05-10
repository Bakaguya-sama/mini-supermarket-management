// server/repositories/CustomerRepository.js
const { Customer } = require('../models');

class CustomerRepository {
  async create(customerData) {
    return await Customer.create(customerData);
  }

  async findByAccountId(accountId) {
    return await Customer.findOne({ 
      account_id: accountId,
      isDelete: false 
    });
  }
}

module.exports = new CustomerRepository();
