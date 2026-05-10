// server/repositories/StaffRepository.js
const { Staff } = require('../models');

class StaffRepository {
  async findByAccountId(accountId) {
    return await Staff.findOne({ 
      account_id: accountId,
      isDelete: false 
    });
  }

  async create(staffData) {
    return await Staff.create(staffData);
  }

  async findById(id) {
    return await Staff.findOne({ 
      _id: id,
      isDelete: false 
    });
  }
}

module.exports = new StaffRepository();
