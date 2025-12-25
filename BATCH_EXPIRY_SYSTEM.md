# Batch & Expiry Date System Implementation

## Tổng quan (Overview)

Hệ thống quản lý batch và ngày hết hạn cho sản phẩm đã được triển khai để theo dõi các lô hàng khác nhau với ngày hết hạn riêng biệt. System sử dụng **FIFO (First Expire First Out)** logic khi xuất hàng.

## Database Changes

### Product Model (`server/models/index.js`)

Đã thêm trường `batches` array vào Product schema:

```javascript
batches: [
  {
    expiry_date: { type: Date, required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    received_date: { type: Date, default: Date.now },
    batch_number: { type: String }, // Optional supplier batch reference
    notes: { type: String },
  },
]
```

**Lưu ý:**
- `expiry_date` (main field) vẫn được giữ lại để backward compatibility, đại diện cho ngày hết hạn sớm nhất
- Mỗi batch ghi lại: expiry_date, quantity, received_date, batch_number, notes
- Index đã được thêm: `productSchema.index({ "batches.expiry_date": 1 })`

### Seed Data

File `server/scripts/seed.js` đã được cập nhật để khởi tạo products với batches sample data. Ví dụ:

```javascript
{
  name: "Gạo ST25 5kg",
  batches: [
    {
      expiry_date: addDays(365 * 2),
      quantity: 60,
      received_date: addDays(-10),
      batch_number: "BATCH-ST25-001",
    },
    {
      expiry_date: addDays(365 * 2 + 30),
      quantity: 40,
      received_date: addDays(-5),
      batch_number: "BATCH-ST25-002",
    },
  ],
}
```

## Backend API Changes

### ProductController (`server/controllers/productController.js`)

#### 1. Create Product
- Nhận `batches` array trong request body
- Validate mỗi batch phải có `expiry_date` và `quantity`
- Tự động tính `current_stock` từ tổng quantity của các batches
- Tự động set `expiry_date` (main field) = ngày hết hạn sớm nhất

#### 2. Update Product - Restock
- **Mới:** Field `addBatch` để thêm batch mới
- Tự động cập nhật `current_stock` và `expiry_date`
- **Legacy support:** Field `restockBatch` vẫn được hỗ trợ (tạo ProductBatch collection)

```javascript
// Request body example
{
  "addBatch": {
    "expiry_date": "2025-12-31",
    "quantity": 50,
    "batch_number": "BATCH-2024-001",
    "notes": "Fresh stock from supplier ABC"
  }
}
```

#### 3. Export Product (NEW)
**Endpoint:** `POST /api/products/:id/export`

Xuất hàng theo FIFO logic:
- Sort batches theo expiry_date (sớm nhất trước)
- Trừ quantity từ các batches theo thứ tự
- Xóa batches đã hết hàng
- Cập nhật `current_stock` và `expiry_date`

```javascript
// Request
POST /api/products/:id/export
{
  "quantity": 30,
  "reason": "Sold to customer"
}

// Response
{
  "success": true,
  "data": {
    "product": {...},
    "exported_quantity": 30,
    "exported_batches": [
      {
        "batch_number": "BATCH-001",
        "expiry_date": "2025-06-30",
        "quantity_exported": 20,
        "remaining_in_batch": 0
      },
      {
        "batch_number": "BATCH-002",
        "expiry_date": "2025-07-15",
        "quantity_exported": 10,
        "remaining_in_batch": 40
      }
    ]
  }
}
```

#### 4. Get Product Batches (NEW)
**Endpoint:** `GET /api/products/:id/batches`

Lấy danh sách batches đã sort theo expiry date:

```javascript
// Response
{
  "success": true,
  "data": {
    "product_name": "Gạo ST25",
    "current_stock": 100,
    "total_from_batches": 100,
    "earliest_expiry": "2025-06-30",
    "batches": [...],
    "batches_count": 2
  }
}
```

#### 5. Update/Delete Batch (NEW)
- `PATCH /api/products/:id/batches/:batchIndex` - Cập nhật batch cụ thể
- `DELETE /api/products/:id/batches/:batchIndex` - Xóa batch cụ thể

### Routes (`server/routes/productRoutes.js`)

Đã thêm các routes mới:

```javascript
router.post('/:id/export', productController.exportProduct);
router.get('/:id/batches', productController.getProductBatches);
router.patch('/:id/batches/:batchIndex', productController.updateBatch);
router.delete('/:id/batches/:batchIndex', productController.deleteBatch);
```

## Frontend Changes

### 1. Edit Product View (`client/src/views/manager/product-management/EditProductView.jsx`)

**Hiển thị Batch Information:**
- Batch section mới trong sidebar
- Hiển thị tổng số batches và total quantity
- List các batches sorted by expiry date
- Color coding:
  - 🟢 Normal: > 30 days to expiry
  - 🟡 Expiring Soon: ≤ 30 days
  - 🔴 Expired: ≤ 0 days
- Hiển thị batch_number, quantity, expiry_date, received_date, notes

**CSS Styling:**
- `.edit-product-batch-section`
- `.edit-product-batch-item` với modifiers `.expiring-soon`, `.expired`

### 2. Add/Restock Product View (`client/src/views/manager/product-management/AddProductView.jsx`)

**Restock Tab:**
- Cập nhật `handleRestockSubmit` để sử dụng `addBatch` thay vì `restockBatch`
- Tự động tạo batch_number nếu không có
- Default expiry date = 1 năm nếu không nhập

**Export Tab:**
- Cập nhật `handleExportSubmit` để gọi API mới `/api/products/:id/export`
- Hiển thị thông tin batches đã xuất
- Hiển thị số lượng còn lại sau khi xuất

### 3. Product Detail Page (Customer) (`client/src/views/customer/CustomerProductDetailPage.jsx`)

**Batches & Expiry Tab:**
- Tab mới để hiển thị batch information
- Chỉ hiện khi product có batches
- Grid layout để hiển thị batch cards
- Color coding tương tự như Edit view
- Thông tin FIFO policy

**CSS Styling:**
- `.batches-content`
- `.batch-card` với modifiers `.batch-expiring-soon`, `.batch-expired`
- Responsive grid layout

### 4. Product Service (`client/src/services/productService.js`)

Đã thêm functions mới:

```javascript
productService.exportProduct(productId, { quantity, reason })
productService.getBatches(productId)
```

## Workflow Examples

### A. Nhập hàng mới (Restock)

1. Manager vào **Add Product > Restock tab**
2. Chọn product cần nhập
3. Nhập:
   - Quantity: 50
   - Expiry Date: 2025-12-31
   - Batch Number (optional): BATCH-2024-001
   - Notes (optional)
4. Click "Restock"
5. Backend:
   - Thêm batch vào `product.batches` array
   - Cập nhật `current_stock += 50`
   - Cập nhật `expiry_date` = earliest expiry

### B. Xuất hàng (Export/Sell)

1. Manager vào **Add Product > Export tab**
2. Chọn product cần xuất
3. Nhập quantity: 30
4. Click "Export"
5. Backend FIFO logic:
   - Sort batches by expiry_date (earliest first)
   - Deduct từ batch sớm nhất:
     - Batch 1 (exp: 2025-06-30, qty: 20) → Xuất 20, còn 0 → Xóa
     - Batch 2 (exp: 2025-07-15, qty: 50) → Xuất 10, còn 40
   - Cập nhật `current_stock -= 30`
   - Cập nhật `expiry_date` = 2025-07-15 (batch còn lại sớm nhất)

### C. Xem batch information

**Manager:**
1. Vào Edit Product
2. Xem Batch Information section trong sidebar
3. Thấy list batches với expiry status

**Customer:**
1. Xem product detail
2. Click tab "Batches & Expiry"
3. Thấy list batches sorted by expiry date
4. Biết được sản phẩm được bán theo FIFO

## Testing Guide

### 1. Test Create Product với Batches

```bash
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Test Product",
  "unit": "kg",
  "price": 50000,
  "category": "Test",
  "supplier_id": "...",
  "batches": [
    {
      "expiry_date": "2025-12-31",
      "quantity": 30,
      "batch_number": "TEST-001"
    },
    {
      "expiry_date": "2026-01-31",
      "quantity": 20,
      "batch_number": "TEST-002"
    }
  ]
}
```

### 2. Test Restock (Add Batch)

```bash
PUT http://localhost:5000/api/products/:id
Content-Type: application/json

{
  "addBatch": {
    "expiry_date": "2026-02-28",
    "quantity": 50,
    "batch_number": "RESTOCK-001",
    "notes": "Fresh batch"
  }
}
```

### 3. Test Export FIFO

```bash
POST http://localhost:5000/api/products/:id/export
Content-Type: application/json

{
  "quantity": 25,
  "reason": "Sold to customer"
}
```

### 4. Test Get Batches

```bash
GET http://localhost:5000/api/products/:id/batches
```

## Migration Notes

- **Backward Compatibility:** ProductBatch collection vẫn được giữ lại
- Products cũ không có batches vẫn hoạt động bình thường
- Khi restock product cũ, system tự động tạo batch mới
- Main field `expiry_date` được sync với earliest batch expiry

## Best Practices

1. **Luôn nhập expiry_date khi restock**
2. **Sử dụng batch_number có ý nghĩa** (VD: YYYY-MM-LOT)
3. **Kiểm tra batches expiring soon** thường xuyên
4. **Export theo FIFO** để tránh hàng hết hạn
5. **Cập nhật notes** cho các batch đặc biệt

## Known Issues & Future Improvements

### Current Limitations:
- Batch không thể sửa expiry_date sau khi tạo (chỉ qua PATCH API)
- Không có auto-alert cho expiring batches
- Chưa có report về batch turnover

### Future Enhancements:
- Dashboard widget: Expiring Soon Batches
- Email/notification khi batch sắp hết hạn
- Batch history tracking
- Auto-suggest optimal restock quantity based on batch turnover
- Barcode scanning integration cho batch management

## Summary

Hệ thống batch & expiry date đã được triển khai hoàn chỉnh với:
- ✅ Database schema với batches array
- ✅ CRUD operations hỗ trợ batches
- ✅ FIFO export logic
- ✅ Frontend UI hiển thị batches ở 3 trang: Edit, Restock/Export, Customer Detail
- ✅ Seed data mẫu
- ✅ API endpoints đầy đủ
- ✅ Color coding cho expiry status
- ✅ Backward compatibility

Người dùng có thể:
1. Tạo product với multiple batches
2. Nhập hàng (restock) với expiry date
3. Xuất hàng theo FIFO logic
4. Xem batch information chi tiết
5. Quản lý batches individually (update/delete)
