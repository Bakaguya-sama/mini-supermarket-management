# 🚀 Quick Start Guide - E-Commerce API

## 📋 Cấu trúc Files Tạo Ra

```
server/
├── controllers/
│   ├── cartController.js              ✅ NEW - Cart operations
│   ├── orderController.js             ✅ NEW - Order operations  
│   ├── deliveryOrderController.js     ✅ NEW - Delivery operations
│   ├── productController.js           (existing)
│   ├── staffController.js             (existing)
│   └── supplierController.js          (existing)
│
├── routes/
│   ├── cartRoutes.js                  ✅ NEW - Cart endpoints
│   ├── orderRoutes.js                 ✅ NEW - Order endpoints
│   ├── deliveryOrderRoutes.js         ✅ NEW - Delivery endpoints
│   ├── productRoutes.js               (existing)
│   ├── staffRoutes.js                 (existing)
│   └── supplierRoutes.js              (existing)
│
├── tests/
│   ├── api.test.js                    ✅ NEW - Jest test suite
│   ├── api-test.http                  ✅ NEW - HTTP test requests
│   ├── products.test.http             (existing)
│   ├── staff.test.http                (existing)
│   └── supplier.test.http             (existing)
│
├── server.js                          ✅ UPDATED - Added new routes
├── package.json                       ✅ UPDATED - Added supertest
└── API_DOCUMENTATION.md               ✅ NEW - Full documentation
```

## 🎯 Các Tính Năng Chính

### 1️⃣ Cart API (Giỏ Hàng)
- ✅ Tạo/Lấy giỏ hàng (auto-create)
- ✅ Thêm/Cập nhật/Xóa sản phẩm
- ✅ Áp dụng mã khuyến mãi
- ✅ Tính toán subtotal, discount, total tự động

### 2️⃣ Order API (Đơn Hàng)
- ✅ Checkout từ giỏ hàng (tạo Order)
- ✅ **Trừ stock tự động** khi checkout
- ✅ **Hoàn trả stock** khi hủy order
- ✅ Quản lý trạng thái: pending → confirmed → shipped → delivered
- ✅ Lọc, phân trang, thống kê đơn hàng

### 3️⃣ Delivery Order API (Giao Hàng)
- ✅ Gán đơn hàng cho delivery staff
- ✅ Theo dõi trạng thái: assigned → in_transit → delivered
- ✅ Xử lý thất bại (failed)
- ✅ Thống kê hiệu suất giao hàng

## 🔧 Cài Đặt & Khởi Chạy

### 1. Cài đặt dependencies
```bash
cd server
npm install
```

### 2. Khởi chạy server
```bash
npm run dev
```

Server sẽ chạy trên http://localhost:5000

### 3. Kiểm tra server hoạt động
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-12-12T10:30:00Z",
  "uptime": 15.234,
  "database": "connected"
}
```

## 🧪 Testing

### Cách 1: Sử dụng REST Client (VS Code)
1. Mở file `server/tests/api-test.http`
2. Cài extension: **REST Client** (humao.rest-client)
3. Nhấp "Send Request" trên mỗi request

### Cách 2: Sử dụng Postman
1. Tạo collection mới
2. Import file `api-test.http`
3. Set biến môi trường:
   - `baseUrl`: http://localhost:5000/api
   - `customerId`: [MongoDB ID thực tế]
   - `productId`: [MongoDB ID thực tế]
   - `staffId`: [MongoDB ID thực tế]

### Cách 3: Chạy Jest Test
```bash
npm test
```

## 📝 API Endpoints Chính

### Cart Endpoints
```
GET    /api/carts/:customerId              - Lấy giỏ
POST   /api/carts/:customerId/items        - Thêm sản phẩm
PUT    /api/carts/items/:cartItemId        - Cập nhật số lượng
DELETE /api/carts/items/:cartItemId        - Xóa sản phẩm
POST   /api/carts/:customerId/apply-promo  - Áp dụng promotion
DELETE /api/carts/:customerId/clear        - Xóa toàn bộ giỏ
```

### Order Endpoints
```
GET    /api/orders                          - Lấy danh sách
GET    /api/orders/:id                      - Lấy chi tiết
POST   /api/orders/checkout                 - Checkout (tạo order)
PUT    /api/orders/:id                      - Cập nhật order
DELETE /api/orders/:id                      - Hủy order
GET    /api/orders/customer/:customerId     - Lấy order của customer
GET    /api/orders/stats                    - Thống kê
```

### Delivery Order Endpoints
```
GET    /api/delivery-orders                 - Lấy danh sách
GET    /api/delivery-orders/:id             - Lấy chi tiết
POST   /api/delivery-orders                 - Gán order cho staff
PUT    /api/delivery-orders/:id             - Cập nhật trạng thái
DELETE /api/delivery-orders/:id             - Hủy gán
GET    /api/delivery-orders/staff/:staffId  - Lấy order của staff
GET    /api/delivery-orders/status/:status  - Lọc theo trạng thái
GET    /api/delivery-orders/stats           - Thống kê giao hàng
```

## 📊 Database Schema

### Models Được Sử Dụng

**Cart & CartItem**
- Cart: giỏ hàng chứa customer_id, status, subtotal, total, items
- CartItem: sản phẩm trong giỏ, status (active/removed/purchased/saved_for_later)

**Order & OrderItem**
- Order: đơn hàng từ checkout, status (pending/confirmed/shipped/delivered/cancelled)
- OrderItem: sản phẩm trong đơn hàng, tracking status

**DeliveryOrder**
- Đơn hàng giao hàng, assign cho delivery staff
- Status: assigned/in_transit/delivered/failed
- Link với Order và Staff

## 🔑 Workflow Gợi Ý (Manual Testing)

### 1. Lấy Customer & Product IDs
```bash
# Lấy danh sách customers
curl http://localhost:5000/api/customers

# Lấy danh sách products
curl http://localhost:5000/api/products
```

Ghi lại các ID để dùng cho requests sau.

### 2. Thêm sản phẩm vào giỏ
```
POST /api/carts/:customerId/items
{
  "product_id": "64f5...",
  "quantity": 2
}
```

### 3. Checkout (Tạo Order)
```
POST /api/orders/checkout
{
  "customer_id": "64f5...",
  "delivery_address": "123 Đường Lê Lợi, Quận 1"
}
```

### 4. Gán Order cho Delivery Staff
```
POST /api/delivery-orders
{
  "order_id": "64f5...",
  "staff_id": "64f5..." (delivery staff)
}
```

### 5. Cập nhật trạng thái giao hàng
```
PUT /api/delivery-orders/:id
{
  "status": "in_transit"
}
```

```
PUT /api/delivery-orders/:id
{
  "status": "delivered",
  "delivery_date": "2024-12-15"
}
```

## ⚠️ Important Notes

### Stock Management
- ✅ Stock tự động **trừ** khi checkout
- ✅ Stock tự động **hoàn trả** khi hủy order
- ✅ Không thể thêm vào giỏ nếu stock không đủ

### Status Transitions
```
Order Status:
pending → confirmed → shipped → delivered ✓
         → cancelled (hoàn trả stock)

DeliveryOrder Status:
assigned → in_transit → delivered ✓
        → failed (Order quay lại pending)
```

### Soft Deletes
- CartItem không xóa cứng, chỉ thay status='removed'
- Giúp bảo toàn dữ liệu cho analytics

### Promotions
- Chỉ áp dụng được khi:
  - Promotion active
  - Ngày hiện tại trong khoảng start_date - end_date
  - Tổng tiền giỏ >= minimum purchase

## 🐛 Troubleshooting

### Server không khởi động
```bash
# Kiểm tra port 5000 đang dùng
netstat -ano | findstr :5000

# Kill process nếu cần
taskkill /PID [PID] /F
```

### MongoDB connection failed
```bash
# Kiểm tra MongoDB đang chạy
mongosh

# Hoặc kiểm tra .env file
cat .env
```

### Routes không tìm thấy
```bash
# Kiểm tra server.js đã import routes chưa
grep -n "cartRoutes\|orderRoutes\|deliveryOrderRoutes" server.js
```

## 📚 Documentation

- **Chi tiết API**: Xem `API_DOCUMENTATION.md`
- **Test HTTP**: Xem `tests/api-test.http`
- **Jest Tests**: Xem `tests/api.test.js`

## 🎉 Success Indicators

✅ Server khởi động thành công với cả 3 route mới  
✅ Có thể thêm sản phẩm vào giỏ  
✅ Stock tự động trừ khi checkout  
✅ Có thể gán order cho delivery staff  
✅ Có thể cập nhật trạng thái giao hàng  
✅ Thống kê hoạt động chính xác  

## 📞 Hỗ Trợ

Nếu gặp lỗi:
1. Kiểm tra API_DOCUMENTATION.md
2. Xem error message chi tiết từ server logs
3. Kiểm tra database connection
4. Xem lại request body format
