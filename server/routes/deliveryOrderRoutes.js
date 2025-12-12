const express = require('express');
const router = express.Router();
const deliveryOrderController = require('../controllers/deliveryOrderController');

// Thống kê giao hàng
router.get('/stats', deliveryOrderController.getDeliveryStats);

// Lấy tất cả đơn giao hàng
router.get('/', deliveryOrderController.getAllDeliveryOrders);

// Lấy đơn giao hàng theo nhân viên
router.get('/staff/:staffId', deliveryOrderController.getDeliveriesByStaff);

// Lấy chi tiết đơn giao hàng
router.get('/:id', deliveryOrderController.getDeliveryOrderById);

// Tạo đơn giao hàng
router.post('/', deliveryOrderController.createDeliveryOrder);

// Cập nhật đơn giao hàng
router.put('/:id', deliveryOrderController.updateDeliveryOrder);

// Gán lại nhân viên giao hàng
router.patch('/:id/reassign', deliveryOrderController.reassignDelivery);

// Xóa đơn giao hàng
router.delete('/:id', deliveryOrderController.deleteDeliveryOrder);

module.exports = router;
