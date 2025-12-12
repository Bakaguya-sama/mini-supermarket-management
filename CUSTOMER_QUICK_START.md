# 🚀 Quick Start - Customer Management (Cashier)

## Overview

Customer management for cashiers is now fully integrated with the backend API. All features work with real data from your MongoDB database.

## 🎯 What Was Added

### 1. Service Layer (`customerService.js`)
Complete API integration service with methods for:
- Get all customers
- Get single customer
- Create customer
- Update customer
- Delete customer
- Get statistics

### 2. List View
Main customer list page at `/customer` with:
- Real-time data from API
- Search by name, email, phone
- Filter by membership type
- Pagination (10 per page)
- View, Edit, Delete actions

### 3. Add Customer View
Form at `/customer/add` to:
- Create new customer
- Enter customer details
- Select membership type
- Add notes

### 4. Edit Customer View
Update page at `/customer/edit/:id` to:
- Load customer data
- Edit membership and notes
- View customer statistics
- Update changes

---

## 📝 How to Use

### View Customer List
1. Navigate to **Customers** in sidebar
2. See all customers from database
3. Use search to find specific customer
4. Filter by membership type
5. Click page numbers to navigate

### Search & Filter
```
Search: By name, email, or phone number
Filter: Select membership type (Standard, Silver, Gold, Platinum)
Both work together instantly
```

### View Customer Details
1. Click **👁️ (View)** button on any customer
2. Modal opens with all details
3. Click **Edit Customer** to modify
4. Click ✕ to close modal

### Edit Customer
1. Click **✏️ (Edit)** button on customer
2. Go to edit page
3. Account info is read-only
4. Change membership type if needed
5. Update notes
6. Click **Update Customer**
7. See success notification
8. Auto-redirect to list

### Delete Customer
1. Click **🗑️ (Delete)** button
2. Confirmation modal appears
3. Review warning message
4. Click **Delete** to confirm
5. Customer soft-deleted (data preserved)
6. See success notification

---

## 🛠️ Technical Details

### Service Methods

```javascript
// Get all customers
const response = await customerService.getAll({
  page: 1,
  limit: 10,
  membership_type: 'Gold'
});

// Get single customer
const response = await customerService.getById(customerId);

// Create customer (needs account_id)
const response = await customerService.create({
  account_id: accountId,
  membership_type: 'Standard',
  notes: 'VIP customer'
});

// Update customer
const response = await customerService.update(id, {
  membership_type: 'Gold',
  notes: 'Updated notes'
});

// Delete customer
const response = await customerService.delete(id);

// Get statistics
const response = await customerService.getStats();
```

### Response Format

All API responses follow this format:
```javascript
{
  success: true/false,
  message: "Success/Error message",
  data: { /* customer data */ },
  count: number,
  total: number,
  page: number,
  pages: number
}
```

---

## 🎨 UI Components

### CustomerListView
**Props:** None (loads data directly)  
**Route:** `/customer`

### CustomerModal
**Props:**
- `customer` - Customer object to display
- `isOpen` - Boolean to show/hide
- `onClose` - Callback to close

### DeleteConfirmationModal
**Props:**
- `isOpen` - Boolean to show/hide
- `onClose` - Callback to cancel
- `onConfirm` - Callback to confirm delete
- `isLoading` - Boolean loading state

---

## 📊 Data Mapping

| Display | Database Field | Type |
|---------|---|---|
| Full Name | account_id.full_name | String |
| Email | account_id.email | String |
| Phone | account_id.phone | String |
| Address | account_id.address | String |
| Membership | membership_type | String |
| Points | points_balance | Number |
| Total Spent | total_spent | Number |
| Joined | registered_at | Date |

---

## ⚠️ Important Notes

### Account Requirement
Customers must be linked to existing Accounts. Before creating a customer:

1. Account must exist in system
2. Get the account_id
3. Create customer with that account_id

### Soft Delete
When you delete a customer:
- Data is preserved in database
- Customer marked as deleted (isDelete: true)
- Can be restored if needed
- Does not affect related orders/invoices

### Read-Only Fields
In Edit view, these fields cannot be changed:
- Full Name (from Account)
- Email (from Account)  
- Phone (from Account)
- Address (from Account)

Only editable:
- Membership Type
- Notes

---

## 🔍 Troubleshooting

### Problem: Customers not loading
**Solution:** Check if backend is running on port 5000

### Problem: Search doesn't work
**Solution:** Search is case-insensitive, try different keywords

### Problem: Delete shows error
**Solution:** Check console for error details, try refreshing

### Problem: Edit page shows loading forever
**Solution:** Check if customer ID in URL is valid

---

## 🧪 Test Data

The seed script creates 4 test customers:

```javascript
Customer 1: Võ Thị Hoa (Gold) - 5,000,000 spent
Customer 2: Đặng Văn Khoa (Silver) - 3,000,000 spent
Customer 3: Mai Thị Lan (Gold) - 7,500,000 spent
Customer 4: Trương Văn Nam (Standard) - 800,000 spent
```

Use these to test all features.

---

## 📱 API Endpoints

All endpoints are prefixed with `/api/customers`:

```
GET    /                    List all customers
GET    /:id                 Get single customer
POST   /                    Create customer
PUT    /:id                 Update customer
DELETE /:id                 Delete customer
GET    /stats               Get statistics
GET    /:id/orders          Get customer's orders
PATCH  /:id/points          Update loyalty points
PATCH  /:id/spent           Update total spent
```

---

## 💡 Tips & Tricks

### Filter by Membership
1. Use dropdown to quickly filter
2. Combine with search for precision
3. Reset by selecting "All"

### Pagination
- Shows which page you're on
- Click page numbers to navigate
- Resets when filtering changes

### Notifications
- Green = Success
- Red = Error
- Auto-dismiss after 3 seconds
- Click to dismiss immediately

### Keyboard Shortcuts
- `Tab` - Navigate form fields
- `Enter` - Submit form
- `Esc` - Close modals
- `Ctrl+S` - Save (if form focused)

---

## 🎯 Common Workflows

### Find & Update Premium Customer

```
1. Open Customer list
2. Filter "Membership" = "Gold"
3. Search by name if needed
4. Click Edit button
5. Change membership type
6. Click Update
7. See confirmation
```

### Check Customer Spending

```
1. Open Customer list
2. Scan "Total Purchases" column
3. Click View to see details
4. Check "Points Balance"
5. Review statistics
```

### Remove Inactive Customer

```
1. Open Customer list
2. Find customer
3. Click Delete
4. Confirm in popup
5. Customer soft-deleted
6. Verify in list (removed)
```

---

## 📞 Support

### For Bugs
1. Check browser console (F12)
2. Look for error messages
3. Note the timestamp
4. Report with error details

### For Features
- Suggest improvements in team chat
- Features planned for future release

### For Questions
- Check this guide first
- Ask team lead
- Review API documentation

---

## ✨ What's Next?

**Completed:**
- ✅ List customers
- ✅ Search & filter
- ✅ View details
- ✅ Edit customer
- ✅ Delete customer
- ✅ Stats display

**In Development:**
- Invoice management
- Order tracking
- Payment processing

**Planned:**
- Customer analytics
- Bulk operations
- Advanced reporting

---

**Integration Status: ✅ COMPLETE**  
**Last Updated: December 12, 2025**  
**Version: 1.0**
