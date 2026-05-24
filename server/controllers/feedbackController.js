// server/controllers/feedbackController.js
const feedbackService = require('../services/FeedbackService');
const logger = require('../config/logger');

/**
 * @route   POST /api/feedbacks
 * @desc    Create new customer feedback
 * @access  Public
 */
/**
 * @openapi
 * /api/feedbacks/:
 *   post:
 *     tags: [feedback]
 *     summary: create Feedback
 *     operationId: createFeedback
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, subject, customer_id]
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [complaint, suggestion, praise]
 *               subject:
 *                 type: string
 *                 example: Product quality issue
 *               detail:
 *                 type: string
 *                 example: The product arrived damaged and the packaging was open.
 *               customer_id:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               sentiment:
 *                 type: string
 *                 example: negative
 *               order_id:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/feedbacks/:
 *   get:
 *     tags: [feedback]
 *     summary: get All Feedbacks
 *     operationId: getAllFeedbacks
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/feedbacks/customer/{customerId}:
 *   get:
 *     tags: [feedback]
 *     summary: get Customer Feedbacks
 *     operationId: getCustomerFeedbacks
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/feedbacks/{id}:
 *   get:
 *     tags: [feedback]
 *     summary: get Feedback By Id
 *     operationId: getFeedbackById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/feedbacks/{id}:
 *   put:
 *     tags: [feedback]
 *     summary: update Feedback Status
 *     operationId: updateFeedbackStatus
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *               assigned_to_staff_id:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/feedbacks/{id}:
 *   delete:
 *     tags: [feedback]
 *     summary: delete Feedback
 *     operationId: deleteFeedback
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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
/**
 * @openapi
 * /api/feedbacks/stats/summary:
 *   get:
 *     tags: [feedback]
 *     summary: get Feedback Stats
 *     operationId: getFeedbackStats
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
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

