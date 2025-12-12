# Quick Test Guide - Customer CRUD Operations

## 🎯 Quick Start

**Both servers must be running:**
```bash
# Terminal 1 - Backend (port 5000)
cd server && npm run dev

# Terminal 2 - Frontend (port 5173)
cd client && npm run dev
```

Then open: http://localhost:5173

---

## ✅ Test Case 1: Add New Customer

**Steps**:
1. Click **Customer** in sidebar
2. Click **"+ Add Customer"** button (top right)
3. Fill the form:
   - Username: `test_customer_001`
   - Email: `test001@example.com`
   - Full Name: `John Doe`
   - Phone: `0912345678`
   - Address: `123 Main Street, Ho Chi Minh`
   - Membership Type: `Gold`
   - Notes: `VIP Customer`
4. Click **"Add Customer"** button

**Expected Result**:
- ✅ Green notification: "Customer created successfully"
- ✅ Page redirects to customer list after 1.5 seconds
- ✅ New customer appears in list with correct info
- ✅ Can see: username as account, email, membership type "Gold"

**Test Failed If**:
- ❌ No notification appears
- ❌ Form submission takes >5 seconds
- ❌ Error message appears
- ❌ Redirect doesn't happen
- ❌ New customer not in list

---

## ✅ Test Case 2: Edit Customer

**Steps**:
1. On Customer List, find a customer row
2. Click **edit button** (pencil icon)
3. Change values:
   - Membership Type: Change to `Platinum`
   - Notes: Add `Updated via test`
4. Click **"Update Customer"** button

**Expected Result**:
- ✅ Green notification: "Customer updated successfully"
- ✅ Page redirects to list after 1.5 seconds
- ✅ List shows updated membership type "Platinum"
- ✅ When you click view on that customer, new notes appear

**Test Failed If**:
- ❌ No notification appears
- ❌ Changes don't save
- ❌ Customer list doesn't update
- ❌ Edit page doesn't load customer data

---

## ✅ Test Case 3: Delete Customer (Soft Delete)

**Steps**:
1. On Customer List, click **delete button** (trash icon)
2. Confirmation modal appears
3. Read the message: "Are you sure you want to delete this customer?"
4. Click **"Delete"** button (red)

**Expected Result**:
- ✅ Green notification: "Customer deleted successfully"
- ✅ Customer immediately disappears from list
- ✅ List count decreases by 1
- ✅ Deleted customer still exists in database (isDelete=true)

**Test Failed If**:
- ❌ Modal doesn't appear
- ❌ No notification after delete
- ❌ Customer still shows in list
- ❌ Error message appears

---

## ✅ Test Case 4: Search & Filter (After Add)

**Steps**:
1. Add 2-3 new customers with different memberships
2. Use search box: Type customer's name or email
3. Use membership filter: Select "Gold" or "Silver"

**Expected Result**:
- ✅ List filters in real-time
- ✅ Only matching customers appear
- ✅ Search works by: full name, email, phone, customer ID
- ✅ Membership filter shows only selected type

**Test Failed If**:
- ❌ Search doesn't filter
- ❌ Dropdown doesn't work
- ❌ Wrong customers appear

---

## ✅ Test Case 5: Validation (Error Handling)

**Steps**:
1. Go to Add Customer
2. Try each test:

### Test 5.1: Missing Required Fields
```
Leave username empty → Click Add
Expected: Error message "Username is required"
```

### Test 5.2: Invalid Email
```
Email: "not-an-email"
Expected: Error message "Email format is invalid"
```

### Test 5.3: Duplicate Email
```
Email: (use same as existing customer)
Expected: Error from API "Email already exists"
```

### Test 5.4: Duplicate Username
```
Username: (use same as existing customer)
Expected: Error from API "Username already exists"
```

**Expected Result**:
- ✅ All validation errors shown as notifications
- ✅ Form stays on same page (doesn't submit)
- ✅ Error messages are clear and actionable

**Test Failed If**:
- ❌ Validation doesn't work
- ❌ No error messages
- ❌ Invalid data gets created

---

## 🔍 Browser Console Checks

Open DevTools (F12) → Console tab

### When Adding Customer:
```javascript
// Should see:
🛒 Submitting customer form: { username: "...", email: "...", ... }
✅ Response object: { success: true, data: {...}, count: ... }
✅ Customers fetched successfully: {...}
```

### When Deleting Customer:
```javascript
// Should see:
🛒 Deleting customer 693b99d599bafac77249ce1a
✅ Customer deleted successfully: {...}
```

### If Error:
```javascript
// Look for:
❌ Error creating customer: ...
❌ Error fetching customers: ...
```

---

## 📊 Database Verification

### Check MongoDB directly:

```bash
# Connect to MongoDB
mongo

# Switch to database
use mini_supermarket

# View customers
db.customers.find()

# View created customer
db.customers.find({ "account_id": ObjectId("...") })

# View deleted customer
db.customers.findOne({ isDelete: true })

# View account created for customer
db.accounts.findOne({ username: "test_customer_001" })
```

**Expected for new customer**:
```javascript
{
  _id: ObjectId("..."),
  account_id: ObjectId("..."),
  membership_type: "Gold",
  notes: "VIP Customer",
  points_balance: 0,
  total_spent: 0,
  registered_at: ISODate("2025-12-12T..."),
  isDelete: false,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**Expected for deleted customer**:
```javascript
{
  // ... same fields ...
  isDelete: true  // ← Key difference
}
```

---

## 🎮 API Testing (Postman/curl)

### Add Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "username": "api_test_001",
    "email": "api_test@example.com",
    "full_name": "API Test User",
    "phone": "0987654321",
    "address": "Test Address",
    "membership_type": "Silver",
    "notes": "Created via API"
  }'

# Expected: 201 status with customer data
```

### Get All Customers
```bash
curl -X GET http://localhost:5000/api/customers?page=1&limit=100

# Expected: 200 status with list of active customers
```

### Delete Customer
```bash
curl -X DELETE http://localhost:5000/api/customers/[CUSTOMER_ID]

# Expected: 200 status with { success: true, message: "..." }
```

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| Add button doesn't work | Check browser console for JS errors |
| No notification appears | Verify useNotification hook is imported |
| Deleted customers still show | Refresh page or check applyFilters() logic |
| API returns 400 | Check request body fields match schema |
| API returns 500 | Check server terminal for error details |
| Duplicate email error | Try different email for each test |

---

## ✨ Full Test Sequence (5 minutes)

1. ✅ Add Customer #1 (Gold membership)
2. ✅ Add Customer #2 (Silver membership)
3. ✅ Edit Customer #1 (change to Platinum)
4. ✅ Edit Customer #2 (change notes)
5. ✅ Delete Customer #2 (verify it disappears)
6. ✅ Search for Customer #1 by name
7. ✅ Filter by "Platinum" membership
8. ✅ Check browser console for errors
9. ✅ Verify database contains both customers (one deleted)

**Result**: All operations should complete smoothly with notifications and proper data handling.

---

## 📝 Notes

- Notifications auto-hide after 3-5 seconds
- Soft deleted customers don't appear in list but exist in DB
- All CRUD operations log to console for debugging
- Frontend automatically refreshes after delete
- Email and username must be unique across entire database

---

**Status**: Ready for testing ✅
**Confidence**: HIGH 🟢
**Last Updated**: 2025-12-12
