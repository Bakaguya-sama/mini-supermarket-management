# 🏪 Mini Supermarket Management - API Documentation

## 🔐 Authentication API

### 1. Login
**POST** `/api/auth/login`

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65f1234567890...",
      "username": "admin",
      "email": "admin@minisupermarket.com",
      "fullName": "Admin Account",
      "role": "admin"
    }
  }
}
```

### 2. Register
**POST** `/api/auth/register`

Request:
```json
{
  "username": "newuser",
  "email": "newuser@email.com",
  "password": "password123",
  "fullName": "New User",
  "phone": "0900000000",
  "role": "customer"
}
```

### 3. Get Current User
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer {token}
```

---

## 👥 Staff API

All staff endpoints require authentication with admin/manager role.

### 1. Get All Staff
**GET** `/api/staff`

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `position` (optional): Filter by position (cashier, warehouse, delivery, manager)
- `search` (optional): Search by name

### 2. Get Staff by ID
**GET** `/api/staff/:id`

### 3. Get Staff by Position
**GET** `/api/staff/position/:position`

Positions: cashier, warehouse, delivery, manager

### 4. Get Staff Statistics
**GET** `/api/staff/statistics/overview`

### 5. Create Staff
**POST** `/api/staff`

Request:
```json
{
  "account": {
    "username": "staff_user",
    "email": "staff@email.com",
    "password": "password123",
    "fullName": "Staff Name",
    "phone": "0900000001"
  },
  "position": "cashier",
  "employmentType": "fulltime",
  "annualSalary": 15000000,
  "hireDate": "2024-01-01"
}
```

### 6. Update Staff
**PUT** `/api/staff/:id`

Request:
```json
{
  "position": "warehouse",
  "annualSalary": 18000000,
  "notes": "Promoted to warehouse manager"
}
```

### 7. Delete Staff
**DELETE** `/api/staff/:id`

---

## 🛒 Product API

### 1. Get All Products
**GET** `/api/products`

Query Parameters:
- `page` (optional)
- `limit` (optional)
- `category` (optional)
- `status` (optional): available, out_of_stock, discontinued
- `search` (optional): Search by product name

Response:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890...",
      "name": "Nước Coca 500ml",
      "price": 15000,
      "currentStock": 100,
      "category": "Đồ uống",
      "unit": "chai",
      "status": "available",
      "supplierId": "65f1234567890..."
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### 2. Get Product by ID
**GET** `/api/products/:id`

### 3. Get Products by Category
**GET** `/api/products/category/:category`

### 4. Get Low Stock Products
**GET** `/api/products/stock/low`

### 5. Get Product Statistics
**GET** `/api/products/statistics/overview`

### 6. Create Product
**POST** `/api/products` (Admin only)

Request:
```json
{
  "name": "Nước Cam Natурель",
  "price": 25000,
  "unit": "chai",
  "category": "Đồ uống",
  "currentStock": 50,
  "minimumStockLevel": 10,
  "maximumStockLevel": 200,
  "supplierId": "65f1234567890..."
}
```

### 7. Update Product
**PUT** `/api/products/:id` (Admin only)

### 8. Update Stock
**PATCH** `/api/products/:id/stock`

Request:
```json
{
  "action": "add",  // add, subtract, set
  "quantity": 10
}
```

### 9. Delete Product
**DELETE** `/api/products/:id` (Admin only)

---

## 👥 Customer API

### 1. Get All Customers
**GET** `/api/customers`

Query Parameters:
- `page` (optional)
- `limit` (optional)
- `membership` (optional): regular, silver, gold, platinum
- `search` (optional)

### 2. Get Customer by ID
**GET** `/api/customers/:id`

### 3. Get Customer by Account ID
**GET** `/api/customers/account/:accountId`

### 4. Get Customers by Membership
**GET** `/api/customers/membership/:type`

### 5. Get Customer Statistics
**GET** `/api/customers/:id/statistics`

### 6. Create Customer
**POST** `/api/customers`

Request:
```json
{
  "accountId": "65f1234567890...",
  "membershipType": "regular"
}
```

### 7. Update Customer
**PUT** `/api/customers/:id`

Request:
```json
{
  "membershipType": "silver",
  "notes": "VIP customer"
}
```

### 8. Update Points
**PATCH** `/api/customers/:id/points`

Request:
```json
{
  "action": "add",  // add, subtract, set
  "points": 100
}
```

### 9. Delete Customer
**DELETE** `/api/customers/:id`

---

## 🏭 Supplier API

### 1. Get All Suppliers
**GET** `/api/suppliers`

Query Parameters:
- `page` (optional)
- `limit` (optional)
- `active` (optional): true/false
- `search` (optional)

### 2. Get Supplier by ID
**GET** `/api/suppliers/:id`

### 3. Get Active Suppliers
**GET** `/api/suppliers/active`

### 4. Get Supplier Statistics
**GET** `/api/suppliers/statistics/overview`

### 5. Create Supplier
**POST** `/api/suppliers` (Admin only)

Request:
```json
{
  "name": "Supplier ABC",
  "contactPersonName": "Nguyễn Văn A",
  "email": "supplier@abc.com",
  "phone": "0901111111",
  "address": "Hà Nội"
}
```

### 6. Update Supplier
**PUT** `/api/suppliers/:id` (Admin only)

### 7. Delete Supplier
**DELETE** `/api/suppliers/:id` (Admin only - soft delete)

---

## 📋 Order API

### 1. Get All Orders
**GET** `/api/orders`

Query Parameters:
- `page` (optional)
- `limit` (optional)
- `status` (optional): pending, confirmed, shipped, delivered, cancelled
- `search` (optional)

### 2. Get Order by ID
**GET** `/api/orders/:id`

### 3. Get Orders by Status
**GET** `/api/orders/status/:status`

### 4. Get Orders by Customer
**GET** `/api/orders/customer/:customerId`

### 5. Get Order Statistics
**GET** `/api/orders/statistics/overview`

### 6. Create Order
**POST** `/api/orders`

Request:
```json
{
  "customerId": "65f1234567890...",
  "items": [
    {
      "productId": "65f1234567890...",
      "quantity": 2,
      "unitPrice": 50000
    }
  ],
  "totalAmount": 100000
}
```

### 7. Update Order
**PUT** `/api/orders/:id`

### 8. Update Order Status
**PATCH** `/api/orders/:id/status`

Request:
```json
{
  "status": "confirmed"  // pending, confirmed, shipped, delivered, cancelled
}
```

### 9. Delete Order
**DELETE** `/api/orders/:id` (Only pending orders)

---

## 💳 Invoice API

### 1. Get All Invoices
**GET** `/api/invoices`

Query Parameters:
- `page` (optional)
- `limit` (optional)
- `status` (optional): unpaid, paid, partial
- `search` (optional)

### 2. Get Invoice by ID
**GET** `/api/invoices/:id`

### 3. Get Invoices by Customer
**GET** `/api/invoices/customer/:customerId`

### 4. Get Invoices by Order
**GET** `/api/invoices/order/:orderId`

### 5. Get Invoice Statistics
**GET** `/api/invoices/statistics/overview`

### 6. Create Invoice
**POST** `/api/invoices`

Request:
```json
{
  "customerId": "65f1234567890...",
  "orderId": "65f1234567890...",
  "totalAmount": 100000
}
```

### 7. Update Invoice
**PUT** `/api/invoices/:id`

### 8. Update Payment Status
**PATCH** `/api/invoices/:id/status`

Request:
```json
{
  "paymentStatus": "paid"  // unpaid, paid, partial
}
```

### 9. Delete Invoice
**DELETE** `/api/invoices/:id`

---

## 📌 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (missing token)
- `403`: Forbidden (invalid token or insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate record)
- `500`: Server Error

---

## 🔑 Test Credentials

```
Admin:
  Username: admin
  Password: admin123

Manager:
  Username: manager
  Password: manager123

Staff:
  Username: cashier1
  Password: staff123

Customer:
  Username: customer1
  Password: customer123
```

---

## 🚀 Getting Started

1. **Login** to get token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

2. **Use token** in subsequent requests:
```bash
curl -X GET http://localhost:5000/api/staff \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 Database Models

### Account
- username (unique)
- email (unique)
- passwordHash
- fullName
- phone
- role (customer, staff, manager, admin)
- isActive

### Staff
- accountId (ref to Account)
- position (cashier, warehouse, delivery, manager)
- employmentType (fulltime, parttime, contract)
- annualSalary
- hireDate
- isActive

### Customer
- accountId (ref to Account)
- membershipType (regular, silver, gold, platinum)
- pointsBalance
- totalSpent
- registeredAt

### Product
- name
- price
- unit
- currentStock
- minimumStockLevel
- maximumStockLevel
- category
- status (available, out_of_stock, discontinued)
- supplierId (ref to Supplier)

### Supplier
- name
- contactPersonName
- email (unique)
- phone
- address
- isActive

### Order
- orderNumber (unique)
- customerId (ref to Customer)
- status (pending, confirmed, shipped, delivered, cancelled)
- totalAmount
- orderDate

### OrderItem
- orderId (ref to Order)
- productId (ref to Product)
- quantity
- unitPrice

### Invoice
- invoiceNumber (unique)
- customerId (ref to Customer)
- orderId (ref to Order)
- paymentStatus (unpaid, paid, partial)
- totalAmount
- invoiceDate

### InvoiceItem
- invoiceId (ref to Invoice)
- productId (ref to Product)
- quantity
- unitPrice
- lineTotal
