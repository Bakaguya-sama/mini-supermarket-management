# 📋 API RESPONSE EXAMPLES & REFERENCE

## Order API Response Examples

### 1. Get All Orders Response
```json
{
  "success": true,
  "count": 2,
  "total": 4,
  "page": 1,
  "pages": 2,
  "data": [
    {
      "_id": "674cf123456789abcdef001",
      "order_number": "ORD-20241220-001",
      "customer_id": {
        "_id": "674cf456789abcdef001",
        "account_id": "customer1@email.com"
      },
      "status": "confirmed",
      "total_amount": 2500000,
      "payment_id": "674cf789abcdef001",
      "tracking_number": "TRACK123456789",
      "createdAt": "2024-12-20T10:00:00.000Z",
      "updatedAt": "2024-12-20T11:00:00.000Z"
    }
  ]
}
```

### 2. Get Order By ID Response
```json
{
  "success": true,
  "data": {
    "_id": "674cf123456789abcdef001",
    "order_number": "ORD-20241220-001",
    "customer_id": {
      "_id": "674cf456789abcdef001",
      "account_id": "customer1@email.com",
      "email": "customer1@email.com"
    },
    "status": "confirmed",
    "total_amount": 2500000,
    "order_items": [
      {
        "_id": "674cf111111111111111111",
        "product_id": "674cf222222222222222222",
        "quantity": 2,
        "unit_price": 500000,
        "status": "pending"
      }
    ],
    "delivery": {
      "_id": "674cf333333333333333333",
      "staff_id": "674cf444444444444444444",
      "status": "assigned",
      "tracking_number": "TRACK123456789"
    }
  }
}
```

### 3. Order Statistics Response
```json
{
  "success": true,
  "data": {
    "total": 4,
    "totalRevenue": 10000000,
    "averageOrderValue": 2500000,
    "byStatus": [
      { "_id": "confirmed", count: 2 },
      { "_id": "delivered", count: 2 }
    ]
  }
}
```

### 4. Create Order Response
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "674cf999999999999999999",
    "order_number": "ORD-20241220-005",
    "customer_id": "674cf456789abcdef001",
    "cart_id": "674cf777777777777777777",
    "status": "pending",
    "total_amount": 3000000,
    "order_items": [
      {
        "_id": "674cf111111111111111111",
        "product_id": "674cf222222222222222222",
        "quantity": 3,
        "unit_price": 1000000,
        "status": "pending"
      }
    ],
    "createdAt": "2024-12-20T10:30:00.000Z"
  }
}
```

### 5. Error Response - Order Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### 6. Error Response - Invalid Status Update
```json
{
  "success": false,
  "message": "Cannot cancel delivered order"
}
```

---

## DeliveryOrder API Response Examples

### 1. Get All Delivery Orders Response
```json
{
  "success": true,
  "count": 2,
  "total": 3,
  "page": 1,
  "pages": 2,
  "data": [
    {
      "_id": "674cf333333333333333333",
      "order_id": {
        "_id": "674cf123456789abcdef001",
        "order_number": "ORD-20241220-001"
      },
      "staff_id": {
        "_id": "674cf444444444444444444",
        "position": "Delivery Staff"
      },
      "status": "in_transit",
      "tracking_number": "TRACK123456789",
      "delivery_date": "2024-12-20",
      "createdAt": "2024-12-20T09:00:00.000Z"
    }
  ]
}
```

### 2. Get Delivery by Staff Response
```json
{
  "success": true,
  "staff": {
    "id": "674cf444444444444444444",
    "position": "Delivery Staff"
  },
  "count": 2,
  "total": 5,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "674cf333333333333333333",
      "order_id": "674cf123456789abcdef001",
      "staff_id": "674cf444444444444444444",
      "status": "assigned",
      "tracking_number": "TRACK123456789",
      "order_date": "2024-12-20T09:00:00.000Z"
    }
  ]
}
```

### 3. Create Delivery Order Response
```json
{
  "success": true,
  "message": "Delivery order created successfully",
  "data": {
    "_id": "674cf333333333333333333",
    "order_id": "674cf123456789abcdef001",
    "staff_id": "674cf444444444444444444",
    "tracking_number": "TRACK-1734753458123",
    "status": "assigned",
    "notes": "Fragile items - handle with care",
    "createdAt": "2024-12-20T10:00:00.000Z"
  }
}
```

### 4. Delivery Statistics Response
```json
{
  "success": true,
  "data": {
    "totalDeliveries": 12,
    "byStatus": [
      { "_id": "delivered", count: 8 },
      { "_id": "in_transit", count: 2 },
      { "_id": "assigned", count: 2 }
    ],
    "byStaff": [
      {
        "_id": "674cf444444444444444444",
        "count": 5,
        "staffInfo": { "position": "Delivery Staff" }
      }
    ]
  }
}
```

### 5. Update Delivery Status Response
```json
{
  "success": true,
  "message": "Delivery order updated successfully",
  "data": {
    "_id": "674cf333333333333333333",
    "status": "delivered",
    "delivery_date": "2024-12-20",
    "notes": "Delivered successfully - customer satisfied",
    "updatedAt": "2024-12-20T15:30:00.000Z"
  }
}
```

---

## Cart API Response Examples

### 1. Get Customer Cart Response
```json
{
  "success": true,
  "data": {
    "_id": "674cf777777777777777777",
    "customer_id": "674cf456789abcdef001",
    "status": "active",
    "subtotal": 3000000,
    "discounts": 300000,
    "total": 2700000,
    "cartItems": [
      {
        "_id": "674cf888888888888888888",
        "product_id": {
          "_id": "674cf222222222222222222",
          "name": "Product Name",
          "category": "Beverages",
          "retail_price": 1000000
        },
        "quantity": 3,
        "unit_price": 1000000,
        "line_total": 3000000,
        "status": "active"
      }
    ],
    "createdAt": "2024-12-20T08:00:00.000Z",
    "updatedAt": "2024-12-20T10:00:00.000Z"
  }
}
```

### 2. Add Item to Cart Response
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "_id": "674cf777777777777777777",
    "customer_id": "674cf456789abcdef001",
    "status": "active",
    "subtotal": 2000000,
    "discounts": 0,
    "total": 2000000,
    "cartItems": [
      {
        "_id": "674cf888888888888888888",
        "product_id": "674cf222222222222222222",
        "quantity": 2,
        "unit_price": 1000000,
        "line_total": 2000000,
        "status": "active"
      }
    ]
  }
}
```

### 3. Update Item Quantity Response
```json
{
  "success": true,
  "message": "Item quantity updated",
  "data": {
    "_id": "674cf777777777777777777",
    "customer_id": "674cf456789abcdef001",
    "status": "active",
    "subtotal": 5000000,
    "discounts": 0,
    "total": 5000000,
    "cartItems": [
      {
        "_id": "674cf888888888888888888",
        "quantity": 5,
        "unit_price": 1000000,
        "line_total": 5000000,
        "status": "active"
      }
    ]
  }
}
```

### 4. Apply Promo Code Response
```json
{
  "success": true,
  "message": "Promo code applied",
  "data": {
    "_id": "674cf777777777777777777",
    "customer_id": "674cf456789abcdef001",
    "status": "active",
    "subtotal": 2000000,
    "discounts": 200000,
    "total": 1800000,
    "applied_promo_id": "674cfaaaaaaaaaaaaaaaaa"
  }
}
```

### 5. Cart Statistics Response
```json
{
  "success": true,
  "data": {
    "totalCarts": 8,
    "activeCarts": 5,
    "abandonedCarts": 2,
    "checkedOutCarts": 1,
    "avgCartValue": 1750000
  }
}
```

### 6. Checkout Cart Response
```json
{
  "success": true,
  "message": "Cart checked out successfully",
  "data": {
    "_id": "674cf777777777777777777",
    "customer_id": "674cf456789abcdef001",
    "status": "checked_out",
    "subtotal": 2000000,
    "discounts": 200000,
    "total": 1800000,
    "cartItems": [
      {
        "_id": "674cf888888888888888888",
        "quantity": 2,
        "unit_price": 1000000,
        "status": "purchased"
      }
    ],
    "updatedAt": "2024-12-20T11:00:00.000Z"
  }
}
```

### 7. Error Response - Empty Cart Checkout
```json
{
  "success": false,
  "message": "Cart is empty"
}
```

---

## Common Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Please provide product ID and quantity"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Error creating order",
  "error": "TypeError: Cannot read property '_id' of undefined"
}
```

---

## Status Codes Reference

| Code | Meaning | Examples |
|------|---------|----------|
| 200 | OK | GET successful, UPDATE successful |
| 201 | Created | POST successful, new resource created |
| 400 | Bad Request | Missing required fields, invalid data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error, unhandled exception |

---

## Order Status Workflow

```
pending → confirmed → shipped → delivered
           ↓ (cancel only from pending)
        cancelled
```

## Delivery Status Workflow

```
assigned → in_transit → delivered
                    ↓
                  failed (can reassign after)
```

## Cart Status Workflow

```
active → checked_out
   ↓
abandoned (inactive for X days)
   ↓
expired
```

---

## Sample Test Data (from seed)

### Customers (4 total)
- `customer1` / `password123`
- `customer2` / `password123`
- `customer3` / `password123`
- `customer4` / `password123`

### Products (12 total)
Available products: Coffee, Tea, Milk, Yogurt, Juice, Soda, Bread, Butter, Cheese, Eggs, Pasta, Rice

### Staff (5 total)
- Admin (access_level: admin)
- Manager (access_level: manager)
- Supervisor (access_level: supervisor)
- Sales Associates (access_level: staff)
- Delivery Staff

---

**For actual IDs, use the REST Client to GET the resources first!**
