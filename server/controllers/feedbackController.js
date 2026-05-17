// server/controllers/feedbackController.js
const feedbackService = require('../services/FeedbackService');
const logger = require('../config/logger');

/**
 * @route   POST /api/feedbacks
 * @desc    Create new customer feedback
 * @access  Public
 */
exports.createFeedback = async (req, res, next) => {
  try {
    const { feedback, bonusPoints } = await feedbackService.createFeedback(req.body);
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
      bonusPoints,
      reference_code: feedback._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/feedbacks
 * @desc    Get all feedbacks with filters
 * @access  Public
 */
exports.getAllFeedbacks = async (req, res, next) => {
  try {
    const { feedbacks, total, page, pages } = await feedbackService.getAllFeedbacks(req.query);
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      total,
      page,
      pages,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/feedbacks/customer/:customerId
 * @desc    Get customer's own feedbacks
 * @access  Public
 */
exports.getCustomerFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await feedbackService.getCustomerFeedbacks(req.params.customerId);
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/feedbacks/:id
 * @desc    Get feedback by ID
 * @access  Public
 */
exports.getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/feedbacks/:id
 * @desc    Update feedback status
 * @access  Public
 */
exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const feedback = await feedbackService.updateFeedbackStatus(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/feedbacks/:id
 * @desc    Delete feedback (soft delete)
 * @access  Public
 */
exports.deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.deleteFeedback(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/feedbacks/stats/summary
 * @desc    Get feedback statistics
 * @access  Public
 */
exports.getFeedbackStats = async (req, res, next) => {
  try {
    const stats = await feedbackService.getFeedbackStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
