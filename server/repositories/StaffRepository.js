// server/repositories/StaffRepository.js
const { Staff, Account } = require('../models');

class StaffRepository {
  async findAll(query, { sort = '-createdAt', skip = 0, limit = 10 } = {}) {
    return await Staff.find(query)
      .populate({
        path: 'account_id',
        select: 'full_name email phone username -password_hash'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countDocuments(query) {
    return await Staff.countDocuments(query);
  }

  async findById(id) {
    return await Staff.findOne({ 
      _id: id,
      isDelete: false 
    }).populate({
      path: 'account_id',
      select: '-password_hash'
    });
  }

  async findByAccountId(accountId) {
    return await Staff.findOne({ 
      account_id: accountId,
      isDelete: false 
    }).populate({
      path: 'account_id',
      select: '-password_hash'
    });
  }

  async findByIdAndUpdate(id, updateData) {
    return await Staff.findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'account_id',
        select: '-password_hash'
      });
  }

  async create(staffData) {
    return await Staff.create(staffData);
  }

  async findByIdAndSoftDelete(id) {
    return await Staff.findByIdAndUpdate(
      id,
      { isDelete: true, is_active: false },
      { new: true }
    );
  }

  async aggregate(pipeline) {
    return await Staff.aggregate(pipeline);
  }

  async getStaffByPosition(position) {
    return await Staff.find({
      position,
      isDelete: false,
      is_active: true
    })
      .populate('account_id', 'full_name email')
      .lean();
  }

  async countByStatus() {
    return await Staff.aggregate([
      { $match: { isDelete: false } },
      {
        $group: {
          _id: '$is_active',
          count: { $sum: 1 }
        }
      }
    ]);
  }
}

module.exports = new StaffRepository();
