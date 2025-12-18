// server/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

/**
 * @route   POST /api/feedbacks
 * @desc    Create new feedback
 * @access  Public
 */
router.post('/', feedbackController.createFeedback);

/**
 * @route   GET /api/feedbacks
 * @desc    Get all feedbacks with filters
 * @access  Public
 */
router.get('/', feedbackController.getAllFeedbacks);

/**
 * @route   GET /api/feedbacks/stats/summary
 * @desc    Get feedback statistics
 * @access  Public
 */
router.get('/stats/summary', feedbackController.getFeedbackStats);

/**
 * @route   GET /api/feedbacks/customer/:customerId
 * @desc    Get customer's own feedbacks
 * @access  Public
 */
router.get('/customer/:customerId', feedbackController.getCustomerFeedbacks);

/**
 * @route   GET /api/feedbacks/:id
 * @desc    Get feedback by ID
 * @access  Public
 */
router.get('/:id', feedbackController.getFeedbackById);

/**
 * @route   PUT /api/feedbacks/:id
 * @desc    Update feedback status
 * @access  Public
 */
router.put('/:id', feedbackController.updateFeedbackStatus);

/**
 * @route   DELETE /api/feedbacks/:id
 * @desc    Delete feedback (soft delete)
 * @access  Public
 */
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
