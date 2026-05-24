// server/controllers/staffController.js
const staffService = require('../services/StaffService');
const logger = require('../config/logger');

/**
 * @route   GET /api/staff
 * @desc    Get all staff with filters and pagination
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/:
 *   get:
 *     tags: [staff]
 *     summary: get All Staff
 *     operationId: getAllStaff
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getAllStaff = async (req, res, next) => {
  try {
    const { staff, total, page, pages } = await staffService.getAllStaff(req.query);
    res.status(200).json({
      success: true,
      count: staff.length,
      total,
      page,
      pages,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/staff/stats
 * @desc    Get staff statistics
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/stats:
 *   get:
 *     tags: [staff]
 *     summary: get Staff Stats
 *     operationId: getStaffStats
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getStaffStats = async (req, res, next) => {
  try {
    const stats = await staffService.getStaffStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/staff/:id
 * @desc    Get single staff by ID
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/{id}:
 *   get:
 *     tags: [staff]
 *     summary: get Staff By Id
 *     operationId: getStaffById
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
exports.getStaffById = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/staff
 * @desc    Create new staff with account
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/:
 *   post:
 *     tags: [staff]
 *     summary: create Staff
 *     operationId: createStaff
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.createStaff = async (req, res, next) => {
  try {
    const staff = await staffService.createStaff(req.body);
    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/{id}:
 *   put:
 *     tags: [staff]
 *     summary: update Staff
 *     operationId: updateStaff
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
exports.updateStaff = async (req, res, next) => {
  try {
    const staff = await staffService.updateStaff(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Staff updated successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/staff/:id
 * @desc    Soft delete staff (set isDelete = true)
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/{id}:
 *   delete:
 *     tags: [staff]
 *     summary: delete Staff
 *     operationId: deleteStaff
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
exports.deleteStaff = async (req, res, next) => {
  try {
    const staff = await staffService.deleteStaff(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Staff marked as deleted successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/staff/:id/permanent
 * @desc    Permanently delete staff and account
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/{id}/permanent:
 *   delete:
 *     tags: [staff]
 *     summary: permanent Delete Staff
 *     operationId: permanentDeleteStaff
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
exports.permanentDeleteStaff = async (req, res, next) => {
  try {
    const result = await staffService.permanentDeleteStaff(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/staff/:id/activate
 * @desc    Activate staff
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/{id}/activate:
 *   patch:
 *     tags: [staff]
 *     summary: activate Staff
 *     operationId: activateStaff
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
exports.activateStaff = async (req, res, next) => {
  try {
    const staff = await staffService.activateStaff(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Staff activated successfully',
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/staff/account/:accountId
 * @desc    Get staff by account ID
 * @access  Public
 */
/**
 * @openapi
 * /api/staff/account/{accountId}:
 *   get:
 *     tags: [staff]
 *     summary: get Staff By Account Id
 *     operationId: getStaffByAccountId
 *     parameters:
 *       - in: path
 *         name: accountId
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
exports.getStaffByAccountId = async (req, res, next) => {
  try {
    const staff = await staffService.getStaffByAccountId(req.params.accountId);
    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};

