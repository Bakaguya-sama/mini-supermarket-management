# 🚀 GETTING STARTED - Customer & Invoice APIs

## ✅ What Was Created

### New API Controllers (2)
- `server/controllers/customerController.js` - 350+ lines
- `server/controllers/invoiceController.js` - 380+ lines

### New Route Files (2)
- `server/routes/customerRoutes.js` - 11 endpoints
- `server/routes/invoiceRoutes.js` - 10 endpoints

### New Test Files (2)
- `server/tests/customer.test.http` - 50+ test cases
- `server/tests/invoice.test.http` - 50+ test cases

### Updated Server
- `server/server.js` - Routes integrated

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start Server
```bash
cd server
npm run seed      # Populate database
npm start         # Start on port 5000
```

### Step 2: Open Test File
- In VS Code, open: `server/tests/customer.test.http`
- Or: `server/tests/invoice.test.http`

### Step 3: Test Endpoint
- Click "Send Request" on any test
- View response in right panel

---

## 📋 Customer API Overview

### What It Does
Manages customer profiles, loyalty points, spending tracking

### Key Functions
| Function | Endpoint | Method |
|----------|----------|--------|
| List all | /api/customers | GET |
| Get one | /api/customers/:id | GET |
| Create | /api/customers | POST |
| Update | /api/customers/:id | PUT |
| Add points | /api/customers/:id/points | PATCH |
| Update spending | /api/customers/:id/spent | PATCH |
| Get orders | /api/customers/:id/orders | GET |
| Statistics | /api/customers/stats | GET |
| Delete | /api/customers/:id | DELETE |

### Example Usage

**Get all customers:**
```http
GET http://localhost:5000/api/customers?page=1&limit=10
```

**Create customer:**
```http
POST http://localhost:5000/api/customers
Content-Type: application/json

{
  "account_id": "YOUR_ACCOUNT_ID",
  "membership_type": "premium",
  "notes": "VIP customer"
}
```

**Add loyalty points:**
```http
PATCH http://localhost:5000/api/customers/YOUR_CUSTOMER_ID/points
Content-Type: application/json

{
  "pointsToAdd": 100
}
```

**Update spending after order:**
```http
PATCH http://localhost:5000/api/customers/YOUR_CUSTOMER_ID/spent
Content-Type: application/json

{
  "amount": 2500000
}
```

---

## 📄 Invoice API Overview

### What It Does
Manages invoices, payment tracking, invoice items

### Key Functions
| Function | Endpoint | Method |
|----------|----------|--------|
| List all | /api/invoices | GET |
| Get one | /api/invoices/:id | GET |
| Create | /api/invoices | POST |
| Update status | /api/invoices/:id | PUT |
| Mark paid | /api/invoices/:id/mark-paid | PATCH |
| Get unpaid | /api/invoices/filter/unpaid | GET |
| Get by customer | /api/invoices/customer/:id | GET |
| Statistics | /api/invoices/stats | GET |
| Delete | /api/invoices/:id | DELETE |

### Example Usage

**Get all invoices:**
```http
GET http://localhost:5000/api/invoices?page=1&limit=10
```

**Get unpaid invoices:**
```http
GET http://localhost:5000/api/invoices/filter/unpaid
```

**Create invoice:**
```http
POST http://localhost:5000/api/invoices
Content-Type: application/json

{
  "customer_id": "YOUR_CUSTOMER_ID",
  "order_id": "YOUR_ORDER_ID",
  "items": [
    {
      "product_id": "PRODUCT_ID",
      "quantity": 2,
      "unit_price": 500000,
      "line_total": 1000000
    }
  ]
}
```

**Mark invoice as paid:**
```http
PATCH http://localhost:5000/api/invoices/YOUR_INVOICE_ID/mark-paid
Content-Type: application/json

{}
```

---

## 🔄 Workflow Example

### Customer-to-Invoice Workflow

**Step 1: Create Customer**
```http
POST http://localhost:5000/api/customers
Content-Type: application/json

{
  "account_id": "ACCOUNT_ID_FROM_SEED"
}
```
→ Get `customer_id` from response

**Step 2: Place Order** (from order.test.http)
```http
POST http://localhost:5000/api/orders
```
→ Get `order_id` from response

**Step 3: Create Invoice**
```http
POST http://localhost:5000/api/invoices
Content-Type: application/json

{
  "customer_id": "CUSTOMER_ID_FROM_STEP_1",
  "order_id": "ORDER_ID_FROM_STEP_2",
  "items": [...]
}
```
→ Get `invoice_id` from response

**Step 4: Track Payment**
```http
PATCH http://localhost:5000/api/invoices/INVOICE_ID_FROM_STEP_3/mark-paid
```

**Step 5: Update Customer Spending**
```http
PATCH http://localhost:5000/api/customers/CUSTOMER_ID/spent
Content-Type: application/json

{
  "amount": 2000000
}
```

---

## 🧪 Testing Without Placeholders

### Get Real IDs from Database

**Step 1: Get a customer**
```http
GET http://localhost:5000/api/customers?limit=1
```
Copy the `_id` from response

**Step 2: Get an order**
```http
GET http://localhost:5000/api/orders?limit=1
```
Copy the `_id` from response

**Step 3: Get a product**
```http
GET http://localhost:5000/api/products?limit=1
```
Copy the `_id` from response

**Step 4: Now use those IDs in your tests**
```http
POST http://localhost:5000/api/invoices
Content-Type: application/json

{
  "customer_id": "ID_FROM_STEP_1",
  "order_id": "ID_FROM_STEP_2",
  "items": [
    {
      "product_id": "ID_FROM_STEP_3",
      "quantity": 2,
      "unit_price": 500000,
      "line_total": 1000000
    }
  ]
}
```

---

## 📊 Features Highlight

### Customer API Features
✅ Pagination & filtering
✅ Search by name, email, phone
✅ Membership type tracking
✅ Loyalty points management
✅ Total spending tracking
✅ Order history retrieval
✅ Customer statistics
✅ Account linking

### Invoice API Features
✅ Auto invoice number generation
✅ Multiple items per invoice
✅ Payment status tracking (unpaid/partial/paid)
✅ Customer & order linking
✅ Amount & date filtering
✅ Unpaid invoices view
✅ Invoice reconciliation
✅ Statistics dashboard

---

## 🛠️ Troubleshooting

### Error: "Customer not found"
- Make sure customer ID exists
- Use the test to create a customer first
- Check database has seed data

### Error: "Invalid account ID"
- Account must exist in database
- Use ID from Account collection
- Seed data includes accounts

### Error: "Order not found"
- Order must exist before creating invoice
- Create order first using order.test.http
- Check order ID is valid

### Server not responding
```bash
# Kill existing process
lsof -i :5000
kill -9 <PID>

# Restart server
npm start
```

### Tests not working
- Install VS Code REST Client extension
- Make sure server is running
- Check localhost:5000/api/health returns 200
- Replace placeholder IDs with real data

---

## 📈 Full API Summary

### All 8 APIs Available

| API | Endpoints | Status |
|-----|-----------|--------|
| Product | 45+ | ✅ Working |
| Staff | 25+ | ✅ Working |
| Supplier | 10+ | ✅ Working |
| Order | 9 | ✅ NEW - Working |
| DeliveryOrder | 8 | ✅ NEW - Working |
| Cart | 15 | ✅ NEW - Working |
| Customer | 11 | ✅ NEW - Working |
| Invoice | 10 | ✅ NEW - Working |
| **TOTAL** | **133+** | **✅ READY** |

---

## 🎯 Next Steps

1. **Test Individual Endpoints**
   - Open `customer.test.http`
   - Click "Send Request"
   - View response

2. **Test Complete Workflows**
   - Follow scenario sections
   - Create → Update → Read → Delete
   - Test filtering and searching

3. **Integrate with Frontend**
   - Use these endpoints in React
   - Replace mock data with API calls
   - Test with real database

4. **Monitor Performance**
   - Check response times
   - Monitor database queries
   - Optimize as needed

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| customerController.js | Customer business logic |
| invoiceController.js | Invoice business logic |
| customerRoutes.js | Customer endpoints |
| invoiceRoutes.js | Invoice endpoints |
| customer.test.http | Customer API tests |
| invoice.test.http | Invoice API tests |
| server.js | Server configuration (UPDATED) |

---

## ✅ Verification

After starting server, verify APIs working:

```http
# Test Customer API
GET http://localhost:5000/api/customers/stats

# Test Invoice API
GET http://localhost:5000/api/invoices/stats

# Should return JSON with statistics
```

Both should return 200 OK with data.

---

## 🎉 You're All Set!

**APIs are ready to use.** Start testing with the `.test.http` files!

Open:
- `server/tests/customer.test.http`
- `server/tests/invoice.test.http`

And click "Send Request" on any test.

---

**Questions?** Check the detailed docs:
- `CUSTOMER_INVOICE_API_COMPLETE.md` - Full API documentation
- `QUICK_START_NEW_APIs.md` - Comprehensive guide
- `API_RESPONSE_EXAMPLES.md` - Response format reference

---

**Happy API Testing! 🚀**
