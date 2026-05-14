// controllers/customerController.js
const customerService = require('../services/CustomerService');
const logger = require('../config/logger');

/** @route GET /api/customers */
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
exports.getCustomerById = async (req, res, next) => {
  try {
    const data = await customerService.getCustomerById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/customers/account/:accountId */
exports.getCustomerByAccount = async (req, res, next) => {
  try {
    const data = await customerService.getCustomerByAccount(req.params.accountId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/customers/stats */
exports.getCustomerStats = async (req, res, next) => {
  try {
    const data = await customerService.getCustomerStats();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/customers */
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