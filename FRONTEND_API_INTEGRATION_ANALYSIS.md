# Frontend-Backend API Integration Analysis

## 1. Current Frontend State

### Framework & Structure
- **Framework**: React 19.2.0 with React Router v7.9.6
- **State Management**: Local React useState (no Redux/Context)
- **HTTP Client**: None configured (no axios, fetch not implemented)
- **Authentication**: Mock-based with localStorage
- **Notification System**: Custom `useNotification` hook with success/error modals

### User Roles in Frontend
- **Customer**: Sign up, view profile, orders, invoices
- **Staff**: Manager, Delivery Staff, Merchandise Supervisor, Warehouse Staff, Cashier
  - Manager: Staff, Product, Supplier management
  - Cashier: Customer, Invoice management
  - Delivery Staff: Order assignment, history
  - Merchandise Supervisor: Damaged products, shelf products

### Frontend Views Structure
```
/signin - Authentication (mock-based)
/signup - Customer registration (mock)
/dashboard - Main dashboard
/manager/
  ├── staff-management (List, Add, Edit, View)
  ├── product-management (List, Add, Edit, View)
  ├── supplier-management (List, Add, Edit, View, PlaceOrder)
/cashier/
  ├── customer-management (List, Add, Edit, View)
  ├── invoice-management (List, Detail, CreateInvoice)
/delivery-staff/
  ├── assigned-orders (List, Detail)
  ├── order-history (List, Detail)
/merchandise-supervisor/
  ├── damaged-products (List, Add, Edit, Resolve)
  ├── products-on-shelves (List, Add, Edit, View)
```

### Current Data Handling
- **Sample Data**: Hardcoded arrays in each component (StaffListView, ProductListView, etc.)
- **State Management**: Local component state with useState
- **Pagination**: Implemented in frontend (slicing arrays)
- **Search/Filter**: Implemented in frontend (array methods)
- **Form Submission**: Currently logs to console, no API calls
- **Authentication**: Mock validation against `SAMPLE_ACCOUNTS` object

---

## 2. Backend API Overview

### Available Endpoints
All endpoints require JWT token in `Authorization: Bearer {token}` header (except /login, /register)

#### Authentication Module (`/api/auth`)
- `POST /login` - Login with username/password, returns JWT token
- `POST /register` - Register new customer account
- `POST /logout` - Client-side cleanup endpoint
- `GET /me` - Protected: Get authenticated user profile

#### Staff Module (`/api/staff`)
- `GET /api/staff?page=1&limit=10&search=&position=` - List staff (paginated)
- `GET /api/staff/:id` - Get staff detail
- `GET /api/staff/position/:position` - Filter by position
- `GET /api/staff/statistics/overview` - Position statistics
- `POST /api/staff` - Create staff (admin only)
- `PUT /api/staff/:id` - Update staff (admin/manager)
- `DELETE /api/staff/:id` - Soft delete staff (admin only)

#### Product Module (`/api/products`)
- `GET /api/products?page=1&limit=10&category=&status=` - List products (public)
- `GET /api/products/:id` - Get product detail (public)
- `GET /api/products/category/:category` - Filter by category (public)
- `GET /api/products/stock/low` - Low stock alerts (admin only)
- `GET /api/products/statistics/overview` - Stock statistics
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `PATCH /api/products/:id/stock` - Update stock level
- `DELETE /api/products/:id` - Soft delete product (admin only)

#### Supplier Module (`/api/suppliers`)
- `GET /api/suppliers?page=1&limit=10&active=true` - List suppliers (paginated)
- `GET /api/suppliers/:id` - Get supplier detail
- `GET /api/suppliers/active` - Get active suppliers only
- `GET /api/suppliers/statistics/overview` - Supplier statistics
- `POST /api/suppliers` - Create supplier (admin only)
- `PUT /api/suppliers/:id` - Update supplier (admin/manager)
- `DELETE /api/suppliers/:id` - Soft delete supplier (admin only)

#### Order Module (`/api/orders`)
- `GET /api/orders?page=1&limit=10&status=` - List orders (paginated)
- `GET /api/orders/:id` - Get order detail with items
- `GET /api/orders/status/:status` - Filter by status
- `GET /api/orders/customer/:customerId` - Customer orders
- `GET /api/orders/statistics/overview` - Revenue statistics
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete pending orders only

#### Customer Module (`/api/customers`)
- `GET /api/customers?page=1&limit=10&membership=` - List customers (paginated)
- `GET /api/customers/:id` - Get customer profile
- `GET /api/customers/account/:accountId` - Find by account
- `GET /api/customers/membership/:type` - Filter by membership
- `GET /api/customers/:id/statistics` - Points & spending stats
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `PATCH /api/customers/:id/points` - Adjust loyalty points
- `DELETE /api/customers/:id` - Delete customer

#### Invoice Module (`/api/invoices`)
- `GET /api/invoices?page=1&limit=10&status=` - List invoices (paginated)
- `GET /api/invoices/:id` - Get invoice detail with items
- `GET /api/invoices/customer/:customerId` - Customer invoices
- `GET /api/invoices/order/:orderId` - Invoice for order
- `GET /api/invoices/statistics/overview` - Revenue statistics
- `POST /api/invoices` - Create invoice from order
- `PUT /api/invoices/:id` - Update invoice notes
- `PATCH /api/invoices/:id/status` - Update payment status
- `DELETE /api/invoices/:id` - Delete invoice

### API Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { /* entity or array */ },
  "pagination": { "page": 1, "limit": 10, "total": 100 } // optional
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}

// Login Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "accountId": "...",
      "username": "admin",
      "role": "admin",
      "email": "admin@example.com"
    }
  }
}
```

### Test Accounts Available
```
Admin:     admin / admin123
Manager:   manager / manager123
Cashier:   cashier1 / staff123
Customer:  customer1 / customer123
```

---

## 3. Integration Requirements

### 3.1 API Service Layer
**Goal**: Create a centralized API client to handle all HTTP requests

**File to Create**: `client/src/services/apiClient.js`

**Features**:
- Base URL configuration from environment
- JWT token management (get/set/remove)
- Request interceptor to add Authorization header
- Response interceptor to handle 401/403 errors
- Standardized error handling
- Methods for all CRUD operations

**Usage Pattern**:
```javascript
import api from '@/services/apiClient';

// Fetch staff list
const staffList = await api.get('/staff', { page: 1, limit: 10 });

// Create staff
const newStaff = await api.post('/staff', { name: 'John', ... });

// Update staff
const updated = await api.put('/staff/123', { name: 'Jane' });

// Delete staff
await api.delete('/staff/123');
```

### 3.2 Authentication Service
**File to Create**: `client/src/services/authService.js`

**Functions**:
- `login(username, password)` - Call /api/auth/login
- `register(email, password)` - Call /api/auth/register
- `logout()` - Clear token and redirect
- `getCurrentUser()` - Call /api/auth/me
- `getToken()` - Get JWT from localStorage
- `setToken(token)` - Save JWT to localStorage
- `clearToken()` - Remove JWT from localStorage

### 3.3 Module-Specific Services
Create separate service files for each module:
- `client/src/services/staffService.js`
- `client/src/services/productService.js`
- `client/src/services/supplierService.js`
- `client/src/services/orderService.js`
- `client/src/services/customerService.js`
- `client/src/services/invoiceService.js`

**Each service exports**:
- `getAll(params)` - Paginated list with filters
- `getById(id)` - Single entity detail
- `create(data)` - Create new entity
- `update(id, data)` - Update entity
- `delete(id)` - Delete entity
- Module-specific methods (e.g., `updateStaffStatus`, `updateProductStock`)

### 3.4 Context API for State Management
**File to Create**: `client/src/context/AuthContext.jsx`

**Purpose**: Global authentication state
- `user` - Current logged-in user
- `token` - JWT token
- `login(username, password)` - Login method
- `logout()` - Logout method
- `isAuthenticated` - Boolean flag

### 3.5 Update SignIn Component
**File**: `client/src/views/auth/SignIn.jsx`

**Changes**:
- Replace mock validation with actual API call
- Call `authService.login(username, password)`
- Show loading state during API call
- Handle API errors with notification
- Store token and user data from API response
- Redirect on successful login

### 3.6 Update All List Views
**Files**: 
- `StaffListView.jsx`
- `ProductListView.jsx`
- `SupplierListView.jsx`
- `CustomerListView.jsx`
- `InvoiceListView.jsx`

**Changes**:
- Replace hardcoded `staffData`, `productData`, etc. with API calls
- Implement `useEffect` to fetch data on mount
- Handle loading and error states
- Pagination via API (not client-side slicing)
- Search and filters via API query params
- Delete operations via API calls

### 3.7 Update All Add/Edit Forms
**Files**:
- `AddStaffView.jsx`, `EditStaffView.jsx`
- `AddProductView.jsx`, `EditProductView.jsx`
- `AddSupplierView.jsx`, `EditSupplierView.jsx`
- `AddCustomerView.jsx`, `EditCustomerView.jsx`

**Changes**:
- Call appropriate API service methods
- Show loading state during submission
- Display validation errors from API
- Redirect to list view on success
- Populate form with API data for edit views

### 3.8 Environment Variables
**File**: `client/.env` (create if not exists)

**Content**:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Mini Supermarket Management
```

Update `vite.config.js` to expose environment variables to React code.

---

## 4. Integration Sequence

### Phase 1: Foundation (Critical Path)
1. ✅ Install axios (HTTP client library)
2. ✅ Create `apiClient.js` with base configuration
3. ✅ Create `authService.js` with login/register/logout
4. ✅ Create `AuthContext.jsx` for global auth state
5. ✅ Update `SignIn.jsx` to use real API
6. ✅ Add route protection (redirect unauthenticated users)

### Phase 2: Module Services
7. ✅ Create all module services (staff, product, supplier, order, customer, invoice)

### Phase 3: List Views Integration
8. ✅ Update all `*ListViews` to fetch from API
9. ✅ Implement proper pagination with API
10. ✅ Update search and filters to use API query params

### Phase 4: CRUD Operations
11. ✅ Update all Add/Edit forms to use API
12. ✅ Implement proper error handling and validation
13. ✅ Update delete operations to use API

### Phase 5: Specialized Features
14. ⏳ Order Status Workflow (PUT /orders/:id/status)
15. ⏳ Invoice Payment Status (PATCH /invoices/:id/status)
16. ⏳ Product Stock Management (PATCH /products/:id/stock)
17. ⏳ Customer Loyalty Points (PATCH /customers/:id/points)
18. ⏳ Damaged Products Resolution

---

## 5. Key Integration Points

### Authentication Flow
```
SignIn.jsx
  ↓ (username, password)
authService.login()
  ↓ (API call to /api/auth/login)
apiClient.post(/auth/login)
  ↓ (returns token & user data)
AuthContext (stores token & user)
  ↓ (saves to localStorage)
localStorage & state
  ↓ (redirect to /dashboard)
Protected Components (can access user & token)
```

### Data Fetching Flow
```
StaffListView mounted
  ↓ useEffect
staffService.getAll(params)
  ↓ (with token in header)
apiClient.get(/staff, params)
  ↓ (Backend validates token)
Backend API (/api/staff)
  ↓ (returns paginated data)
Response intercepted
  ↓ (set state with data)
UI renders staff list
```

### Error Handling Flow
```
Component makes API call
  ↓
API returns error (401, 403, 400, 500)
  ↓
Response interceptor catches error
  ↓
If 401 → Clear token, redirect to login
If 403 → Show "Access Denied" notification
If 400 → Show validation error message
If 500 → Show "Server Error" notification
  ↓
Component's error state updated
  ↓
UI shows error message
```

---

## 6. Files to Create/Modify

### New Files (Core API Integration)
- `client/src/services/apiClient.js` - HTTP client
- `client/src/services/authService.js` - Authentication
- `client/src/services/staffService.js`
- `client/src/services/productService.js`
- `client/src/services/supplierService.js`
- `client/src/services/orderService.js`
- `client/src/services/customerService.js`
- `client/src/services/invoiceService.js`
- `client/src/context/AuthContext.jsx` - Global auth state
- `client/src/hooks/useAuth.js` - Custom hook for auth
- `client/src/.env` - Environment variables

### Modified Files (View Layer)
- `client/src/views/auth/SignIn.jsx`
- `client/src/views/auth/SignUp.jsx`
- `client/src/views/auth/ForgetPass.jsx`
- `client/src/App.jsx` - Add route protection
- All `*ListViews` - Replace mock data with API
- All Add/Edit views - Use API for CRUD
- `client/vite.config.js` - Environment variable config

### Configuration
- `client/package.json` - Add axios dependency

---

## 7. Implementation Priority

### High Priority (Must Have)
1. ApiClient + AuthService + AuthContext
2. SignIn integration with real API
3. Staff List & CRUD with API
4. Product List & CRUD with API

### Medium Priority (Should Have)
5. Supplier List & CRUD with API
6. Customer List & CRUD with API
7. Order List & CRUD with API
8. Invoice List & CRUD with API

### Low Priority (Nice to Have)
9. Order status workflow UI
10. Invoice payment tracking
11. Product stock management dashboard
12. Damaged product resolution workflow

---

## 8. Error Handling Strategy

### Common HTTP Status Codes to Handle
- **200/201**: Success
- **400**: Validation error (show field-specific messages)
- **401**: Unauthorized (clear token, redirect to login)
- **403**: Forbidden (show "Access Denied" message)
- **404**: Not found (show "Resource not found")
- **500**: Server error (show generic "Something went wrong")

### Error Response Format Expected
```javascript
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "errors": { // Optional
    "email": "Email already exists",
    "phone": "Invalid phone format"
  }
}
```

### User Feedback Strategy
- Use existing `useNotification` hook for success/error messages
- Show field-level validation errors in forms
- Implement retry logic for failed requests (optional)
- Log errors to console for debugging

---

## 9. Testing Credentials

After running `node server/scripts/init-data.js`:

```
Admin User
- Username: admin
- Password: admin123
- Role: admin (full system access)

Manager User
- Username: manager
- Password: manager123
- Role: manager (staff & order management)

Cashier Staff
- Username: cashier1
- Password: staff123
- Role: staff (cashier position)

Regular Customer
- Username: customer1
- Password: customer123
- Role: customer
```

---

## 10. Environment Setup

### Backend Requirements
- MongoDB running on `mongodb://localhost:27017`
- Node.js server running on `http://localhost:5000`
- JWT Token stored in localStorage with key `auth_token`
- Database initialized with `node server/scripts/init-data.js`

### Frontend Requirements
- Node.js & npm installed
- Environment variables configured in `.env`
- Development server running on `http://localhost:5173` (Vite default)
- CORS configured on backend to allow requests from `http://localhost:5173`

### CORS Configuration (Backend)
```javascript
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

---

## Summary of Changes Required

| Component | Current State | Required Change | Priority |
|-----------|--------------|-----------------|----------|
| SignIn | Mock validation | Real API call | HIGH |
| StaffListView | Hardcoded data | API fetch | HIGH |
| ProductListView | Hardcoded data | API fetch | HIGH |
| SupplierListView | Hardcoded data | API fetch | MEDIUM |
| CustomerListView | Hardcoded data | API fetch | MEDIUM |
| InvoiceListView | Hardcoded data | API fetch | MEDIUM |
| All Add/Edit Views | Mock submit | API CRUD | HIGH |
| Authentication | localStorage only | JWT tokens | HIGH |
| State Management | Local useState | Context API | MEDIUM |
| HTTP Client | None | axios + apiClient | HIGH |

This comprehensive integration will transform the frontend from a static prototype into a fully functional application connected to the backend API.
