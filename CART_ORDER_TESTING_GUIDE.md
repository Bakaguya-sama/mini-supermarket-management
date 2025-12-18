# QUICK START - CART & ORDER TESTING 🧪

## 🚀 BẮT ĐẦU

### 1. Khởi động Server và Client
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### 2. Mở trình duyệt
```
http://localhost:5174
```

### 3. Login với Demo Account
- Hệ thống tự động load customer đầu tiên từ database
- Không cần login (sẽ implement sau)

---

## 🛒 TEST SHOPPING CART CHECKOUT

### Bước 1: Thêm sản phẩm vào giỏ hàng
```
1. Vào trang "Shop"
2. Tìm sản phẩm (VD: Coca Cola, Gạo ST25)
3. Click "Add to Cart"
4. Verify: Cart badge tăng số lượng ở navigation
```

### Bước 2: Xem giỏ hàng
```
1. Click "Cart" trong navigation
2. Verify:
   ✓ Hiển thị danh sách sản phẩm đã thêm
   ✓ Có quantity controls (+/-)
   ✓ Có nút Remove item
   ✓ Có nút Clear Cart
   ✓ Có Order Summary bên phải
```

### Bước 3: Apply Promotion (Optional)
```
1. Scroll xuống "Available Promotions"
2. Click vào promotion card để chọn
3. Verify:
   ✓ Promotion được highlight
   ✓ Price breakdown hiển thị discount
   ✓ Total amount giảm
```

### Bước 4: Redeem Points (Optional)
```
1. Nhập số points muốn redeem
2. Verify:
   ✓ Points không vượt quá max redeemable
   ✓ Price breakdown hiển thị points discount
   ✓ Total amount giảm thêm
```

### Bước 5: Checkout
```
1. Click "Proceed to Checkout" (nút màu xanh lá)
2. Verify:
   ✓ Loading state hiển thị
   ✓ Success message: "Order placed successfully!"
   ✓ Tự động chuyển sang trang "My Orders"
   ✓ Cart badge về 0
   ✓ Order mới xuất hiện ở đầu danh sách
```

**Expected Console Logs:**
```
🛒 Starting checkout process...
📦 Creating order: { customer_id: "...", cart_id: "...", notes: "..." }
✅ Order created: { _id: "...", order_number: "ORD-..." }
🛒 Loading cart for customer: ...
✅ Cart loaded: ... (should be empty after checkout)
```

---

## 📦 TEST MY ORDERS PAGE

### Bước 1: Mở trang My Orders
```
1. Click "My Orders" trong navigation
2. Verify:
   ✓ Loading spinner hiển thị
   ✓ Console log: "📦 Loading orders for customer: ..."
   ✓ Danh sách orders load từ backend
   ✓ Order mới nhất ở đầu danh sách
```

### Bước 2: Kiểm tra Order Card
```
Mỗi order card phải hiển thị:
✓ Order ID (VD: ORD-1234567890)
✓ Status badge với màu sắc:
  - Processing: Vàng cam
  - Shipping: Xanh dương
  - Delivered: Xanh lá
  - Cancelled: Đỏ
✓ Total amount
✓ List of items (product name × quantity)
✓ Tracking number (nếu có)
✓ Buttons:
  - "View Details" (luôn có)
  - "Cancel Order" (chỉ với status pending/processing)
```

### Bước 3: Test Filters
```
1. Click "All Orders" → Hiển thị tất cả
2. Click "Processing" → Chỉ hiển thị orders đang processing
3. Click "Shipping" → Chỉ hiển thị orders đang shipping
4. Click "Delivered" → Chỉ hiển thị orders đã delivered
5. Click "Cancelled" → Chỉ hiển thị orders đã cancelled
```

### Bước 4: Test Search
```
1. Nhập Order ID vào search box (VD: "ORD-123")
2. Verify: Chỉ hiển thị orders match với search term
3. Clear search → Hiển thị lại tất cả
```

### Bước 5: View Order Details
```
1. Click nút "View Details" trên một order
2. Verify modal hiển thị:
   ✓ Order ID
   ✓ Order Date
   ✓ Status badge
   ✓ Tracking Number
   ✓ Delivery Date (hoặc "Pending")
   ✓ List of items với quantity và price
   ✓ Total Amount
3. Click X hoặc click bên ngoài để đóng modal
```

### Bước 6: Cancel Order
```
1. Tìm order có status "Processing" hoặc "Pending"
2. Click nút "Cancel Order"
3. Verify:
   ✓ Confirmation modal hiển thị
   ✓ Message: "Are you sure you want to cancel this order?"
4. Click "Confirm"
5. Verify:
   ✓ Console log: "📦 Cancelling order: ..."
   ✓ Console log: "✅ Order cancelled successfully"
   ✓ Status badge đổi thành "Cancelled" (màu đỏ)
   ✓ Nút "Cancel Order" biến mất
   ✓ Modal đóng (nếu đang mở)
```

**Expected Console Logs:**
```
📦 Loading orders for customer: 66f8...
✅ Loaded 5 orders
📦 Cancelling order: ORD-1234567890
✅ Order cancelled successfully
```

---

## 🧪 TEST EDGE CASES

### 1. Empty Cart Checkout
```
Steps:
1. Clear toàn bộ cart (nút Clear Cart)
2. Click "Proceed to Checkout"

Expected:
✓ Error message: "Your cart is empty!"
✓ Không tạo order
✓ Vẫn ở trang Cart
```

### 2. No Orders (New Customer)
```
Steps:
1. Sử dụng customer chưa có orders
2. Vào trang My Orders

Expected:
✓ Empty state hiển thị
✓ Icon: FaBox (màu xám)
✓ Text: "No orders found"
```

### 3. Network Error (Checkout)
```
Steps:
1. Tắt backend server
2. Thử checkout

Expected:
✓ Error message: "Failed to complete checkout. Please try again."
✓ Loading state tắt
✓ Cart không bị clear
```

### 4. Network Error (Load Orders)
```
Steps:
1. Tắt backend server
2. Vào trang My Orders

Expected:
✓ Loading state tắt
✓ Empty state hiển thị
✓ Console error log
```

### 5. Cancel Delivered Order
```
Expected:
✓ Nút "Cancel Order" KHÔNG hiển thị
✓ Chỉ có nút "View Details"
```

### 6. Search No Results
```
Steps:
1. Nhập order ID không tồn tại
2. Verify: "No orders found" hiển thị
```

---

## 📊 BACKEND API TESTING (Optional)

### Test với Postman/Thunder Client:

#### 1. Create Order
```http
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customer_id": "66f8...",
  "cart_id": "66f8...",
  "notes": "Test order"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "...",
    "order_number": "ORD-1234567890",
    "status": "pending",
    "total_amount": 45.97,
    "orderItems": [...]
  }
}
```

#### 2. Get Customer Orders
```http
GET http://localhost:5000/api/orders/customer/66f8...
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "data": [
    {
      "_id": "...",
      "order_number": "ORD-...",
      "status": "pending",
      "total_amount": 45.97,
      "orderItems": [...]
    }
  ]
}
```

#### 3. Cancel Order
```http
PATCH http://localhost:5000/api/orders/66f8.../cancel
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "...",
    "status": "cancelled"
  }
}
```

---

## ✅ CHECKLIST

### Cart & Checkout:
- [ ] Add products to cart
- [ ] Update quantity (+/-)
- [ ] Remove item
- [ ] Clear cart
- [ ] Apply promotion
- [ ] Redeem points
- [ ] Checkout success flow
- [ ] Empty cart error
- [ ] Network error handling

### My Orders:
- [ ] Load orders on mount
- [ ] Display order list correctly
- [ ] Status badges have correct colors
- [ ] Filter by status (5 filters)
- [ ] Search by order ID
- [ ] View details modal
- [ ] Cancel order (pending/processing only)
- [ ] Cancel button hidden for delivered/cancelled
- [ ] Empty state for no orders
- [ ] Loading state

### Integration:
- [ ] Cart badge updates after checkout
- [ ] Auto navigate to orders after checkout
- [ ] Cart clears after checkout
- [ ] New order appears in orders list
- [ ] Customer ID passed correctly

---

## 🐛 TROUBLESHOOTING

### Issue: Orders không load
**Solution:**
1. Check console logs
2. Verify customerId có giá trị
3. Check network tab → GET /api/orders/customer/...
4. Verify backend server đang chạy
5. Check database có orders cho customer này

### Issue: Checkout không hoạt động
**Solution:**
1. Check console logs cho errors
2. Verify cart không empty
3. Verify customerId và cartId có giá trị
4. Check network tab → POST /api/orders
5. Verify backend order controller

### Issue: Cancel order không hoạt động
**Solution:**
1. Check order status (phải là pending/processing)
2. Verify order _id được truyền đúng
3. Check network tab → PATCH /api/orders/:id/cancel
4. Check backend logs

### Issue: Cart badge không update
**Solution:**
1. Check loadCustomerCart() được gọi sau checkout
2. Verify handleCheckout callback trong CustomerPortal
3. Check cartItems state được update

---

## 📝 NOTES

1. **Demo Customer**: Hệ thống tự động load customer đầu tiên từ database
2. **Order Status**: pending → processing → confirmed → shipping → delivered (hoặc cancelled)
3. **Cancel Rules**: Chỉ được cancel order với status pending/processing
4. **Cart Clearing**: Backend tự động clear cart khi checkout, frontend chỉ reload

---

## 🎯 SUCCESS CRITERIA

✅ **Checkout Flow:**
- Cart → Checkout → Order created → Navigate to Orders → Cart cleared

✅ **Orders Display:**
- All orders visible → Filters work → Search works → Details modal works

✅ **Cancel Order:**
- Click Cancel → Confirm → Status changes → Button disappears

✅ **Error Handling:**
- Empty cart error → Network error messages → Graceful degradation

**Nếu tất cả tests pass → HOÀN THÀNH! 🎉**
