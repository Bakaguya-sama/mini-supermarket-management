# Testing Guide - Add Products to Shelf

## ✅ Đã hoàn thành

### 1. Frontend Logic Fix
- Sửa cách tính `availableToShelve` (đã không còn trừ `shelfedQty`)
- `current_stock` = số lượng trong kho (chưa lên kệ)
- `totalQty` = `current_stock` + `shelfedQty`

### 2. Backend Logging
- Thêm logging chi tiết vào `bulkAssignToShelf` để debug
- Server sẽ log mọi bước: validation, stock check, capacity check, create/update mapping

### 3. Database Verification
Dữ liệu hiện tại:

**Products có stock:**
- Sữa Vinamilk 1L: ID `694d4e4335d6f07f7df6afdd`, stock: 160
- Coca Cola 330ml: ID `694d4e4335d6f07f7df6afde`, stock: 450
- Trứng gà: ID `694d4e4335d6f07f7df6afdf`, stock: 60
- Mì gói Hảo Hảo: ID `694d4e4335d6f07f7df6afe0`, stock: 265

**Shelves có chỗ trống:**
- Shelf A2: ID `694d4e4335d6f07f7df6afea`, capacity: 50, current: 30, **available: 20**
- Shelf A3: ID `694d4e4335d6f07f7df6afeb`, capacity: 50, current: 0, **available: 50**
- Shelf A4: ID `694d4e4335d6f07f7df6afec`, capacity: 50, current: 0, **available: 50**
- Shelf B3: ID `694d4e4335d6f07f7df6afef`, capacity: 50, current: 0, **available: 50**
- Shelf B4: ID `694d4e4335d6f07f7df6aff0`, capacity: 50, current: 0, **available: 50**

## 📋 Hướng dẫn Test

### Test Case 1: Add Product to Empty Shelf ✅

**Mục tiêu:** Thêm sản phẩm vào kệ trống

**Steps:**
1. Mở trang "Add Product on Shelves" (`http://localhost:5173/merchandise-supervisor/products-on-shelves/add`)
2. Ở bảng bên trái, tìm **"Sữa Vinamilk 1L"** (stock: 160)
3. Click checkbox để chọn sản phẩm
4. Nhập quantity: `10`
5. Ở bảng bên phải, chọn **Shelf A3** (available: 50)
6. Click "Add to Shelf"

**Expected Results:**
- ✅ Success message hiện lên
- ✅ Browser console log request/response
- ✅ Server terminal log chi tiết:
  ```
  === BULK ASSIGN REQUEST ===
  Shelf ID: 694d4e4335d6f07f7df6afeb
  Products: [{ product_id: "694d4e4335d6f07f7df6afdd", quantity: 10 }]
  ✅ Shelf found: A3 Capacity: 50 Current: 0
  ✅ Product found: Sữa Vinamilk 1L Stock: 160
  ✅ Stock check passed. Required: 10, Available: 160
  ✅ Capacity check passed. Required: 10, Available: 50
  ℹ️ Creating new mapping
  ✅ Created new mapping ID: ...
  ✅ Updated product stock: 160 → 150
  ✅ Updated shelf quantity: 0 → 10
  === Saving shelf with quantity: 10 ===
  ✅ Shelf saved successfully
  === RESULTS ===
  Success: 1
  Errors: 0
  Total assigned: 10
  ```
- ✅ Reload trang, kiểm tra:
  - Sữa Vinamilk stock giảm: 160 → 150
  - Shelf A3 current_quantity tăng: 0 → 10
  - Shelved/Total cho Sữa Vinamilk: 40+10/210 = 50/210

### Test Case 2: Add to Existing Mapping ✅

**Mục tiêu:** Thêm thêm số lượng vào kệ đã có sản phẩm

**Setup:** Gạo ST25 đã có 48 trên Shelf A1

**Steps:**
1. Chọn **"Gạo ST25 5kg"** (stock: 45)
2. Quantity: `2` (Shelf A1 available: 2)
3. Chọn **Shelf A1**
4. Click "Add to Shelf"

**Expected:**
- ✅ Existing mapping quantity tăng: 48 → 50
- ✅ Product stock giảm: 45 → 43
- ✅ Shelf A1 full: 50/50

### Test Case 3: Exceed Shelf Capacity ❌

**Mục tiêu:** Validate không cho vượt capacity

**Steps:**
1. Chọn Coca Cola (stock: 450)
2. Quantity: `30`
3. Chọn Shelf A2 (available: 20)
4. Click "Add to Shelf"

**Expected:**
- ❌ Frontend error: "Cannot add 30 items... Available space: 20 items"
- ❌ Request không gửi đến server

### Test Case 4: Exceed Product Stock ❌

**Steps:**
1. Chọn Trứng gà (stock: 60)
2. Quantity: `100`
3. Chọn Shelf B3 (available: 50)
4. Click "Add to Shelf"

**Expected:**
- ❌ Frontend limit max input to 60 (warehouse stock)
- Nếu somehow bypass, backend error: "Not enough stock. Available: 60"

### Test Case 5: Multiple Products ✅

**Steps:**
1. Chọn **Mì gói Hảo Hảo** (stock: 265), quantity: `15`
2. Chọn **Bánh mì Kinh Đô** (stock: 120), quantity: `10`
3. Chọn **Shelf B4** (available: 50)
4. Click "Add to Shelf"

**Expected:**
- ✅ 2 products assigned successfully
- ✅ Total 25 items added to Shelf B4
- ✅ Stocks giảm đúng:
  - Mì Hảo Hảo: 265 → 250
  - Bánh mì: 120 → 110

## 🔍 Debugging Checklist

Nếu không work, check:

### Frontend (Browser Console)
```javascript
=== FRONTEND: Sending bulk assign request ===
Request data: {
  "shelf_id": "...",
  "products": [...]
}
=== FRONTEND: Response received ===
Response: { success: true/false, ... }
```

### Backend (Server Terminal)
```
=== BULK ASSIGN REQUEST ===
Shelf ID: ...
Products: [...]
✅ Shelf found: ...
--- Processing Product: ..., Quantity: ... ---
✅ Product found: ...
✅ Stock check passed
✅ Capacity check passed
✅ Created new mapping / Updated mapping
✅ Updated product stock
✅ Updated shelf quantity
=== Saving shelf ===
✅ Shelf saved
=== RESULTS ===
Success: X
Errors: Y
```

### Database (After Operation)
```bash
cd server
node scripts/debug-db-state.js
```

Check:
- Product `current_stock` đã giảm?
- Shelf `current_quantity` đã tăng?
- ProductShelf mapping được tạo/update?

## 🐛 Common Issues

### Issue 1: "Product not found"
- **Cause:** Product ID không đúng
- **Fix:** Check database IDs vs frontend request

### Issue 2: "Shelf not found"
- **Cause:** Shelf ID không đúng
- **Fix:** Verify shelf selection sends correct ID

### Issue 3: Stock không giảm
- **Cause:** 
  - Backend không save product
  - Frontend không reload data
- **Fix:** 
  - Check backend logs for "Updated product stock"
  - Verify `loadInitialData()` được gọi sau success

### Issue 4: UI hiển thị sai số lượng
- **Cause:** Logic tính toán sai
- **Fix:** Đã fix ở `AddShelfProduct.jsx`:
  ```javascript
  // ✅ CORRECT
  warehouseStock = current_stock
  totalQty = warehouseStock + shelfedQty
  ```

## 📊 Expected Data Flow

```
USER: Add 10 x "Sữa Vinamilk" to Shelf A3
  ↓
FRONTEND:
  - Validate selections
  - Check shelf capacity (client-side)
  - Send POST /api/product-shelves/bulk/assign
  ↓
BACKEND:
  - Validate request
  - Find shelf (A3)
  - Loop products:
    - Find product (Sữa Vinamilk)
    - Check stock (160 >= 10 ✅)
    - Check capacity (50 >= 10 ✅)
    - Check existing mapping (none)
    - CREATE ProductShelf { product_id, shelf_id: A3, quantity: 10 }
    - UPDATE Product.current_stock: 160 - 10 = 150
    - UPDATE Shelf.current_quantity: 0 + 10 = 10
  - Save shelf
  - Return success
  ↓
FRONTEND:
  - Show success message
  - Reload data (loadInitialData)
  - Products table shows: stock 150 ✅
  - Shelves table shows: A3 current 10/50 ✅
```

## ✅ Verification

Sau khi test, verify:

1. **Database:**
   ```bash
   node scripts/debug-db-state.js
   ```

2. **API Direct Test:**
   - Open `server/tests/productShelf.test.http`
   - Replace IDs with real ones from database
   - Run bulk assign test

3. **UI:**
   - Product inventory table: stock giảm
   - Shelf table: current_quantity tăng
   - No console errors

## 🎯 Success Criteria

- [ ] Can select products with stock > 0
- [ ] Cannot select products with stock = 0
- [ ] Quantity input limited to warehouse stock
- [ ] Frontend validates shelf capacity before sending
- [ ] Backend logs all steps
- [ ] Product stock decreases correctly
- [ ] Shelf quantity increases correctly
- [ ] ProductShelf mapping created/updated
- [ ] UI refreshes and shows updated data
- [ ] No errors in console (frontend & backend)

---

**Last Updated:** 2025-12-25
**Testing Status:** Ready for manual testing
