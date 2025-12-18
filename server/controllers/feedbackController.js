// server/controllers/feedbackController.js
const { CustomerFeedback, Customer } = require('../models');
const mongoose = require('mongoose');

/**
 * @desc    Create new customer feedback
 * @route   POST /api/feedbacks
 * @access  Public
 */
exports.createFeedback = async (req, res) => {
  try {
    const { 
      category, 
      subject, 
      detail, 
      customer_id,
      rating,
      sentiment
    } = req.body;

    // Validate required fields
    if (!category || !subject || !customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, subject, and customer_id'
      });
    }

    // Validate category
    const validCategories = ['complaint', 'suggestion', 'praise'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate customer exists
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create feedback
    const feedback = await CustomerFeedback.create({
      category,
      subject,
      detail,
      customer_id,
      rating: rating || null,
      sentiment: sentiment || null,
      status: 'open',
      isDelete: false
    });

    // Populate customer info
    const populatedFeedback = await CustomerFeedback.findById(feedback._id)
      .populate('customer_id', 'account_id membership_type points_balance')
      .populate({
        path: 'customer_id',
        populate: {
          path: 'account_id',
          select: 'full_name email phone'
        }
      });

    // Award bonus points for detailed feedback (>100 characters)
    if (detail && detail.length > 100) {
      await Customer.findByIdAndUpdate(customer_id, {
        $inc: { points_balance: 50 }
      });
      console.log(`✅ Awarded 50 bonus points to customer ${customer_id} for detailed feedback`);
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: populatedFeedback,
      bonusPoints: detail && detail.length > 100 ? 50 : 0
    });
  } catch (error) {
    console.error('❌ Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating feedback',
      error: error.message
    });
  }
};

/**
 * @desc    Get all feedbacks with filters
 * @route   GET /api/feedbacks
 * @access  Public
 */
exports.getAllFeedbacks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      customer_id,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = { isDelete: false };
    if (category) query.category = category;
    if (status) query.status = status;
    if (customer_id) query.customer_id = customer_id;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const feedbacks = await CustomerFeedback.find(query)
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
      .limit(parseInt(limit))
      .lean();

    const total = await CustomerFeedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: feedbacks
    });
  } catch (error) {
    console.error('❌ Error getting feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer's own feedbacks
 * @route   GET /api/feedbacks/customer/:customerId
 * @access  Public
 */
exports.getCustomerFeedbacks = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const feedbacks = await CustomerFeedback.find({
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

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('❌ Error getting customer feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer feedbacks',
      error: error.message
    });
  }
};

/**
 * @desc    Get feedback by ID
 * @route   GET /api/feedbacks/:id
 * @access  Public
 */
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }

    const feedback = await CustomerFeedback.findOne({
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

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('❌ Error getting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

/**
 * @desc    Update feedback status
 * @route   PUT /api/feedbacks/:id
 * @access  Public
 */
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to_staff_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assigned_to_staff_id) updateData.assigned_to_staff_id = assigned_to_staff_id;

    const feedback = await CustomerFeedback.findOneAndUpdate(
      { _id: id, isDelete: false },
      updateData,
      { new: true, runValidators: true }
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

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
};

/**
 * @desc    Delete feedback (soft delete)
 * @route   DELETE /api/feedbacks/:id
 * @access  Public
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }

    const feedback = await CustomerFeedback.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: true },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};

/**
 * @desc    Get feedback statistics
 * @route   GET /api/feedbacks/stats/summary
 * @access  Public
 */
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await CustomerFeedback.aggregate([
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

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        complaints: 0,
        suggestions: 0,
        praises: 0
      }
    });
  } catch (error) {
    console.error('❌ Error getting feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback statistics',
      error: error.message
    });
  }
};
