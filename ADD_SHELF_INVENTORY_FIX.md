# Add Product to Shelf - Inventory Logic Fix

## 🐛 Problem Report

**User Issue:** "không dưa sản phẩm vào shelve dc mà sản phẩm khi đựa cx không có giảm đi trong inventory"

Translation: "Cannot add products to shelves and when adding, inventory doesn't decrease"

**Symptoms:**
1. Products appeared not to be added to shelves (but they were)
2. Inventory (warehouse stock) appeared not to decrease (but it did)
3. UI showed incorrect stock levels after adding products to shelves

## 🔍 Root Cause Analysis

### Misunderstanding of `current_stock` Field

The frontend code **misinterpreted** what `Product.current_stock` represents:

#### ❌ WRONG Interpretation (Before Fix)
Frontend assumed:
- `current_stock` = **Total product quantity** (warehouse + shelves combined)
- `availableToShelve` = `current_stock` - `shelfedQty`

This caused:
- When backend decreased `current_stock`, frontend thought total inventory decreased
- Double-subtraction: Backend subtracted from warehouse, frontend subtracted again
- Products appeared to "disappear" from the system

#### ✅ CORRECT Interpretation (After Fix)
The actual meaning:
- `current_stock` = **Warehouse stock only** (not yet on shelves)
- `shelfedQty` = Sum of quantities on all shelves (from ProductShelf mappings)
- `totalQty` = `current_stock` + `shelfedQty` (total owned inventory)
- `availableToShelve` = `current_stock` (what's in warehouse ready to shelve)

### Concrete Example

**Scenario:** Add 30 units of "Coca Cola" to Shelf A1

**Initial State:**
```
Product.current_stock = 100 (warehouse)
ProductShelf mappings = [] (nothing on shelves)
```

**After Adding 30 to Shelf:**

Backend correctly does:
```javascript
// Create mapping
ProductShelf.create({ product_id, shelf_id: "A1", quantity: 30 })

// Decrease warehouse stock
product.current_stock = 100 - 30 = 70  ✅
await product.save()

// Increase shelf quantity
shelf.current_quantity = 0 + 30 = 30  ✅
await shelf.save()
```

Frontend **BEFORE FIX** (wrong):
```javascript
// After reload:
totalQty = current_stock = 70  // Backend already decreased!
shelfedQty = 30  // From ProductShelf mapping
availableToShelve = totalQty - shelfedQty = 70 - 30 = 40  ❌

// UI shows:
// - Total: 70 (should be 100!)
// - Available: 40 (should be 70!)
// - 30 units "disappeared"!
```

Frontend **AFTER FIX** (correct):
```javascript
// After reload:
warehouseStock = current_stock = 70  ✅
shelfedQty = 30  ✅
totalQty = warehouseStock + shelfedQty = 70 + 30 = 100  ✅
availableToShelve = warehouseStock = 70  ✅

// UI shows:
// - Warehouse: 70 ✅
// - On Shelves: 30/100 ✅
// - Total: 100 ✅
// - All inventory accounted for!
```

## 📝 Code Changes

### File: `/client/src/views/merchandise-supervisor/products-on-shelves/AddShelfProduct.jsx`

#### Change 1: Inventory Data Transformation (Lines ~100-125)

**Before:**
```javascript
// ❌ WRONG: Treating current_stock as total quantity
const totalQty = product.current_stock ?? product.stock_quantity ?? 0;
const availableToShelve = totalQty - shelfedQty;

return {
  stock: totalQty,  // Wrong: Shows warehouse stock as total
  totalQty: totalQty,  // Wrong: Doesn't include shelved items
};
```

**After:**
```javascript
// ✅ CORRECT: current_stock is warehouse only
const warehouseStock = product.current_stock ?? product.stock_quantity ?? 0;
const availableToShelve = warehouseStock;  // No subtraction needed!
const totalQty = warehouseStock + shelfedQty;  // Add warehouse + shelves

return {
  stock: warehouseStock,  // Correct: Warehouse stock available to shelve
  totalQty: totalQty,  // Correct: Total = warehouse + shelves
};
```

#### Change 2: Selection Handler (Lines ~229-252)

**Before:**
```javascript
// ❌ Prevents selection if shelfed >= total (wrong logic)
const isFullyShelved = product.shelfedQty >= product.totalQty;
if (isFullyShelved) return;

const availableQty = product.totalQty - product.shelfedQty;
newQuantities[productId] = Math.min(1, availableQty);
```

**After:**
```javascript
// ✅ Prevents selection only if no warehouse stock
const warehouseStock = product.stock;
if (warehouseStock <= 0) return;  // Correct check

newQuantities[productId] = Math.min(1, warehouseStock);  // Use warehouse stock
```

#### Change 3: Quantity Change Handler (Lines ~254-263)

**Before:**
```javascript
// ❌ Limits quantity based on wrong calculation
const availableQty = product.totalQty - product.shelfedQty;
const validQuantity = Math.max(1, Math.min(quantity, availableQty));
```

**After:**
```javascript
// ✅ Limits quantity based on warehouse stock
const warehouseStock = product.stock;
const validQuantity = Math.max(1, Math.min(quantity, warehouseStock));
```

#### Change 4: Table Rendering (Lines ~580-635)

**Before:**
```javascript
// ❌ Wrong disable condition and labels
const isFullyShelved = product.shelfedQty >= product.totalQty;

<input disabled={isFullyShelved} max={product.totalQty - product.shelfedQty} />
{isFullyShelved && <span>Fully Shelved</span>}
```

**After:**
```javascript
// ✅ Correct disable condition and labels
const hasNoStock = product.stock <= 0;

<input disabled={hasNoStock} max={product.stock} />
{hasNoStock && <span>No Stock</span>}
```

## 🔄 Data Flow (After Fix)

### 1. User Adds Product to Shelf

```
USER: Select "Coca Cola", quantity 30, Shelf A1
  ↓
FRONTEND: POST /api/product-shelves/bulk/assign
{
  shelf_id: "A1",
  products: [{ product_id: "xyz", quantity: 30 }]
}
```

### 2. Backend Processing

```javascript
// productShelfController.bulkAssignToShelf
const product = await Product.findById("xyz");
// product.current_stock = 100

// Validation
if (product.current_stock < 30) {  // 100 >= 30 ✅
  return error;
}

// Create mapping
await ProductShelf.create({
  product_id: "xyz",
  shelf_id: "A1",
  quantity: 30
});

// Update warehouse stock
product.current_stock = 100 - 30;  // = 70
await product.save();  ✅

// Update shelf quantity
shelf.current_quantity = 0 + 30;  // = 30
await shelf.save();  ✅
```

### 3. Frontend Reload & Display

```javascript
// Fetch data
const products = await apiClient.get("/products");
// Product: { _id: "xyz", current_stock: 70, ... }

const mappings = await productShelfService.getAllProductShelves();
// ProductShelf: [{ product_id: "xyz", quantity: 30, ... }]

// Transform data
const shelfedQty = mappings
  .filter(m => m.product_id === "xyz")
  .reduce((sum, m) => sum + m.quantity, 0);
// shelfedQty = 30

const warehouseStock = 70;  // from product.current_stock
const totalQty = warehouseStock + shelfedQty;  // 70 + 30 = 100 ✅

// Display in UI
return {
  stock: 70,  // Warehouse (available to shelve)
  shelfedQty: 30,  // On shelves
  totalQty: 100,  // Total owned
  onShelfStatus: "In Stock"  // Based on warehouse stock
};
```

## ✅ Verification Results

### Before Fix:
```
Initial: Product has 100 units
Add 30 to Shelf A1

UI Shows:
- Warehouse Stock: 70 (but displayed as "Total")
- On Shelf: 30
- "Available to Shelve": 40 (70-30) ❌ WRONG!
- "Total": 70 ❌ Missing 30 units!

User sees inventory decreasing from 100 to 70 → Thinks products disappeared!
```

### After Fix:
```
Initial: Product has 100 units in warehouse
Add 30 to Shelf A1

UI Shows:
- Warehouse Stock: 70 ✅
- On Shelf: 30/100 ✅
- Available to Shelve: 70 ✅
- Total: 100 ✅

User sees:
- 30 moved from warehouse to shelf
- Total inventory conserved at 100 ✅
- 70 still available to shelve ✅
```

## 🧪 Testing Checklist

- [x] Products with warehouse stock > 0 can be selected
- [x] Products with warehouse stock = 0 cannot be selected
- [x] Quantity input max = warehouse stock (not total - shelved)
- [x] "On Shelf" column shows shelfedQty/totalQty correctly
- [x] Warehouse stock decreases after adding to shelf
- [x] Total quantity (warehouse + shelves) remains constant
- [x] After reload, all quantities update correctly
- [x] Status badges reflect warehouse stock (In Stock / Low Stock / Out of Stock)

## 🎯 Key Takeaways

### Semantic Understanding
The domain model has 3 stock concepts:
1. **Warehouse Stock** (`Product.current_stock`) - In warehouse storage
2. **Shelf Stock** (sum of `ProductShelf.quantity`) - On display shelves
3. **Total Stock** - Warehouse + Shelf (total owned)

Adding to shelf = **Transfer** operation:
- Source: Warehouse stock (decreases)
- Destination: Shelf stock (increases)
- Total: Unchanged (conservation)

### Why This Bug Occurred
The bug happened because:
1. Backend uses `current_stock` correctly (warehouse only)
2. Frontend assumed `current_stock` meant total inventory
3. This mismatch caused double-subtraction and "missing" inventory

### The Fix
Change frontend to understand:
- `current_stock` = warehouse stock (available to shelve)
- `totalQty` = `current_stock` + sum(shelf quantities)
- No subtraction needed for `availableToShelve`

## 📅 Implementation Date
Session: 2025-01-XX (Current)

## 🔗 Related Files
- Backend: `/server/controllers/productShelfController.js`
- Frontend: `/client/src/views/merchandise-supervisor/products-on-shelves/AddShelfProduct.jsx`
- Models: `/server/models/index.js` (productSchema, productShelfSchema)
- Service: `/client/src/services/productShelfService.js`
