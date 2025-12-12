const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Thống kê giỏ hàng
router.get('/stats', cartController.getCartStats);

// Lấy tất cả giỏ hàng
router.get('/', cartController.getAllCarts);

// Lấy giỏ hàng theo khách hàng
router.get('/customer/:customerId', cartController.getCartByCustomer);

// Lấy chi tiết giỏ hàng
router.get('/:id', cartController.getCartById);

// Thêm sản phẩm vào giỏ hàng
router.post('/:cartId/items', cartController.addItemToCart);

// Cập nhật số lượng sản phẩm
router.put('/items/:itemId/quantity', cartController.updateItemQuantity);

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/items/:itemId', cartController.removeItemFromCart);

// Áp dụng mã khuyến mãi
router.post('/:cartId/apply-promo', cartController.applyPromo);

// Xóa mã khuyến mãi
router.delete('/:cartId/remove-promo', cartController.removePromo);

// Xóa tất cả sản phẩm trong giỏ hàng
router.delete('/:cartId/clear', cartController.clearCart);

// Thanh toán giỏ hàng
router.patch('/:cartId/checkout', cartController.checkoutCart);

module.exports = router;
