// server/repositories/AccountRepository.js
const { Account } = require('../models');

class AccountRepository {
  async findByUsername(username) {
    return await Account.findOne({ 
      username: username.toLowerCase(),
      isDelete: false 
    });
  }

  async findByEmail(email) {
    return await Account.findOne({ 
      email: email.toLowerCase(),
      isDelete: false 
    });
  }

  async findByPhone(phone) {
    return await Account.findOne({
      phone,
      isDelete: false
    });
  }

  async findIdsByFullName(search) {
    return await Account.find({
      full_name: { $regex: search, $options: 'i' },
      isDelete: false
    }).select('_id').lean();
  }

  async findById(id) {
    return await Account.findOne({ 
      _id: id,
      isDelete: false,
      is_active: true
    });
  }

  async create(accountData) {
    return await Account.create(accountData);
  }

  async save(account) {
    return await account.save();
  }
}

module.exports = new AccountRepository();
