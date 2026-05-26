// controllers/customerController.js
const customerService = require('../services/CustomerService');
const logger = require('../config/logger');

/** @route GET /api/customers */
/**
 * @openapi
 * /api/customers:
 *   get:
 *     tags: [customer]
 *     summary: Get all customers with pagination and filtering
 *     operationId: getAllCustomers
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: Customer status filter
 *     responses:
 *       200:
 *         description: Successfully retrieved customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *       400:
 *         description: Invalid query parameters
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { customers, total, page, pages } = await customerService.getAllCustomers(req.query);
    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page,
      pages,
      data: customers
    });
  } catch (error) { next(error); }
};

/** @route GET /api/customers/:id */
/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     tags: [customer]
 *     summary: Get customer by ID
 *     operationId: getCustomerById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: '507f1f77bcf86cd799439011'
 *         description: MongoDB customer ID
 *     responses:
 *       200:
 *         description: Customer found
 *       400:
 *         description: Invalid customer ID format
 *       404:
 *         description: Customer not found
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const data = await customerService.getCustomerById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/customers/account/:accountId */
/**
 * @openapi
 * /api/customers/account/{accountId}:
 *   get:
 *     tags: [customer]
 *     summary: Get customer by account ID
 *     operationId: getCustomerByAccount
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: '507f1f77bcf86cd799439011'
 *         description: MongoDB account ID
 *     responses:
 *       200:
 *         description: Customer found by account
 *       400:
 *         description: Invalid account ID format
 *       404:
 *         description: Customer not found
 */
exports.getCustomerByAccount = async (req, res, next) => {
  try {
    const data = await customerService.getCustomerByAccount(req.params.accountId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/customers/stats */
/**
 * @openapi
 * /api/customers/stats:
 *   get:
 *     tags: [customer]
 *     summary: Get customer statistics
 *     operationId: getCustomerStats
 *     responses:
 *       200:
 *         description: Customer statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: integer
 *                       minimum: 0
 *                     activeCustomers:
 *                       type: integer
 *                       minimum: 0
 *                     totalSpent:
 *                       type: number
 *                       minimum: 0
 *       400:
 *         description: Error retrieving statistics
 */
exports.getCustomerStats = async (req, res, next) => {
  try {
    const data = await customerService.getCustomerStats();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/customers */
/**
 * @openapi
 * /api/customers:
 *   post:
 *     tags: [customer]
 *     summary: Create a new customer
 *     operationId: createCustomer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: 'Nguyen Van A'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'customer@example.com'
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 example: '0912345678'
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 example: '123 Main St'
 *               membershipType:
 *                 type: string
 *                 enum: [Standard, Gold, Silver]
 *                 example: 'Standard'
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 120
 *                 example: 30
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 default: active
 *             required: [name, email, phone]
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Invalid customer data
 *       422:
 *         description: Validation error
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    logger.info(`Customer created successfully via controller: ${customer._id}`);
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) { next(error); }
};

/** @route PUT /api/customers/:id */
/**
 * @openapi
 * /api/customers/{id}:
 *   put:
 *     tags: [customer]
 *     summary: Update customer details
 *     operationId: updateCustomer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: '507f1f77bcf86cd799439011'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *               membershipType:
 *                 type: string
 *                 enum: [Standard, Gold, Silver]
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 maximum: 120
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Invalid customer data
 *       404:
 *         description: Customer not found
 *       422:
 *         description: Validation error
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    logger.info(`Customer updated successfully via controller: ${req.params.id}`);
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) { next(error); }
};

/** @route PATCH /api/customers/:id/points */
/**
 * @openapi
 * /api/customers/{id}/points:
 *   patch:
 *     tags: [customer]
 *     summary: Update customer points
 *     operationId: updatePoints
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: '507f1f77bcf86cd799439011'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsToAdd:
 *                 type: integer
 *                 minimum: -10000
 *                 maximum: 10000
 *                 example: 100
 *             required: [pointsToAdd]
 *     responses:
 *       200:
 *         description: Points updated successfully
 *       400:
 *         description: Invalid points value
 *       404:
 *         description: Customer not found
 *       422:
 *         description: Validation error
 */
exports.updatePoints = async (req, res, next) => {
  try {
    const customer = await customerService.updatePoints(req.params.id, req.body.pointsToAdd);
    res.status(200).json({
      success: true,
      message: 'Points updated successfully',
      data: customer
    });
  } catch (error) { next(error); }
};

/** @route PATCH /api/customers/:id/spent */
/**
 * @openapi
 * /api/customers/{id}/spent:
 *   patch:
 *     tags: [customer]
 *     summary: Update total spent amount
 *     operationId: updateTotalSpent
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: '507f1f77bcf86cd799439011'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999999
 *                 example: 150.50
 *             required: [amount]
 *     responses:
 *       200:
 *         description: Total spent updated successfully
 *       400:
 *         description: Invalid amount
 *       404:
 *         description: Customer not found
 *       422:
 *         description: Validation error
 */
exports.updateTotalSpent = async (req, res, next) => {
  try {
    const customer = await customerService.updateTotalSpent(req.params.id, req.body.amount);
    res.status(200).json({
      success: true,
      message: 'Total spent updated successfully',
      data: customer
    });
  } catch (error) { next(error); }
};

/** @route GET /api/customers/:id/orders */
/**
 * @openapi
 * /api/customers/{id}/orders:
 *   get:
 *     tags: [customer]
 *     summary: Get customer orders
 *     operationId: getCustomerOrders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: '507f1f77bcf86cd799439011'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *     responses:
 *       200:
 *         description: Customer orders retrieved
 *       400:
 *         description: Invalid query parameters
 *       404:
 *         description: Customer not found
 */
exports.getCustomerOrders = async (req, res, next) => {
  try {
    const { orders, total, page, pages } = await customerService.getCustomerOrders(req.params.id, req.query);
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      pages,
      data: orders
    });
  } catch (error) { next(error); }
};

/** @route DELETE /api/customers/:id */
/**
 * @openapi
 * /api/customers/{id}:
 *   delete:
 *     tags: [customer]
 *     summary: Delete customer
 *     operationId: deleteCustomer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           example: '507f1f77bcf86cd799439011'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 example: 'Customer requested deletion'
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       400:
 *         description: Invalid customer ID
 *       404:
 *         description: Customer not found
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.deleteCustomer(req.params.id);
    logger.info(`Customer deleted successfully via controller: ${req.params.id}`);
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      data: customer
    });
  } catch (error) { next(error); }
};
