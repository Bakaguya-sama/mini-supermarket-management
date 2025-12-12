const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Thống kê hóa đơn
router.get('/stats', invoiceController.getInvoiceStats);

// Lấy hóa đơn chưa thanh toán
router.get('/filter/unpaid', invoiceController.getUnpaidInvoices);

// Lấy tất cả hóa đơn
router.get('/', invoiceController.getAllInvoices);

// Lấy hóa đơn theo khách hàng
router.get('/customer/:customerId', invoiceController.getInvoicesByCustomer);

// Lấy chi tiết hóa đơn
router.get('/:id', invoiceController.getInvoiceById);

// Tạo hóa đơn
router.post('/', invoiceController.createInvoice);

// Cập nhật hóa đơn
router.put('/:id', invoiceController.updateInvoice);

// Đánh dấu hóa đơn đã thanh toán
router.patch('/:id/mark-paid', invoiceController.markAsPaid);

// Xóa hóa đơn
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
