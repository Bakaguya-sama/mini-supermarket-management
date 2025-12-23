# 🚀 QUICK START - AUTHENTICATION

## TÓM TẮT NHANH

Hệ thống authentication hoàn chỉnh cho Mini Supermarket với 3 loại user:
- **Manager** (demo: admin/admin123)
- **Staff** (đăng ký qua admin)
- **Customer** (tự đăng ký)

---

## CHẠY SERVER

```bash
cd server
npm run dev
```

Server chạy tại: `http://localhost:5000`

---

## TEST NHANH

### 1️⃣ Login Demo Admin
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 2️⃣ Đăng ký Customer
```http
POST http://localhost:5000/api/auth/register/customer
Content-Type: application/json

{
  "username": "customer1",
  "password": "123456",
  "email": "customer1@example.com",
  "full_name": "Nguyễn Văn A"
}
```

### 3️⃣ Lấy thông tin user
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## API ENDPOINTS

| Method | Endpoint | Access | Mô tả |
|--------|----------|--------|-------|
| POST | `/api/auth/login` | Public | Đăng nhập |
| POST | `/api/auth/register/customer` | Public | Đăng ký khách hàng |
| POST | `/api/auth/register/staff` | Admin | Đăng ký nhân viên |
| GET | `/api/auth/me` | Protected | Thông tin user |
| PUT | `/api/auth/update-profile` | Protected | Cập nhật profile |
| PUT | `/api/auth/change-password` | Protected | Đổi mật khẩu |

---

## MIDDLEWARE SỬ DỤNG

```javascript
const { authenticate, requireAdmin, requireStaff } = require('../middleware/auth');

// Public route
router.get('/products', productController.getAll);

// Protected route (cần login)
router.get('/profile', authenticate, userController.getProfile);

// Admin only
router.post('/staff', authenticate, requireAdmin, staffController.create);

// Staff và Admin
router.put('/products/:id', authenticate, requireStaff, productController.update);
```

---

## CẤU HÌNH .env

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-supermarket
```

---

## FILES CHÍNH

- **Controller**: `server/controllers/authController.js`
- **Routes**: `server/routes/authRoutes.js`
- **Middleware**: `server/middleware/auth.js`
- **Tests**: `server/tests/auth.test.http`

---

## DEMO ACCOUNTS

| Type | Username | Password |
|------|----------|----------|
| Manager | admin | admin123 |
| Customer | (tự đăng ký) | min 6 ký tự |
| Staff | (admin tạo) | min 6 ký tự |

---

## VALIDATION

- ✅ Username: bắt buộc, unique
- ✅ Password: min 6 ký tự
- ✅ Email: bắt buộc, unique, valid format
- ✅ Position: bắt buộc (cho staff)

---

**Xem chi tiết: [AUTHENTICATION_SYSTEM.md](./AUTHENTICATION_SYSTEM.md)**
