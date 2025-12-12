# 🛒 QUICK START - HOW TO USE THE NEW APIs

## 📋 Prerequisites
- Node.js và npm cài đặt
- MongoDB chạy trên localhost:27017
- Server chạy trên port 5000

## 🚀 QUICK START

### 1. Khởi động Server
```bash
cd server
npm install   # Nếu chưa cài dependencies
npm run seed  # Populate database với test data
npm start     # Khởi động server
```

Server sẽ chạy trên: **http://localhost:5000**

### 2. Test APIs Bằng REST Client (VS Code)

**Cài đặt extension:**
- Tìm kiếm "REST Client" trong VS Code Extensions
- Cài đặt extension từ Microsoft

**Sử dụng Test Files:**
1. Mở file: `server/tests/order.test.http`
2. Trong file, nhấn **"Send Request"** trên từng request
3. Response sẽ hiện lên trong panel bên cạnh

---

## 📊 ORDER API EXAMPLES

### Lấy tất cả đơn hàng
```http
GET http://localhost:5000/api/orders?page=1&limit=10
```

### Lấy đơn hàng theo khách hàng
```http
GET http://localhost:5000/api/orders/customer/CUSTOMER_ID?page=1&limit=10
```
*Thay `CUSTOMER_ID` bằng ID thực tế từ database*

### Tạo đơn hàng
```http
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "cart_id": "CART_ID",
  "customer_id": "CUSTOMER_ID",
  "notes": "Ghi chú giao hàng"
}
```

### Cập nhật trạng thái đơn hàng
```http
PUT http://localhost:5000/api/orders/ORDER_ID
Content-Type: application/json

{
  "status": "confirmed",
  "tracking_number": "TRACK123456789"
}
```

### Hủy đơn hàng
```http
PATCH http://localhost:5000/api/orders/ORDER_ID/cancel
Content-Type: application/json

{
  "reason": "Lý do hủy"
}
```

---

## 🚚 DELIVERY ORDER API EXAMPLES

### Lấy tất cả đơn giao hàng
```http
GET http://localhost:5000/api/delivery-orders?page=1&limit=10
```

### Lấy đơn giao của nhân viên cụ thể
```http
GET http://localhost:5000/api/delivery-orders/staff/STAFF_ID?page=1&limit=10
```

### Tạo đơn giao hàng (gán delivery cho order)
```http
POST http://localhost:5000/api/delivery-orders
Content-Type: application/json

{
  "order_id": "ORDER_ID",
  "staff_id": "STAFF_ID",
  "notes": "Ghi chú đặc biệt"
}
```

### Cập nhật trạng thái giao hàng
```http
PUT http://localhost:5000/api/delivery-orders/DELIVERY_ORDER_ID
Content-Type: application/json

{
  "status": "in_transit"
}
```

**Status có thể là:** `assigned` → `in_transit` → `delivered` hoặc `failed`

### Gán lại nhân viên giao hàng
```http
PATCH http://localhost:5000/api/delivery-orders/DELIVERY_ORDER_ID/reassign
Content-Type: application/json

{
  "new_staff_id": "ANOTHER_STAFF_ID"
}
```

---

## 🛒 CART API EXAMPLES

### Lấy giỏ hàng của khách hàng (auto-create nếu chưa có)
```http
GET http://localhost:5000/api/carts/customer/CUSTOMER_ID
```

### Thêm sản phẩm vào giỏ hàng
```http
POST http://localhost:5000/api/carts/CART_ID/items
Content-Type: application/json

{
  "product_id": "PRODUCT_ID",
  "quantity": 2
}
```

### Cập nhật số lượng sản phẩm
```http
PUT http://localhost:5000/api/carts/items/ITEM_ID/quantity
Content-Type: application/json

{
  "quantity": 5
}
```

### Xóa sản phẩm khỏi giỏ
```http
DELETE http://localhost:5000/api/carts/items/ITEM_ID
```

### Áp dụng mã khuyến mãi
```http
POST http://localhost:5000/api/carts/CART_ID/apply-promo
Content-Type: application/json

{
  "promo_id": "PROMO_ID"
}
```

### Thanh toán giỏ hàng (checkout)
```http
PATCH http://localhost:5000/api/carts/CART_ID/checkout
Content-Type: application/json

{}
```

---

## 🔍 Lấy IDs từ Database

### Cách 1: Dùng REST Client để lấy tất cả
```http
# Lấy tất cả khách hàng (từ seed data)
GET http://localhost:5000/api/customers

# Lấy tất cả sản phẩm
GET http://localhost:5000/api/products

# Lấy tất cả nhân viên
GET http://localhost:5000/api/staff
```

### Cách 2: Từ Seed Data
Khi chạy `npm run seed`, các ID được tạo. Có thể:
- Sử dụng MongoDB Compass để xem database
- Hoặc copy response từ API calls

---

## 📊 Các Endpoint Thống Kê (Stats)

### Order Stats
```http
GET http://localhost:5000/api/orders/stats
```
Response: Total orders, revenue, avg order value, orders by status

### DeliveryOrder Stats
```http
GET http://localhost:5000/api/delivery-orders/stats
```
Response: Deliveries by status, deliveries by staff

### Cart Stats
```http
GET http://localhost:5000/api/carts/stats
```
Response: Total carts, active/abandoned carts, avg cart value

---

## 🔗 WORKFLOW EXAMPLE - Quá trình mua hàng từ đầu đến cuối

### Step 1: Lấy giỏ hàng (tạo nếu chưa có)
```http
GET http://localhost:5000/api/carts/customer/CUSTOMER_ID
```
**Copy cart ID từ response**

### Step 2: Thêm sản phẩm vào giỏ
```http
POST http://localhost:5000/api/carts/CART_ID/items
Content-Type: application/json

{
  "product_id": "PRODUCT_ID",
  "quantity": 2
}
```

### Step 3: Xem chi tiết giỏ hàng
```http
GET http://localhost:5000/api/carts/CART_ID
```
*Kiểm tra subtotal, discounts, total*

### Step 4: Thanh toán (checkout)
```http
PATCH http://localhost:5000/api/carts/CART_ID/checkout
Content-Type: application/json

{}
```

### Step 5: Tạo đơn hàng từ giỏ hàng
```http
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "cart_id": "CART_ID",
  "customer_id": "CUSTOMER_ID",
  "notes": "Giao hàng vào buổi sáng"
}
```
**Copy order ID từ response**

### Step 6: Tạo đơn giao hàng
```http
POST http://localhost:5000/api/delivery-orders
Content-Type: application/json

{
  "order_id": "ORDER_ID",
  "staff_id": "STAFF_ID"
}
```

### Step 7: Cập nhật trạng thái giao hàng
```http
PUT http://localhost:5000/api/delivery-orders/DELIVERY_ORDER_ID
Content-Type: application/json

{
  "status": "in_transit"
}
```

### Step 8: Hoàn thành giao hàng
```http
PUT http://localhost:5000/api/delivery-orders/DELIVERY_ORDER_ID
Content-Type: application/json

{
  "status": "delivered",
  "delivery_date": "2024-12-20"
}
```

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module 'orderController'"
**Giải pháp:** Đảm bảo file được tạo trong `server/controllers/`

### Lỗi: "Cart not found"
**Giải pháp:** Dùng `GET /api/carts/customer/CUSTOMER_ID` để auto-create

### Lỗi: "Invalid status"
**Giải pháp:** Kiểm tra status enums:
- Order: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- DeliveryOrder: `assigned`, `in_transit`, `delivered`, `failed`
- Cart: `active`, `checked_out`, `abandoned`, `expired`

### Server không chạy
**Giải pháp:**
1. Kiểm tra MongoDB chạy: `mongod`
2. Kill process cũ: `lsof -i :5000` → `kill -9 PID`
3. Start lại: `npm start`

---

## 📚 Files Created

| File | Purpose |
|------|---------|
| `server/controllers/orderController.js` | Order API logic |
| `server/controllers/deliveryOrderController.js` | Delivery API logic |
| `server/controllers/cartController.js` | Cart API logic |
| `server/routes/orderRoutes.js` | Order endpoints |
| `server/routes/deliveryOrderRoutes.js` | Delivery endpoints |
| `server/routes/cartRoutes.js` | Cart endpoints |
| `server/tests/order.test.http` | Order API tests |
| `server/tests/deliveryOrder.test.http` | Delivery API tests |
| `server/tests/cart.test.http` | Cart API tests |

---

## ✅ Validation Checklist

- [ ] Server chạy trên port 5000
- [ ] MongoDB connected
- [ ] `npm run seed` chạy thành công
- [ ] Có thể GET `/api/orders` (status 200)
- [ ] Có thể GET `/api/carts/customer/ID` (status 200)
- [ ] Có thể GET `/api/delivery-orders` (status 200)
- [ ] Có thể POST `/api/orders` (tạo order mới)
- [ ] Có thể PATCH `/api/carts/ID/checkout` (checkout cart)

---

**Thắc mắc gì liên hệ dev. Happy coding! 🚀**
