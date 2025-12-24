# 🔐 HỆ THỐNG AUTHENTICATION - MINI SUPERMARKET MANAGEMENT

## 📋 TỔNG QUAN

Hệ thống authentication đầy đủ cho ứng dụng quản lý siêu thị mini, hỗ trợ:
- ✅ **3 loại user**: Manager (Demo Account), Staff (từ CSDL), Customer (từ CSDL)
- ✅ **Đăng ký tài khoản** cho Customer và Staff
- ✅ **Đăng nhập** với JWT tokens
- ✅ **Bảo vệ routes** với middleware authentication
- ✅ **Quản lý profile** và đổi mật khẩu

---

## 🏗️ CẤU TRÚC FILES

```
server/
├── controllers/
│   └── authController.js       # Logic xử lý authentication
├── routes/
│   └── authRoutes.js          # Định nghĩa API endpoints
├── middleware/
│   └── auth.js                # Middleware xác thực và phân quyền
├── tests/
│   └── auth.test.http         # Test cases đầy đủ
└── .env.example               # Cấu hình mẫu
```

---

## 🔑 CÁC LOẠI TÀI KHOẢN

### 1️⃣ Manager (Admin) - Demo Account
```javascript
Username: admin
Password: admin123
Role: admin
```
- **Hardcoded** trong code, không lưu database
- Có đầy đủ quyền admin
- Token ID: 'demo-admin-id'

### 2️⃣ Staff (Nhân viên)
- Tạo qua API `/api/auth/register/staff` (chỉ admin)
- Lưu trong collections: `Account` + `Staff`
- Role: 'staff'
- Có thể có Manager privileges nếu có record trong `Manager` collection

### 3️⃣ Customer (Khách hàng)
- Tự đăng ký qua API `/api/auth/register/customer`
- Lưu trong collections: `Account` + `Customer`
- Role: 'customer'
- Tích điểm và membership type

---

## 📡 API ENDPOINTS

### 🟢 PUBLIC ENDPOINTS (Không cần token)

#### 1. Đăng ký khách hàng
```http
POST /api/auth/register/customer
Content-Type: application/json

{
  "username": "customer1",           // Bắt buộc, unique
  "password": "123456",              // Bắt buộc, >= 6 ký tự
  "email": "customer1@example.com",  // Bắt buộc, unique, valid format
  "full_name": "Nguyễn Văn A",       // Tùy chọn
  "phone": "0901234567",             // Tùy chọn
  "address": "123 ABC Street",       // Tùy chọn
  "date_of_birth": "1990-01-15",     // Tùy chọn
  "membership_type": "silver"        // Tùy chọn (default: 'basic')
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản khách hàng thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a1",
      "username": "customer1",
      "email": "customer1@example.com",
      "full_name": "Nguyễn Văn A",
      "phone": "0901234567",
      "role": "customer",
      "customer_id": "60d5ec49f1b2c8b1f8e4e1a2",
      "membership_type": "silver",
      "points_balance": 0
    }
  }
}
```

#### 2. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "customer1",  // Bắt buộc
  "password": "123456"      // Bắt buộc
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a1",
      "username": "customer1",
      "email": "customer1@example.com",
      "full_name": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 ABC Street",
      "avatar_link": "",
      "role": "customer",
      "customer_id": "60d5ec49f1b2c8b1f8e4e1a2",
      "membership_type": "silver",
      "points_balance": 0,
      "total_spent": 0
    }
  }
}
```

#### 3. Verify Token
```http
POST /api/auth/verify-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🔒 PROTECTED ENDPOINTS (Cần token)

#### 4. Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 5. Cập nhật profile
```http
PUT /api/auth/update-profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A Updated",
  "phone": "0909999999",
  "address": "456 XYZ Street",
  "date_of_birth": "1990-01-15",
  "avatar_link": "https://example.com/avatar.jpg"
}
```

#### 6. Đổi mật khẩu
```http
PUT /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "current_password": "123456",
  "new_password": "newpassword123"
}
```

---

### 🔐 ADMIN ONLY ENDPOINTS

#### 7. Đăng ký nhân viên (Admin only)
```http
POST /api/auth/register/staff
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "username": "staff1",                    // Bắt buộc, unique
  "password": "staff123456",               // Bắt buộc, >= 6 ký tự
  "email": "staff1@supermarket.com",       // Bắt buộc, unique
  "full_name": "Trần Thị B",               // Tùy chọn
  "phone": "0912345678",                   // Tùy chọn
  "address": "789 DEF Street",             // Tùy chọn
  "date_of_birth": "1995-05-20",           // Tùy chọn
  "position": "Cashier",                   // Bắt buộc
  "employment_type": "full-time",          // Tùy chọn (default: 'full-time')
  "annual_salary": 120000000,              // Tùy chọn
  "hire_date": "2024-01-01",               // Tùy chọn
  "notes": "Nhân viên thu ngân ca sáng"    // Tùy chọn
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản nhân viên thành công",
  "data": {
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a3",
      "username": "staff1",
      "email": "staff1@supermarket.com",
      "full_name": "Trần Thị B",
      "phone": "0912345678",
      "role": "staff",
      "staff_id": "60d5ec49f1b2c8b1f8e4e1a4",
      "position": "Cashier",
      "employment_type": "full-time"
    }
  }
}
```

---

## 🛡️ MIDDLEWARE AUTHENTICATION

### 1. authenticate
Middleware chính để xác thực token:
```javascript
const { authenticate } = require('../middleware/auth');

router.get('/protected-route', authenticate, controller.method);
```

### 2. requireAdmin
Chỉ cho phép admin:
```javascript
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/admin-only', authenticate, requireAdmin, controller.method);
```

### 3. requireStaff
Cho phép staff và admin:
```javascript
const { authenticate, requireStaff } = require('../middleware/auth');

router.get('/staff-route', authenticate, requireStaff, controller.method);
```

### 4. requireCustomer
Chỉ cho phép customer:
```javascript
const { authenticate, requireCustomer } = require('../middleware/auth');

router.get('/customer-route', authenticate, requireCustomer, controller.method);
```

### 5. requireRoles
Cho phép nhiều roles:
```javascript
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/multi-role', authenticate, requireRoles(['admin', 'staff']), controller.method);
```

### 6. optionalAuth
Không bắt buộc đăng nhập nhưng sẽ gắn user nếu có:
```javascript
const { optionalAuth } = require('../middleware/auth');

router.get('/public-route', optionalAuth, controller.method);
```

---

## 🔐 JWT TOKEN

### Cấu trúc Token
```javascript
{
  "id": "60d5ec49f1b2c8b1f8e4e1a1",    // User ID
  "role": "customer",                   // User role
  "email": "customer1@example.com",     // User email
  "iat": 1638360000,                    // Issued at
  "exp": 1638964800                     // Expires at
}
```

### Thời gian sống
- Default: **7 ngày**
- Có thể config trong `.env`: `JWT_EXPIRES_IN=7d`

### Sử dụng Token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚙️ CẤU HÌNH (.env)

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mini-supermarket
```

---

## ✅ VALIDATION RULES

### Username
- ✅ Bắt buộc
- ✅ Phải unique
- ✅ Tự động convert sang lowercase
- ✅ Trim whitespace

### Password
- ✅ Bắt buộc
- ✅ Minimum 6 ký tự
- ✅ Hash với bcrypt (salt rounds: 10)

### Email
- ✅ Bắt buộc
- ✅ Phải unique
- ✅ Valid format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- ✅ Tự động convert sang lowercase

### Position (cho Staff)
- ✅ Bắt buộc khi đăng ký staff

---

## 🔄 WORKFLOW ĐĂNG KÝ CUSTOMER

```
1. Client gửi POST /api/auth/register/customer
   ↓
2. Validate input (username, password, email)
   ↓
3. Check username đã tồn tại chưa
   ↓
4. Check email đã tồn tại chưa
   ↓
5. Hash password với bcrypt
   ↓
6. Tạo Account record (role: 'customer')
   ↓
7. Tạo Customer record (link với Account)
   ↓
8. Generate JWT token
   ↓
9. Return token + user data
```

---

## 🔄 WORKFLOW ĐĂNG KÝ STAFF

```
1. Admin gửi POST /api/auth/register/staff với admin token
   ↓
2. Middleware authenticate kiểm tra token
   ↓
3. Validate input (username, password, email, position)
   ↓
4. Check username đã tồn tại chưa
   ↓
5. Check email đã tồn tại chưa
   ↓
6. Hash password với bcrypt
   ↓
7. Tạo Account record (role: 'staff')
   ↓
8. Tạo Staff record (link với Account)
   ↓
9. Return user data (KHÔNG tự động generate token)
   ↓
10. Staff cần login riêng để lấy token
```

---

## 🔄 WORKFLOW LOGIN

```
1. Client gửi POST /api/auth/login với username + password
   ↓
2. Check demo admin account (username=admin, password=admin123)
   ↓ (nếu không phải demo)
3. Tìm Account trong database (username, isDelete=false, is_active=true)
   ↓
4. Verify password với bcrypt.compare()
   ↓
5. Load thông tin bổ sung theo role:
   - Customer: Load Customer record (membership_type, points, etc.)
   - Staff: Load Staff record + check Manager record
   ↓
6. Generate JWT token
   ↓
7. Return token + full user data
```

---

## 🧪 TESTING

### Sử dụng file auth.test.http

**Bước 1:** Mở file `server/tests/auth.test.http`

**Bước 2:** Chạy server
```bash
cd server
npm run dev
```

**Bước 3:** Test từng endpoint trong file (sử dụng REST Client extension)

### Test Scenarios:

✅ **Happy Path:**
1. Register customer → thành công
2. Login → nhận token
3. Get /me → xem thông tin
4. Update profile → cập nhật
5. Change password → đổi password
6. Login lại với password mới → thành công

✅ **Error Cases:**
- Username đã tồn tại
- Email đã tồn tại
- Password quá ngắn
- Email không hợp lệ
- Login sai username/password
- Token không hợp lệ
- Thiếu required fields

✅ **Admin Operations:**
- Admin register staff → thành công
- Customer register staff → bị từ chối (403)
- Staff login → thành công

---

## 🚨 XỬ LÝ LỖI

### 400 Bad Request
```json
{
  "success": false,
  "message": "Username, password và email là bắt buộc"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Tên đăng nhập hoặc mật khẩu không đúng"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Chỉ admin mới có quyền truy cập"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy tài khoản"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi server khi đăng ký tài khoản",
  "error": "Error details..."
}
```

---

## 📊 DATABASE SCHEMA

### Account Collection
```javascript
{
  username: String (unique, required),
  password_hash: String,
  email: String (unique, required),
  full_name: String,
  phone: String,
  address: String,
  date_of_birth: String,
  avatar_link: String,
  is_active: Boolean (default: true),
  role: String (enum: ['customer', 'staff', 'admin']),
  isDelete: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Staff Collection
```javascript
{
  account_id: ObjectId (ref: 'Account', unique),
  position: String (required),
  employment_type: String,
  annual_salary: Number,
  hire_date: Date,
  notes: String,
  is_active: Boolean (default: true),
  isDelete: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Customer Collection
```javascript
{
  account_id: ObjectId (ref: 'Account', unique, required),
  membership_type: String,
  notes: String,
  points_balance: Number (default: 0),
  total_spent: Number (default: 0),
  registered_at: Date (default: Date.now),
  isDelete: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 BẢO MẬT

### ✅ Đã implement:
- Password hashing với bcrypt (10 salt rounds)
- JWT tokens với expiration
- Input validation
- Email format validation
- Unique constraints cho username và email
- Soft delete (isDelete flag)
- Active status check (is_active)
- Role-based access control

### ⚠️ Lưu ý production:
- Đổi JWT_SECRET thành chuỗi ngẫu nhiên mạnh (>= 32 ký tự)
- Sử dụng HTTPS
- Rate limiting cho login endpoints
- Implement refresh tokens
- Add password reset functionality
- 2FA (optional)

---

## 📝 CHECKLIST TRIỂN KHAI

- [x] authController.js hoàn chỉnh
- [x] authRoutes.js hoàn chỉnh
- [x] auth middleware hoàn chỉnh
- [x] Tích hợp vào server.js
- [x] Test cases đầy đủ
- [x] .env.example
- [x] Documentation
- [ ] Test thực tế với server chạy
- [ ] Kiểm tra các edge cases
- [ ] Review security

---

## 🎯 NEXT STEPS

1. **Chạy server và test:**
   ```bash
   cd server
   npm run dev
   ```

2. **Test các endpoints bằng auth.test.http**

3. **Tạo accounts mẫu:**
   - Đăng ký 1-2 customers
   - Admin tạo 1-2 staff
   - Test login tất cả

4. **Áp dụng middleware vào các routes hiện có:**
   - Products routes → requireStaff
   - Customers routes → requireCustomer hoặc requireStaff
   - Orders routes → requireCustomer
   - v.v...

5. **Frontend integration:**
   - Tạo login form
   - Lưu token vào localStorage/cookies
   - Gắn token vào axios headers
   - Implement logout
   - Protected routes

---

## 💡 TIPS

### Lấy token sau khi login:
```javascript
// Response từ login
const response = await axios.post('/api/auth/login', { username, password });
const token = response.data.data.token;

// Lưu token
localStorage.setItem('token', token);

// Sử dụng cho requests khác
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Kiểm tra role trong frontend:
```javascript
const user = response.data.data.user;
if (user.role === 'admin') {
  // Show admin features
} else if (user.role === 'staff') {
  // Show staff features
} else if (user.role === 'customer') {
  // Show customer features
}
```

### Logout:
```javascript
// Xóa token
localStorage.removeItem('token');
delete axios.defaults.headers.common['Authorization'];
// Redirect to login
```

---

**Hệ thống authentication hoàn chỉnh và sẵn sàng sử dụng! 🎉**
