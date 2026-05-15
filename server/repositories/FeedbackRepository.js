// server/repositories/FeedbackRepository.js
const { CustomerFeedback } = require('../models');

class FeedbackRepository {
  async findAll(query, { sort = '-createdAt', skip = 0, limit = 10 } = {}) {
    return await CustomerFeedback.find(query)
      .populate('customer_id', 'account_id membership_type points_balance')
      .populate({
        path: 'customer_id',
        populate: {
          path: 'account_id',
          select: 'full_name email phone'
        }
      })
      .populate('assigned_to_staff_id', 'account_id')
      .populate({
        path: 'assigned_to_staff_id',
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
    return await CustomerFeedback.countDocuments(query);
  }

  async findById(id) {
    return await CustomerFeedback.findOne({
      _id: id,
      isDelete: false
    })
      .populate('customer_id', 'account_id membership_type points_balance')
      .populate({
        path: 'customer_id',
        populate: {
          path: 'account_id',
          select: 'full_name email phone'
        }
      })
      .populate('assigned_to_staff_id', 'account_id')
      .populate({
        path: 'assigned_to_staff_id',
        populate: {
          path: 'account_id',
          select: 'full_name email'
        }
      })
      .lean();
  }

  async create(feedbackData) {
    return await CustomerFeedback.create(feedbackData);
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const defaultOptions = { new: true, runValidators: true };
    return await CustomerFeedback.findOneAndUpdate(
      { _id: id, isDelete: false },
      updateData,
      { ...defaultOptions, ...options }
    )
      .populate('customer_id', 'account_id membership_type')
      .populate({
        path: 'customer_id',
        populate: {
          path: 'account_id',
          select: 'full_name email'
        }
      })
      .populate('assigned_to_staff_id', 'account_id')
      .populate({
        path: 'assigned_to_staff_id',
        populate: {
          path: 'account_id',
          select: 'full_name'
        }
      });
  }

  async findByCustomerId(customerId) {
    return await CustomerFeedback.find({
      customer_id: customerId,
      isDelete: false
    })
      .populate('assigned_to_staff_id', 'account_id')
      .populate({
        path: 'assigned_to_staff_id',
        populate: {
          path: 'account_id',
          select: 'full_name'
        }
      })
      .sort('-createdAt')
      .lean();
  }

  async softDelete(id) {
    return await CustomerFeedback.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: true },
      { new: true }
    );
  }

  async aggregate(pipeline) {
    return await CustomerFeedback.aggregate(pipeline);
  }
}

module.exports = new FeedbackRepository();
