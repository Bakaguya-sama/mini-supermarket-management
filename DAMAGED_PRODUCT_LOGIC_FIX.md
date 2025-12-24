# DAMAGED PRODUCT LOGIC - FIXED ✅

## 📋 Tổng Quan
Đã sửa hoàn chỉnh logic thêm và xóa damaged product với inventory synchronization chính xác.

## 🔧 Các Thay Đổi Chi Tiết

### 1. **Model Update** - `server/models/index.js`

#### ✅ Thêm `shelf_id` vào DamagedProduct Schema
```javascript
const damagedProductSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  shelf_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shelf", required: false }, // ✨ NEW
  product_name: { type: String },
  damaged_quantity: { type: Number, default: 0 },
  unit: { type: String },
  status: { type: String, enum: [...], default: "reported" },
  inventory_adjusted: { type: Boolean, default: false },
  // ... other fields
});

// ✨ NEW INDEX
damagedProductSchema.index({ shelf_id: 1 });
```

**Lý do:**
- UI hiển thị damaged products theo shelf location (A1, D2, C1, ...)
- Cần track sản phẩm hư từ kệ nào để deduct đúng shelf

---

### 2. **Create Logic** - `server/controllers/damagedProductController.js`

#### ✅ Sửa `createDamagedProduct` - Deduct từ Shelf khi Report

**TRƯỚC ĐÂY (❌ SAI):**
```javascript
// Chỉ tạo record, KHÔNG deduct từ shelf
const damagedProduct = await DamagedProduct.create({
  product_id,
  damaged_quantity,
  inventory_adjusted: false, // ❌ Không adjust ngay
});
// ❌ Shelf quantity không thay đổi
```

**BÂY GIỜ (✅ ĐÚNG):**
```javascript
exports.createDamagedProduct = async (req, res) => {
  const { product_id, shelf_id, damaged_quantity, ... } = req.body;

  // 1. Validate product exists
  const product = await Product.findById(product_id);
  if (!product) return res.status(404).json({...});

  // 2. Nếu có shelf_id, deduct từ shelf
  if (shelf_id) {
    const productShelf = await ProductShelf.findOne({
      product_id,
      shelf_id,
      isDelete: false
    });

    // Check enough quantity
    if (productShelf.quantity < damaged_quantity) {
      return res.status(400).json({
        message: `Not enough quantity on shelf. Available: ${productShelf.quantity}`
      });
    }

    // ✅ DEDUCT FROM PRODUCT SHELF
    productShelf.quantity -= damaged_quantity;
    await productShelf.save();

    // ✅ DEDUCT FROM SHELF CURRENT_QUANTITY
    const shelf = await Shelf.findById(shelf_id);
    shelf.current_quantity = Math.max(0, shelf.current_quantity - damaged_quantity);
    await shelf.save();

    // ✅ Soft delete ProductShelf if quantity = 0
    if (productShelf.quantity === 0) {
      productShelf.isDelete = true;
      await productShelf.save();
    }
  }

  // 3. Create damaged product record
  const damagedProduct = await DamagedProduct.create({
    product_id,
    shelf_id: shelf_id || null,
    damaged_quantity,
    inventory_adjusted: false, // Chưa deduct từ warehouse
    ...
  });

  res.status(201).json({ success: true, data: damagedProduct });
};
```

**Điểm Quan Trọng:**
- ✅ Deduct từ `ProductShelf.quantity` ngay khi ghi nhận hàng hư
- ✅ Deduct từ `Shelf.current_quantity` để cập nhật capacity
- ✅ Soft delete ProductShelf nếu quantity = 0
- ✅ `inventory_adjusted = false` vì chưa deduct từ warehouse (product.current_stock)

---

### 3. **Delete Logic** - `server/controllers/damagedProductController.js`

#### ✅ Sửa `deleteDamagedProduct` - Restore Quantity về Shelf

**TRƯỚC ĐÂY (❌ SAI):**
```javascript
// Chỉ soft delete, KHÔNG restore về shelf
damagedProduct.isDelete = true;
await damagedProduct.save();
// ❌ Shelf quantity không restore
```

**BÂY GIỜ (✅ ĐÚNG):**
```javascript
exports.deleteDamagedProduct = async (req, res) => {
  const damagedProduct = await DamagedProduct.findById(req.params.id);

  // ✅ Nếu CHƯA inventory_adjusted và có shelf_id, RESTORE về shelf
  if (!damagedProduct.inventory_adjusted && damagedProduct.shelf_id) {
    const { product_id, shelf_id, damaged_quantity } = damagedProduct;

    // Tìm hoặc tạo lại ProductShelf mapping
    let productShelf = await ProductShelf.findOne({
      product_id,
      shelf_id,
      isDelete: false
    });

    if (!productShelf) {
      // ✅ Restore ProductShelf nếu đã bị soft delete
      productShelf = await ProductShelf.findOneAndUpdate(
        { product_id, shelf_id },
        { quantity: damaged_quantity, isDelete: false },
        { upsert: true, new: true }
      );
    } else {
      // ✅ Cộng lại quantity
      productShelf.quantity += damaged_quantity;
      await productShelf.save();
    }

    // ✅ RESTORE SHELF CURRENT_QUANTITY
    const shelf = await Shelf.findById(shelf_id);
    if (shelf) {
      shelf.current_quantity += damaged_quantity;
      await shelf.save();
    }
  }

  // Soft delete damaged product record
  damagedProduct.isDelete = true;
  await damagedProduct.save();

  res.status(200).json({
    message: damagedProduct.inventory_adjusted
      ? 'Damaged product deleted (inventory was already adjusted)'
      : 'Damaged product deleted and quantity restored to shelf'
  });
};
```

**Logic Decision Tree:**
```
Khi delete damaged product:
├─ Nếu inventory_adjusted = TRUE (đã deduct từ warehouse)
│  └─ ❌ KHÔNG restore (vì hàng đã bị trừ khỏi kho hẳn)
│
└─ Nếu inventory_adjusted = FALSE (chưa deduct từ warehouse)
   ├─ Nếu có shelf_id
   │  └─ ✅ RESTORE về ProductShelf + Shelf
   └─ Nếu không có shelf_id
      └─ ❌ Không có gì để restore
```

---

### 4. **Adjust Inventory Endpoint** - `adjustInventoryForDamaged`

#### ✅ Clarify Purpose

**Mục đích endpoint này:**
- Deduct từ **warehouse** (product.current_stock)
- **KHÔNG** deduct từ shelf (vì đã deduct ở `createDamagedProduct` rồi)
- Dùng khi quyết định loại bỏ hàng hư khỏi kho hẳn

```javascript
// @desc    Adjust warehouse inventory for damaged product
// @route   PUT /api/damaged-products/:id/adjust-inventory
// @note    Shelf quantity was already deducted during create
exports.adjustInventoryForDamaged = async (req, res) => {
  const damagedProduct = await DamagedProduct.findById(req.params.id);

  if (damagedProduct.inventory_adjusted) {
    return res.status(400).json({
      message: 'Inventory already adjusted for this damaged product'
    });
  }

  // ✅ DEDUCT FROM WAREHOUSE (product.current_stock)
  const product = await Product.findById(damagedProduct.product_id);
  product.current_stock = Math.max(0, product.current_stock - damagedProduct.damaged_quantity);
  await product.save();

  // Mark as adjusted
  damagedProduct.inventory_adjusted = true;
  damagedProduct.status = 'resolved';
  await damagedProduct.save();

  res.status(200).json({
    message: 'Warehouse inventory adjusted (shelf was already deducted)',
    ...
  });
};
```

---

### 5. **New Endpoint** - `getProductsForDamagedRecord`

#### ✅ Tạo Endpoint Mới cho UI

**File:** `server/controllers/productShelfController.js`

```javascript
// @desc    Get products on shelves for damaged product recording
// @route   GET /api/product-shelves/for-damaged-record
exports.getProductsForDamagedRecord = async (req, res) => {
  const { page = 1, limit = 100, supplier_id, shelf_id, section, search } = req.query;

  // Get all ProductShelf with quantity > 0
  let productShelves = await ProductShelf.find({
    isDelete: false,
    quantity: { $gt: 0 }
  })
    .populate({
      path: "product_id",
      select: "name category unit supplier_id",
      populate: {
        path: "supplier_id",
        select: "name"
      }
    })
    .populate({
      path: "shelf_id",
      select: "shelf_number section_number slot_number"
    });

  // Transform to UI format
  const formattedData = productShelves.map((ps) => ({
    productShelf_id: ps._id,
    product_id: ps.product_id._id,
    product_name: ps.product_id.name,
    category: ps.product_id.category,
    supplier_id: ps.product_id.supplier_id._id,
    supplier_name: ps.product_id.supplier_id.name,
    shelf_id: ps.shelf_id._id,
    shelf_location: ps.shelf_id.shelf_number, // A1, A2, B1, ...
    section: ps.shelf_id.section_number,
    slot: ps.shelf_id.slot_number,
    available_quantity: ps.quantity
  }));

  res.status(200).json({
    success: true,
    data: formattedData
  });
};
```

**Route:** `server/routes/productShelfRoutes.js`
```javascript
router.get('/for-damaged-record', getProductsForDamagedRecord);
```

---

### 6. **Frontend Update** - `RecordDamagedProduct.jsx`

#### ✅ Load Real Data thay vì Fake Data

**TRƯỚC ĐÂY (❌ SAI):**
```javascript
// Hardcoded fake data
const productData = [
  {
    id: "P001",
    name: "Coca Cola 330ml",
    shelfLocation: "A1",
    availableQty: 45,
  },
  // ... more fake data
];
```

**BÂY GIỜ (✅ ĐÚNG):**
```javascript
import { getProductsForDamagedRecord } from "../../../services/productShelfService";
import { createDamagedProduct } from "../../../services/damagedProductService";

const [productData, setProductData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  setLoading(true);
  const response = await getProductsForDamagedRecord({ limit: 100 });
  
  if (response.success) {
    const transformedData = response.data.map((item) => ({
      id: item.productShelf_id,
      product_id: item.product_id,
      shelf_id: item.shelf_id,
      name: item.product_name,
      shelfLocation: item.shelf_location,
      availableQty: item.available_quantity,
      // ... other fields
    }));
    setProductData(transformedData);
  }
  setLoading(false);
};
```

#### ✅ Call API khi Save

**TRƯỚC ĐÂY (❌ SAI):**
```javascript
const handleSaveRecords = () => {
  console.log("Saving damaged product records:", recordsToSave); // ❌ Chỉ log
  setSuccessMessage("Saved successfully!"); // ❌ Không call API
};
```

**BÂY GIỜ (✅ ĐÚNG):**
```javascript
const handleSaveRecords = async () => {
  setLoading(true);

  const recordsToSave = Array.from(selectedProducts).map((productId) => {
    const product = productData.find((p) => p.id === productId);
    return {
      product_id: product.product_id,
      shelf_id: product.shelf_id, // ✅ Include shelf_id
      damaged_quantity: damagedQuantities[productId],
      status: 'reported',
      description: damagedReasons[productId],
      notes: `Damaged from shelf ${product.shelfLocation}`
    };
  });

  // ✅ Call API for each record
  const results = await Promise.allSettled(
    recordsToSave.map((record) => createDamagedProduct(record))
  );

  const successCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  setSuccessMessage(`Successfully saved ${successCount} records!`);

  // ✅ Reload products to get updated quantities
  await loadProducts();
  
  setLoading(false);
};
```

---

### 7. **Service Update** - `productShelfService.js`

#### ✅ Thêm Function Mới

```javascript
export const getProductsForDamagedRecord = async (params = {}) => {
  try {
    const response = await apiClient.get("/product-shelves/for-damaged-record", { params });
    return {
      success: true,
      data: response.data || [],
      ...
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch products'
    };
  }
};

export const productShelfService = {
  // ... existing functions
  getProductsForDamagedRecord, // ✅ NEW
};
```

---

## 🎯 Business Logic Flow

### **Workflow 1: Ghi Nhận Hàng Hư (Record Damaged Product)**

```
1. User vào RecordDamagedProduct page
   ↓
2. Load products from API: GET /api/product-shelves/for-damaged-record
   ↓
3. User select products và nhập damaged quantity
   ↓
4. Click Save → Call API: POST /api/damaged-products
   {
     product_id: "...",
     shelf_id: "...",     ← ✨ Quan trọng
     damaged_quantity: 5,
     description: "Expired"
   }
   ↓
5. Backend xử lý (createDamagedProduct):
   ├─ Check ProductShelf.quantity >= damaged_quantity
   ├─ ProductShelf.quantity -= 5           ← ✅ Deduct from shelf
   ├─ Shelf.current_quantity -= 5          ← ✅ Update shelf capacity
   ├─ Create DamagedProduct record (inventory_adjusted = false)
   └─ Return success
   ↓
6. Frontend reload products → Shelf quantity đã giảm
```

---

### **Workflow 2: Xóa Record Hàng Hư (Undo)**

```
1. User vào DamagedProductList, click Delete
   ↓
2. Call API: DELETE /api/damaged-products/:id
   ↓
3. Backend check:
   ├─ inventory_adjusted === false?  ← ✅ Chưa deduct từ warehouse
   │  └─ ✅ RESTORE:
   │     ├─ ProductShelf.quantity += damaged_quantity
   │     ├─ Shelf.current_quantity += damaged_quantity
   │     └─ Set DamagedProduct.isDelete = true
   │
   └─ inventory_adjusted === true?   ← ❌ Đã deduct từ warehouse
      └─ ❌ KHÔNG RESTORE (vì hàng đã loại bỏ khỏi kho)
         └─ Set DamagedProduct.isDelete = true
```

---

### **Workflow 3: Adjust Warehouse Inventory**

```
1. User vào DamagedProduct details, click "Adjust Inventory"
   ↓
2. Call API: PUT /api/damaged-products/:id/adjust-inventory
   ↓
3. Backend xử lý:
   ├─ Check inventory_adjusted === false
   ├─ Product.current_stock -= damaged_quantity  ← ✅ Deduct from warehouse
   ├─ Set inventory_adjusted = true
   ├─ Set status = 'resolved'
   └─ Return success
   ↓
4. Từ giờ DELETE sẽ KHÔNG restore (vì inventory_adjusted = true)
```

---

## 📊 Inventory Synchronization Matrix

| **Action**                | **ProductShelf** | **Shelf.current_quantity** | **Product.current_stock** | **inventory_adjusted** |
|---------------------------|:----------------:|:--------------------------:|:-------------------------:|:---------------------:|
| Create Damaged (có shelf) | ✅ -= quantity   | ✅ -= quantity             | ❌ No change              | false                 |
| Create Damaged (no shelf) | ❌ No change     | ❌ No change               | ❌ No change              | false                 |
| Delete (adjusted=false)   | ✅ += quantity   | ✅ += quantity             | ❌ No change              | -                     |
| Delete (adjusted=true)    | ❌ No restore    | ❌ No restore              | ❌ No restore             | -                     |
| Adjust Inventory          | ❌ No change     | ❌ No change               | ✅ -= quantity            | true                  |

---

## ✅ Các Vấn Đề Đã Fix

### 1. ❌ **TRƯỚC:** Ghi nhận hàng hư nhưng shelf quantity không giảm
   ✅ **SAU:** Shelf quantity tự động giảm khi tạo damaged product record

### 2. ❌ **TRƯỚC:** Xóa damaged record nhưng không restore về shelf
   ✅ **SAU:** Restore về shelf nếu chưa adjust inventory

### 3. ❌ **TRƯỚC:** Không biết hàng hư từ kệ nào
   ✅ **SAU:** Track shelf_id trong DamagedProduct

### 4. ❌ **TRƯỚC:** UI dùng fake data
   ✅ **SAU:** Load real data từ API

### 5. ❌ **TRƯỚC:** handleSaveRecords chỉ console.log
   ✅ **SAU:** Call API createDamagedProduct

---

## 🧪 Test Cases

### Test 1: Create Damaged Product
```javascript
// Setup: Shelf A1 có Coca Cola, quantity = 50
POST /api/damaged-products
{
  product_id: "...",
  shelf_id: "...",
  damaged_quantity: 5,
  description: "Expired"
}

// Expected:
// ✅ ProductShelf.quantity: 50 → 45
// ✅ Shelf.current_quantity: 50 → 45
// ✅ DamagedProduct created with inventory_adjusted = false
// ✅ Product.current_stock: NO CHANGE
```

### Test 2: Delete Damaged Product (Not Adjusted)
```javascript
// Setup: Có damaged record với inventory_adjusted = false
DELETE /api/damaged-products/:id

// Expected:
// ✅ ProductShelf.quantity: 45 → 50 (restored)
// ✅ Shelf.current_quantity: 45 → 50 (restored)
// ✅ DamagedProduct.isDelete = true
```

### Test 3: Delete Damaged Product (Already Adjusted)
```javascript
// Setup: Có damaged record với inventory_adjusted = true
DELETE /api/damaged-products/:id

// Expected:
// ❌ NO RESTORE to ProductShelf (vì đã adjust warehouse)
// ❌ NO RESTORE to Shelf
// ✅ DamagedProduct.isDelete = true
```

### Test 4: Adjust Inventory
```javascript
// Setup: Product.current_stock = 100, damaged_quantity = 5
PUT /api/damaged-products/:id/adjust-inventory

// Expected:
// ✅ Product.current_stock: 100 → 95
// ✅ inventory_adjusted: false → true
// ✅ status: reported → resolved
```

---

## 📝 Notes

### Quan Trọng:
1. **LUÔN truyền `shelf_id`** khi gọi `createDamagedProduct` từ RecordDamagedProduct UI
2. **Delete CHỈ restore nếu `inventory_adjusted = false`**
3. **`adjustInventoryForDamaged` CHỈ deduct từ warehouse**, không deduct từ shelf

### Không Làm:
- ❌ Deduct từ shelf 2 lần (create đã deduct rồi)
- ❌ Restore về shelf khi đã adjust inventory
- ❌ Quên check `inventory_adjusted` flag

---

## 🎉 Summary

✅ **Model:** Thêm `shelf_id` vào DamagedProduct  
✅ **Create:** Deduct từ ProductShelf + Shelf khi report  
✅ **Delete:** Restore về shelf nếu chưa adjust  
✅ **Adjust:** Deduct từ warehouse (product.current_stock)  
✅ **API:** Endpoint `/product-shelves/for-damaged-record`  
✅ **UI:** Load real data, call API khi save  
✅ **Service:** Thêm `getProductsForDamagedRecord`

**Logic hoàn toàn hợp lý và đồng bộ inventory chính xác! 🎯**
