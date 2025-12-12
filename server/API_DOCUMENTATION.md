# 📦 E-Commerce API Documentation

## Giới thiệu

Đây là tài liệu chi tiết cho Cart API, Order API, và Delivery Order API của hệ thống Mini Supermarket Management.

---

## 🏗️ Kiến trúc Dữ liệu

### 1. Cart (Giỏ hàng)
```
Cart {
  _id: ObjectId,
  customer_id: ObjectId (ref: Customer),
  last_activity_at: Date,
  status: String (active/checked_out/abandoned/expired),
  currency: String (VND),
  subtotal: Number,
  discounts: Number,
  total: Number,
  applied_promo_id: ObjectId (ref: Promotion),
  reserved: Boolean,
  reserved_until: Date,
  items: [CartItem]
}

CartItem {
  _id: ObjectId,
  cart_id: ObjectId (ref: Cart),
  product_id: ObjectId (ref: Product),
  quantity: Number,
  unit_price: Number,
  line_total: Number,
  status: String (active/saved_for_later/removed/purchased),
  warehouse_id: ObjectId (ref: Warehouse),
  backorder: Boolean
}
```

### 2. Order (Đơn hàng)
```
Order {
  _id: ObjectId,
  order_number: String (unique, ORD-timestamp-random),
  customer_id: ObjectId (ref: Customer),
  order_date: Date,
  status: String (pending/confirmed/shipped/delivered/cancelled),
  tracking_number: String,
  delivery_date: Date,
  delivery_address: String,
  total_amount: Number,
  payment_id: ObjectId (ref: Payment),
  notes: String,
  items: [OrderItem]
}

OrderItem {
  _id: ObjectId,
  order_id: ObjectId (ref: Order),
  product_id: ObjectId (ref: Product),
  quantity: Number,
  unit_price: Number,
  warehouse_issued_by_staff_id: ObjectId (ref: Staff),
  status: String (pending/picked/packed/shipped)
}
```

### 3. Delivery Order (Đơn hàng giao hàng)
```
DeliveryOrder {
  _id: ObjectId,
  order_id: ObjectId (ref: Order),
  staff_id: ObjectId (ref: Staff - position: "Delivery"),
  order_date: Date,
  delivery_date: Date,
  status: String (assigned/in_transit/delivered/failed),
  tracking_number: String,
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

---

## 🛒 CART API

### GET /api/carts/:customerId
**Mô tả:** Lấy giỏ hàng của customer. Nếu giỏ chưa tồn tại, tự động tạo giỏ mới.

**Parameters:**
- `customerId` (path, required): ID của customer

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f5...",
    "customer_id": "64f5...",
    "status": "active",
    "subtotal": 300000,
    "discounts": 0,
    "total": 300000,
    "items": [
      {
        "_id": "64f5...",
        "product_id": "64f5...",
        "quantity": 2,
        "unit_price": 150000,
        "line_total": 300000
      }
    ]
  }
}
```

### POST /api/carts/:customerId/items
**Mô tả:** Thêm sản phẩm vào giỏ hàng. Nếu sản phẩm đã tồn tại, cộng số lượng.

**Parameters:**
- `customerId` (path, required)

**Body:**
```json
{
  "product_id": "64f5...",
  "quantity": 2,
  "warehouse_id": "64f5..."
}
```

**Validation:**
- Kiểm tra sản phẩm tồn tại
- Kiểm tra stock đủ
- quantity > 0

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart",
  "data": {
    "_id": "64f5...",
    "product_id": "64f5...",
    "quantity": 2,
    "unit_price": 150000,
    "line_total": 300000
  }
}
```

### PUT /api/carts/items/:cartItemId
**Mô tả:** Cập nhật số lượng sản phẩm trong giỏ.

**Parameters:**
- `cartItemId` (path, required)

**Body:**
```json
{
  "quantity": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "quantity": 5,
    "line_total": 750000
  }
}
```

### DELETE /api/carts/items/:cartItemId
**Mô tả:** Xóa sản phẩm khỏi giỏ (soft delete, status='removed').

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### POST /api/carts/:customerId/apply-promo
**Mô tả:** Áp dụng mã khuyến mãi cho giỏ hàng.

**Body:**
```json
{
  "promo_code": "SUMMER2024"
}
```

**Validation:**
- Mã promotion tồn tại
- Promotion đang hoạt động
- Ngày hiện tại nằm trong khoảng start_date → end_date
- Tổng tiền giỏ hàng >= minimum purchase

**Response:**
```json
{
  "success": true,
  "message": "Promotion applied",
  "data": {
    "subtotal": 300000,
    "discount": 60000,
    "total": 240000,
    "applied_promo_id": "64f5..."
  }
}
```

### DELETE /api/carts/:customerId/clear
**Mô tả:** Xóa toàn bộ sản phẩm trong giỏ.

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

### GET /api/carts/:cartId/details
**Mô tả:** Lấy chi tiết giỏ hàng theo ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": { ... },
    "itemCount": 3
  }
}
```

---

## 📦 ORDER API

### GET /api/orders
**Mô tả:** Lấy danh sách tất cả đơn hàng với phân trang và lọc.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional): pending/confirmed/shipped/delivered/cancelled
- `customer_id` (optional)
- `sort` (optional): -order_date, -total_amount, v.v.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "64f5...",
      "order_number": "ORD-1734019245123-8432",
      "customer_id": "64f5...",
      "order_date": "2024-12-12T10:30:00Z",
      "status": "pending",
      "total_amount": 300000,
      "delivery_address": "123 Đường Lê Lợi, Quận 1",
      "tracking_number": "TRK-12345-67890"
    }
  ]
}
```

### GET /api/orders/:id
**Mô tả:** Lấy chi tiết đơn hàng cùng với các sản phẩm trong đó.

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64f5...",
      "order_number": "ORD-1734019245123-8432",
      "customer_id": "64f5...",
      "status": "pending",
      "total_amount": 300000,
      "order_date": "2024-12-12T10:30:00Z"
    },
    "orderItems": [
      {
        "_id": "64f5...",
        "product_id": "64f5...",
        "product_name": "Sản phẩm 1",
        "quantity": 2,
        "unit_price": 150000
      }
    ],
    "itemCount": 1
  }
}
```

### POST /api/orders/checkout
**Mô tả:** Tạo đơn hàng từ giỏ hàng (Checkout). **QUAN TRỌNG:** Stock tự động bị trừ.

**Body:**
```json
{
  "customer_id": "64f5...",
  "delivery_address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
  "notes": "Giao hàng vào buổi chiều"
}
```

**Validation:**
- Customer tồn tại
- Giỏ hàng tồn tại và không rỗng
- Tất cả sản phẩm có stock đủ
- Stock trừ tự động sau checkout

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "64f5...",
    "order_number": "ORD-1734019245123-8432",
    "status": "pending",
    "total_amount": 300000,
    "item_count": 2
  }
}
```

**Thay đổi trên Database:**
1. Tạo Order mới (status='pending')
2. Tạo OrderItem cho mỗi CartItem
3. **Trừ stock** từ Product: `product.current_stock -= quantity`
4. Cập nhật Cart: status='checked_out'
5. Cập nhật CartItem: status='purchased'

### PUT /api/orders/:id
**Mô tả:** Cập nhật đơn hàng (status, tracking_number, delivery_date, notes).

**Body:**
```json
{
  "status": "confirmed",
  "tracking_number": "TRK-12345-67890",
  "delivery_date": "2024-12-20",
  "notes": "Đơn hàng đã xác nhận"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order updated",
  "data": {
    "status": "confirmed",
    "tracking_number": "TRK-12345-67890",
    "updated_at": "2024-12-12T11:00:00Z"
  }
}
```

### DELETE /api/orders/:id
**Mô tả:** Hủy đơn hàng. **QUAN TRỌNG:** Stock tự động được hoàn trả.

**Validation:**
- Order phải ở status: pending hoặc confirmed
- Không thể hủy đơn hàng đã shipped hoặc delivered

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled. Stock restored."
}
```

**Thay đổi trên Database:**
1. Cập nhật Order: status='cancelled'
2. **Hoàn trả stock** cho Product: `product.current_stock += quantity`

### GET /api/orders/customer/:customerId
**Mô tả:** Lấy danh sách đơn hàng của một customer.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**
```json
{
  "success": true,
  "total": 10,
  "data": [
    {
      "_id": "64f5...",
      "order_number": "ORD-1734019245123-8432",
      "order_date": "2024-12-12",
      "status": "delivered",
      "total_amount": 300000
    }
  ]
}
```

### GET /api/orders/stats
**Mô tả:** Lấy thống kê đơn hàng.

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": 5,
    "confirmed": 10,
    "shipped": 8,
    "delivered": 45,
    "cancelled": 2,
    "total_revenue": 15000000,
    "avg_order_value": 300000
  }
}
```

---

## 🚚 DELIVERY ORDER API

### GET /api/delivery-orders
**Mô tả:** Lấy danh sách tất cả đơn hàng giao hàng.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional): assigned/in_transit/delivered/failed
- `staff_id` (optional)
- `sort` (optional): -order_date

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "64f5...",
      "order_id": "64f5...",
      "staff_id": "64f5...",
      "status": "assigned",
      "tracking_number": "TRK-2024-12-001",
      "order_date": "2024-12-12T10:30:00Z"
    }
  ]
}
```

### GET /api/delivery-orders/:id
**Mô tả:** Lấy chi tiết đơn hàng giao hàng.

**Response:**
```json
{
  "success": true,
  "data": {
    "deliveryOrder": {
      "_id": "64f5...",
      "order_id": "64f5...",
      "staff_id": "64f5...",
      "status": "assigned",
      "tracking_number": "TRK-2024-12-001",
      "order_date": "2024-12-12T10:30:00Z"
    },
    "orderItems": [
      {
        "product_id": "64f5...",
        "product_name": "Sản phẩm 1",
        "quantity": 2,
        "unit_price": 150000
      }
    ],
    "itemCount": 1
  }
}
```

### GET /api/delivery-orders/staff/:staffId
**Mô tả:** Lấy danh sách đơn hàng giao hàng của một delivery staff.

**Query Parameters:**
- `status` (optional)
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 10,
  "data": [
    {
      "_id": "64f5...",
      "order_id": "64f5...",
      "status": "in_transit",
      "tracking_number": "TRK-2024-12-001",
      "order_date": "2024-12-12T10:30:00Z"
    }
  ]
}
```

### GET /api/delivery-orders/status/:status
**Mô tả:** Lấy danh sách đơn hàng giao hàng theo trạng thái.

**URL Parameters:**
- `status` (required): assigned | in_transit | delivered | failed

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 20,
  "data": [ ... ]
}
```

### POST /api/delivery-orders
**Mô tả:** Tạo đơn hàng giao hàng (gán đơn hàng cho delivery staff).

**Body:**
```json
{
  "order_id": "64f5...",
  "staff_id": "64f5...",
  "tracking_number": "TRK-2024-12-001",
  "notes": "Giao hàng vào buổi chiều"
}
```

**Validation:**
- Order tồn tại
- Order status là pending hoặc confirmed
- Staff tồn tại
- Staff position = "Delivery"
- Delivery order chưa tồn tại cho order này

**Response:**
```json
{
  "success": true,
  "message": "Delivery order created and assigned successfully",
  "data": {
    "_id": "64f5...",
    "order_id": "64f5...",
    "staff_id": "64f5...",
    "status": "assigned",
    "tracking_number": "TRK-2024-12-001",
    "order_date": "2024-12-12T10:30:00Z"
  }
}
```

**Thay đổi trên Database:**
1. Tạo DeliveryOrder (status='assigned')
2. Cập nhật Order: status='confirmed', tracking_number=...

### PUT /api/delivery-orders/:id
**Mô tả:** Cập nhật trạng thái giao hàng.

**Body:**
```json
{
  "status": "in_transit",
  "delivery_date": "2024-12-15",
  "notes": "Đang giao hàng"
}
```

**Validation:**
- status phải trong: assigned, in_transit, delivered, failed
- DeliveryOrder tồn tại

**Response:**
```json
{
  "success": true,
  "message": "Delivery order updated successfully",
  "data": {
    "status": "in_transit",
    "delivery_date": "2024-12-15",
    "updated_at": "2024-12-12T11:30:00Z"
  }
}
```

**Thay đổi trên Database theo Status:**
- `in_transit` → Order.status = 'shipped'
- `delivered` → Order.status = 'delivered'
- `failed` → Order.status = 'pending' (reset để assign lại)

### DELETE /api/delivery-orders/:id
**Mô tả:** Hủy gán đơn hàng giao hàng (unassign).

**Validation:**
- Status phải là: assigned hoặc failed
- Không thể hủy nếu đang giao (in_transit) hoặc đã giao (delivered)

**Response:**
```json
{
  "success": true,
  "message": "Delivery order unassigned successfully"
}
```

**Thay đổi trên Database:**
1. Xóa DeliveryOrder
2. Cập nhật Order: status='pending'

### GET /api/delivery-orders/stats
**Mô tả:** Lấy thống kê giao hàng.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_delivery_orders": 65,
    "assigned": 5,
    "in_transit": 8,
    "delivered": 45,
    "failed": 2,
    "pending_assignments": 5,
    "delivery_success_rate": "75.00%"
  }
}
```

---

## 🔄 Luồng Công việc Hoàn Chỉnh

### 1. Customer thêm sản phẩm vào giỏ
```
POST /api/carts/:customerId/items
{
  "product_id": "...",
  "quantity": 2
}
```

### 2. Customer áp dụng mã khuyến mãi (tùy chọn)
```
POST /api/carts/:customerId/apply-promo
{
  "promo_code": "SUMMER2024"
}
```

### 3. Customer checkout - Tạo đơn hàng
```
POST /api/orders/checkout
{
  "customer_id": "...",
  "delivery_address": "...",
  "notes": "..."
}
→ Stock tự động bị trừ
→ Cart status = 'checked_out'
→ CartItem status = 'purchased'
```

### 4. Staff (Merchandise Supervisor) xác nhận đơn hàng
```
PUT /api/orders/:orderId
{
  "status": "confirmed"
}
```

### 5. Manager gán đơn hàng cho delivery staff
```
POST /api/delivery-orders
{
  "order_id": "...",
  "staff_id": "...",
  "tracking_number": "TRK-...",
  "notes": "..."
}
→ DeliveryOrder.status = 'assigned'
→ Order.status = 'confirmed'
```

### 6. Delivery staff nhận đơn hàng và cập nhật trạng thái
```
PUT /api/delivery-orders/:deliveryOrderId
{
  "status": "in_transit",
  "notes": "Đang giao hàng"
}
→ Order.status = 'shipped'
```

### 7. Delivery staff hoàn thành giao hàng
```
PUT /api/delivery-orders/:deliveryOrderId
{
  "status": "delivered",
  "delivery_date": "2024-12-15"
}
→ Order.status = 'delivered'
```

---

## 🧪 Testing với Postman/REST Client

### Cài đặt biến môi trường trong Postman:
```
@baseUrl = http://localhost:5000/api
@customerId = [thay bằng ID thực tế]
@productId = [thay bằng ID thực tế]
@staffId = [thay bằng ID thực tế]
@orderId = [thay bằng ID thực tế]
@deliveryOrderId = [thay bằng ID thực tế]
```

### Import File Test HTTP
- Sử dụng file `api-test.http` trong thư mục `server/tests/`
- Mở bằng VS Code với extension REST Client hoặc Postman
- Chỉnh sửa các biến theo dữ liệu thực tế trong database

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Quantity must be greater than 0"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 📝 Ghi chú quan trọng

1. **Stock Management:**
   - Stock trừ khi checkout (tạo order)
   - Stock hoàn trả khi hủy order
   - Không thể thêm sản phẩm vào giỏ nếu stock không đủ

2. **Status Flow:**
   - Order: pending → confirmed → shipped → delivered (hoặc cancelled)
   - DeliveryOrder: assigned → in_transit → delivered (hoặc failed)

3. **Soft Deletes:**
   - CartItem không bị xóa cứng mà chỉ thay đổi status='removed'
   - Giúp theo dõi lịch sử và phân tích

4. **Timestamps:**
   - Tất cả entities có `created_at` và `updated_at`
   - Cart có `last_activity_at` để theo dõi hoạt động

5. **Promotion:**
   - Chỉ có thể áp dụng promotion khi:
     - Promotion đang hoạt động
     - Ngày hiện tại nằm trong khoảng start_date - end_date
     - Tổng tiền giỏ hàng >= minimum purchase

---

## 🚀 Khởi chạy Server

```bash
# Cài đặt dependencies
npm install

# Chạy server (development)
npm run dev

# Chạy test
npm test
```

Server sẽ chạy trên http://localhost:5000

---

**Version:** 1.0.0  
**Last Updated:** 12/12/2024
