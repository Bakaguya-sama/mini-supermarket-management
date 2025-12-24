const express = require('express');
const router = express.Router();
const deliveryOrderController = require('../controllers/deliveryOrderController');
const { authenticate, requireStaff } = require('../middleware/auth');

// Tất cả routes yêu cầu authentication
router.use(authenticate);

// Thống kê giao hàng (Staff/Admin)
router.get('/stats', requireStaff, deliveryOrderController.getDeliveryStats);

// Lấy tất cả đơn giao hàng (Staff/Admin - auto filter theo staffId)
router.get('/', requireStaff, deliveryOrderController.getAllDeliveryOrders);

// Lấy đơn giao hàng theo nhân viên (Admin only)
router.get('/staff/:staffId', requireStaff, deliveryOrderController.getDeliveriesByStaff);

// Lấy chi tiết đơn giao hàng (Staff/Admin)
router.get('/:id', requireStaff, deliveryOrderController.getDeliveryOrderById);

// Tạo đơn giao hàng (Admin only - usually)
router.post('/', deliveryOrderController.createDeliveryOrder);

// Cập nhật đơn giao hàng (Staff can update their own orders)
router.put('/:id', requireStaff, deliveryOrderController.updateDeliveryOrder);

// Gán lại nhân viên giao hàng (Admin only)
router.patch('/:id/reassign', deliveryOrderController.reassignDelivery);

// Xóa đơn giao hàng (Admin only)
router.delete('/:id', deliveryOrderController.deleteDeliveryOrder);

module.exports = router;
