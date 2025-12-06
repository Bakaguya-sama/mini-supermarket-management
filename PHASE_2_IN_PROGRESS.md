# Phase 2: Frontend List Views Integration - IN PROGRESS

**Date Started:** Current Session  
**Status:** IN PROGRESS (1/5 views completed)

## Overview
Phase 2 focuses on converting all hardcoded list views to API-driven components that consume the backend REST API. This phase ensures all frontend components use real data from the backend instead of mock data.

## Completed Views (1/5)

### ✅ 1. StaffListView.jsx - COMPLETED

**Location:** `client/src/views/manager/staff-management/StaffListView.jsx`

**Changes Made:**
- ✅ Added imports: `staffService`, `useNotification`, `useEffect`
- ✅ Added state management:
  - `[staffData, setStaffData]` - stores fetched staff list
  - `[loading, setLoading]` - tracks API loading state
  - `[error, setError]` - stores error messages
  - Existing filters: `searchTerm`, `statusFilter`, `monthFilter`
  - Pagination: `currentPage`

- ✅ Created `fetchStaffData()` async function:
  - Calls `staffService.getAll()` with pagination, search, and position filters
  - Handles API responses and errors
  - Shows success/error notifications via `useNotification`
  - Properly formats API params

- ✅ Updated `useEffect` hook:
  - Triggers `fetchStaffData()` when `currentPage`, `searchTerm`, or `statusFilter` changes
  - Automatically resets to page 1 when filters change

- ✅ Removed hardcoded staffData array (226 lines):
  - Removed sample staff records (Alice Johnson, John Smith, etc.)
  - All data now comes from API response

- ✅ Updated handler functions:
  - `handleDelete()`: Now uses `staff._id` (MongoDB ID) instead of `staff.id`
  - `handleConfirmDelete()`: Calls `staffService.delete()` and refreshes list
  - `handleView()`: Uses `staff._id` for proper MongoDB document lookup

- ✅ Updated table rendering:
  - Added loading state display
  - Added error state display  
  - Added empty state message
  - Changed field names to match API schema:
    - `staff._id` for ID (with last 6 chars display)
    - `staff.fullName` (with fallback to `staff.name`)
    - `staff.isActive` for status (true/false) instead of `staff.status`
    - `new Date(staff.joinDate).toLocaleDateString()` for proper date formatting
  - Updated all action button IDs to use `staff._id`

**Field Mapping (Frontend → API):**
```javascript
old.id                    → new._id
old.name                  → new.fullName
old.status (string)       → new.isActive (boolean)
old.joinDate (formatted)  → new.joinDate (ISO date)
```

**Status Badge Logic:**
- Active: `isActive === true` → "Active" badge with green style
- Inactive: `isActive === false` → "Inactive" badge with red style

**Testing Notes:**
- Component properly handles API response format
- Loading spinner displays while fetching data
- Error messages show if API fails
- Empty state shown if no staff found
- Pagination works with API data
- Delete operations call API and refresh list

---

## Remaining Views (4/5) - TODO

### 2. ProductListView.jsx - NOT STARTED
**Location:** `client/src/views/manager/product-management/ProductListView.jsx`
- Replace `productData` hardcoded array with `productService.getAll()`
- Update field mapping: `product._id`, `product.productName`, `product.category`, `product.price`, `product.stockQuantity`, `product.isActive`
- Add delete, edit, view handlers with API calls

### 3. SupplierListView.jsx - NOT STARTED
**Location:** `client/src/views/merchandise-supervisor/supplier-management/SupplierListView.jsx`
- Replace `supplierData` hardcoded array with `supplierService.getAll()`
- Update field mapping: `supplier._id`, `supplier.supplierName`, `supplier.contactPerson`, `supplier.email`, `supplier.phone`, `supplier.isActive`
- Add delete, edit, view handlers with API calls

### 4. CustomerListView.jsx - NOT STARTED
**Location:** `client/src/views/cashier/customer-management/CustomerListView.jsx`
- Replace `customerData` hardcoded array with `customerService.getAll()`
- Update field mapping: `customer._id`, `customer.fullName`, `customer.email`, `customer.phone`, `customer.accountId`, `customer.isActive`
- Add delete, edit, view handlers with API calls

### 5. InvoiceListView.jsx - NOT STARTED
**Location:** `client/src/views/cashier/invoice-management/InvoiceListView.jsx`
- Replace `invoiceData` hardcoded array with `invoiceService.getAll()`
- Update field mapping: `invoice._id`, `invoice.invoiceNumber`, `invoice.customerId`, `invoice.totalAmount`, `invoice.paymentStatus`, `invoice.invoiceDate`
- Add delete, edit, view handlers with API calls

---

## Implementation Pattern

All list views follow the same pattern established in StaffListView:

```javascript
// 1. Import services and hooks
import staffService from "../../../services/staffService";
import { useNotification } from "../../../hooks/useNotification";

// 2. Initialize state
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// 3. Create fetch function
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await staffService.getAll(params);
    if (response.success) {
      setData(response.data || []);
    }
  } catch (err) {
    showError("Error", err.message);
  } finally {
    setLoading(false);
  }
};

// 4. Use useEffect to trigger fetch
useEffect(() => {
  fetchData();
}, [currentPage, searchTerm]);

// 5. Update handlers to use API
const handleDelete = async (id) => {
  await service.delete(id);
  await fetchData(); // Refresh list
};

// 6. Update render to use API field names
<td>{item._id}</td>
<td>{item.isActive ? "Active" : "Inactive"}</td>
```

---

## API Service Methods Available

Each service has these methods already implemented:

### staffService
- `getAll(params)` - Get paginated staff list
- `getById(id)` - Get single staff details
- `create(data)` - Add new staff
- `update(id, data)` - Update existing staff
- `delete(id)` - Delete staff
- `getByPosition(position)` - Filter by position
- `getStatistics()` - Get staff statistics

### productService
- `getAll(params)` - Get paginated products
- `getById(id)` - Get product details
- `create(data)`, `update(id, data)`, `delete(id)` - CRUD
- `getByCategory(category)` - Filter by category
- `getLowStock()` - Get low stock items
- `updateStock(id, data)` - Update stock quantity
- `getStatistics()` - Get product statistics

### supplierService
- `getAll(params)` - Get paginated suppliers
- `getById(id)` - Get supplier details
- `create(data)`, `update(id, data)`, `delete(id)` - CRUD
- `getActive()` - Get active suppliers only
- `getStatistics()` - Get supplier statistics

### customerService
- `getAll(params)` - Get paginated customers
- `getById(id)` - Get customer details
- `create(data)`, `update(id, data)`, `delete(id)` - CRUD
- `getByMembership(membership)` - Filter by membership
- `updatePoints(id, data)` - Update loyalty points
- `getStatistics()` - Get customer statistics

### orderService
- `getAll(params)` - Get paginated orders
- `getById(id)` - Get order details
- `create(data)`, `update(id, data)`, `delete(id)` - CRUD
- `getByStatus(status)` - Filter by status
- `getByCustomer(customerId)` - Get customer orders
- `updateStatus(id, status)` - Update order status
- `getStatistics()` - Get order statistics

### invoiceService
- `getAll(params)` - Get paginated invoices
- `getById(id)` - Get invoice details
- `create(data)`, `update(id, data)`, `delete(id)` - CRUD
- `getByCustomer(customerId)` - Get customer invoices
- `getByOrder(orderId)` - Get order invoices
- `updateStatus(id, status)` - Update payment status
- `getStatistics()` - Get invoice statistics

---

## Next Steps

### Immediate (Next 1-2 hours)
1. Update ProductListView.jsx following StaffListView pattern
2. Update SupplierListView.jsx following StaffListView pattern
3. Test each view with real API data

### Short Term (Next 2-3 hours)
4. Update CustomerListView.jsx
5. Update InvoiceListView.jsx
6. Run comprehensive testing on all list views

### Medium Term (Phase 3)
- Update all Add/Edit forms to use API CRUD operations
- Implement form validation
- Add loading states to forms

### Long Term (Phase 4+)
- Implement advanced features (order status workflow, etc.)
- Add dashboard with charts and statistics
- Implement delivery tracking

---

## Validation Checklist

For each list view, verify:
- [ ] Data loads from API on component mount
- [ ] Loading state displays while fetching
- [ ] Error messages display on failure
- [ ] Empty state message shows when no data
- [ ] Pagination works with API data
- [ ] Search filter works (client-side)
- [ ] Position/category filter works (API-side)
- [ ] Status filter works (client-side)
- [ ] Delete button calls API and refreshes list
- [ ] Edit button navigates with correct ID
- [ ] View button opens modal with correct data
- [ ] Date fields formatted correctly
- [ ] Status badge colors correct
- [ ] No console errors

---

## File Statistics

**StaffListView.jsx:**
- Original: ~310 lines of hardcoded data
- Updated: ~388 lines with API integration
- Net change: +78 lines (API hooks, error handling, loading states)
- Hardcoded data removed: 226 lines

**Total Phase 2 Progress:**
- Files completed: 1/5 (20%)
- Lines of API integration code: ~140
- Hardcoded data arrays removed: 226 lines
- API services being used: 1/6

---

## Notes

- All field mappings are based on actual MongoDB schema from backend models
- API responses use `_id` for MongoDB documents (not `id`)
- Boolean fields (`isActive`, `deleted`) use true/false (not string values)
- Dates are ISO format (need `.toLocaleDateString()` for display)
- Each service already has proper error handling from Phase 1
- Authentication tokens are automatically injected via request interceptor
- Notification system from Phase 1 used for user feedback

