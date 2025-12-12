const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Thống kê đặt hàng
router.get('/stats', orderController.getOrderStats);

// Lấy tất cả đơn hàng
router.get('/', orderController.getAllOrders);

// Lấy đơn hàng theo khách hàng
router.get('/customer/:customerId', orderController.getOrdersByCustomer);

// Lấy chi tiết đơn hàng
router.get('/:id', orderController.getOrderById);

// Tạo đơn hàng từ giỏ hàng
router.post('/', orderController.createOrder);

// Cập nhật đơn hàng
router.put('/:id', orderController.updateOrder);

// Cập nhật trạng thái item
router.patch('/:id/items/:itemId/status', orderController.updateOrderItemStatus);

// Hủy đơn hàng
router.patch('/:id/cancel', orderController.cancelOrder);

// Xóa đơn hàng
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
