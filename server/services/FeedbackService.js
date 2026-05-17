// server/services/FeedbackService.js
const mongoose = require('mongoose');
const { Customer, Staff, Order, OrderFeedback } = require('../models');
const feedbackRepository = require('../repositories/FeedbackRepository');
const customerRepository = require('../repositories/CustomerRepository');
const staffRepository = require('../repositories/StaffRepository');
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const logger = require('../config/logger');

class FeedbackService {
  _sanitizeText(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim();
  }

  _buildQuery({ category, status, customer_id }) {
    const query = { isDelete: false };
    if (category) query.category = category;
    if (status) query.status = status;
    if (customer_id) query.customer_id = customer_id;
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

  async createFeedback(data) {
    const { category, subject, detail, customer_id, rating, sentiment, order_id } = data;

    // Sanitize input
    const sanitizedSubject = this._sanitizeText(subject);
    const sanitizedDetail = this._sanitizeText(detail);

    // Validate required fields
    if (!category || !sanitizedSubject || !customer_id) {
      throw new BadRequestError('Please provide category, subject, and customer_id');
    }

    // Validate category
    const validCategories = ['complaint', 'suggestion', 'praise'];
    if (!validCategories.includes(category)) {
      throw new BadRequestError(`Category must be one of: ${validCategories.join(', ')}`);
    }

    // Validate customer ID format
    this._validateObjectId(customer_id);

    // Validate customer exists
    const customer = await customerRepository.findById(customer_id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Validate order rating when order_id is provided
    if (order_id && rating) {
      this._validateObjectId(order_id);

      const order = await Order.findById(order_id);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      if (order.status !== 'delivered') {
        throw new BadRequestError('Order must be delivered before rating');
      }

      if (order.customer_id?.toString() !== customer_id.toString()) {
        throw new BadRequestError('Order does not belong to this customer');
      }
    }

    // Create feedback
    const feedback = await feedbackRepository.create({
      category,
      subject: sanitizedSubject,
      detail: sanitizedDetail,
      customer_id,
      rating: order_id ? null : (rating || null),
      sentiment: sentiment || null,
      status: 'open',
      isDelete: false
    });

    // Handle order feedback
    if (order_id && rating) {
      await OrderFeedback.create({
        order_id,
        customer_id,
        feedback_id: feedback._id,
        rating,
        comment: sanitizedDetail || undefined
      });
    }

    // Populate feedback data
    const populatedFeedback = await feedbackRepository.findById(feedback._id);

    // Award bonus points for detailed feedback (>100 characters)
    let bonusPoints = 0;
    if (sanitizedDetail && sanitizedDetail.length > 100) {
      await customerRepository.findByIdAndUpdate(customer_id, {
        $inc: { points_balance: 50 }
      });
      bonusPoints = 50;
      logger.info(`Awarded 50 bonus points to customer ${customer_id} for detailed feedback`);
    }

    logger.info(`Feedback created successfully: ${feedback._id}`);

    return {
      feedback: populatedFeedback,
      bonusPoints
    };
  }

  async getAllFeedbacks({ page = 1, limit = 10, category, status, customer_id, sort = '-createdAt' } = {}) {
    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);

    const query = this._buildQuery({ category, status, customer_id });
    const skip = (pageNum - 1) * limitNum;

    const [feedbacks, total] = await Promise.all([
      feedbackRepository.findAll(query, { sort, skip, limit: limitNum }),
      feedbackRepository.countDocuments(query)
    ]);

    return {
      feedbacks,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  async getFeedbackById(id) {
    this._validateObjectId(id);

    const feedback = await feedbackRepository.findById(id);
    if (!feedback) {
      throw new NotFoundError('Feedback not found');
    }

    return feedback;
  }

  async getCustomerFeedbacks(customerId) {
    this._validateObjectId(customerId);

    // Validate customer exists
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const feedbacks = await feedbackRepository.findByCustomerId(customerId);
    return feedbacks;
  }

  async updateFeedbackStatus(id, updateData) {
    this._validateObjectId(id);

    const { status, assigned_to_staff_id } = updateData;

    // Validate status if provided
    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate staff ID if provided
    if (assigned_to_staff_id) {
      this._validateObjectId(assigned_to_staff_id);
      const staff = await staffRepository.findById(assigned_to_staff_id);
      if (!staff) {
        throw new NotFoundError('Staff not found');
      }
    }

    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (assigned_to_staff_id) dataToUpdate.assigned_to_staff_id = assigned_to_staff_id;

    const feedback = await feedbackRepository.findByIdAndUpdate(id, dataToUpdate);
    if (!feedback) {
      throw new NotFoundError('Feedback not found');
    }

    logger.info(`Feedback updated successfully: ${id}`);
    return feedback;
  }

  async deleteFeedback(id) {
    this._validateObjectId(id);

    const feedback = await feedbackRepository.softDelete(id);
    if (!feedback) {
      throw new NotFoundError('Feedback not found');
    }

    logger.info(`Feedback deleted successfully: ${id}`);
    return feedback;
  }

  async getFeedbackStats() {
    const stats = await feedbackRepository.aggregate([
      {
        $match: { isDelete: false }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          in_progress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          },
          complaints: {
            $sum: { $cond: [{ $eq: ['$category', 'complaint'] }, 1, 0] }
          },
          suggestions: {
            $sum: { $cond: [{ $eq: ['$category', 'suggestion'] }, 1, 0] }
          },
          praises: {
            $sum: { $cond: [{ $eq: ['$category', 'praise'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      complaints: 0,
      suggestions: 0,
      praises: 0
    };
  }
}

module.exports = new FeedbackService();
