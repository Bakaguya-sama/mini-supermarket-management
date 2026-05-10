// server/repositories/ManagerRepository.js
const { Manager } = require('../models');

class ManagerRepository {
  async findByAccountId(accountId) {
    return await Manager.findOne({ 
      account_id: accountId,
      isDelete: false 
    });
  }

  async create(managerData) {
    return await Manager.create(managerData);
  }

  async findById(id) {
    return await Manager.findOne({ 
      _id: id,
      isDelete: false 
    });
  }
}

module.exports = new ManagerRepository();
