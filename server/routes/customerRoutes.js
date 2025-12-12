const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Thống kê khách hàng
router.get('/stats', customerController.getCustomerStats);

// Lấy tất cả khách hàng
router.get('/', customerController.getAllCustomers);

// Lấy khách hàng theo tài khoản
router.get('/account/:accountId', customerController.getCustomerByAccount);

// Lấy chi tiết khách hàng
router.get('/:id', customerController.getCustomerById);

// Tạo khách hàng
router.post('/', customerController.createCustomer);

// Cập nhật thông tin khách hàng
router.put('/:id', customerController.updateCustomer);

// Cập nhật điểm khách hàng
router.patch('/:id/points', customerController.updatePoints);

// Cập nhật tổng tiền chi tiêu
router.patch('/:id/spent', customerController.updateTotalSpent);

// Lấy đơn hàng của khách hàng
router.get('/:id/orders', customerController.getCustomerOrders);

// Xóa khách hàng
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
