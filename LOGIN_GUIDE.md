# 🔐 HƯỚNG DẪN ĐĂNG NHẬP

## PHÂN LOẠI TÀI KHOẢN

### 1️⃣ MANAGER (Demo Account - Hardcoded)
```
Username: admin
Password: admin123
```
- ✅ Không lưu trong database
- ✅ Có đầy đủ quyền admin
- ✅ Sử dụng cho testing và demo

### 2️⃣ CUSTOMER (Từ Database)
```
Username: customer1, customer2, customer3, customer4
Password: password123
```
- ✅ Tự đăng ký hoặc có sẵn trong DB
- ✅ Có thông tin: membership_type, points_balance, total_spent
- ✅ Có thể mua hàng, tích điểm

### 3️⃣ STAFF (Từ Database)
```
Username: staff1, staff2, staff3, staff4, staff5
Password: password123
```
- ✅ Admin tạo qua API register/staff
- ✅ Có thông tin: position, salary, hire_date
- ✅ Quản lý sản phẩm, đơn hàng, kho

---

## DANH SÁCH TÀI KHOẢN CÓ SẴN

### Manager
| Username | Password | Role | Nguồn |
|----------|----------|------|-------|
| admin | admin123 | admin | Hardcoded |

### Customers
| Username | Password | Full Name | Membership |
|----------|----------|-----------|------------|
| customer1 | password123 | Võ Thị Hoa | Gold |
| customer2 | password123 | Đặng Văn Khoa | Silver |
| customer3 | password123 | Mai Thị Lan | Gold |
| customer4 | password123 | Trương Văn Nam | Standard |

### Staff
| Username | Password | Full Name | Position |
|----------|----------|-----------|----------|
| staff1 | password123 | Nguyễn Văn An | Cashier |
| staff2 | password123 | Trần Thị Bình | Warehouse |
| staff3 | password123 | Lê Văn Cường | Delivery |
| staff4 | password123 | Phạm Thị Dung | Cashier |
| staff5 | password123 | Hoàng Văn Em | Merchandise Supervisor |

---

## CÁCH TEST

### 📱 Sử dụng REST Client Extension

1. Mở file: `server/tests/test-login-final.http`
2. Click "Send Request" trên mỗi test case
3. Copy token từ response để dùng cho các requests khác

### 🖥️ Sử dụng Terminal

```bash
# Login Manager
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Login Customer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"password123"}'

# Login Staff
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"staff1","password":"password123"}'
```

---

## LOGIC ĐĂNG NHẬP

```javascript
if (username === 'admin' && password === 'admin123') {
  // ✅ Demo Manager Account
  return demoAdminToken;
} else {
  // ✅ Tìm trong Database (Customer/Staff)
  const account = await Account.findOne({ 
    username: username.toLowerCase(),
    isDelete: false,
    is_active: true 
  });
  
  // Verify password với bcrypt
  const isValid = await bcrypt.compare(password, account.password_hash);
  
  if (isValid) {
    return generateToken(account);
  }
}
```

---

## RESPONSE MẪU

### Manager Login Response
```json
{
  "success": true,
  "message": "Đăng nhập thành công (Manager Account)",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "demo-admin-id",
      "username": "admin",
      "email": "admin@supermarket.com",
      "full_name": "Demo Manager",
      "role": "admin",
      "is_demo": true
    }
  }
}
```

### Customer Login Response
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a1",
      "username": "customer1",
      "email": "customer1@gmail.com",
      "full_name": "Võ Thị Hoa",
      "phone": "0912345678",
      "role": "customer",
      "customer_id": "60d5ec49f1b2c8b1f8e4e1a2",
      "membership_type": "Gold",
      "points_balance": 1500,
      "total_spent": 5000000
    }
  }
}
```

### Staff Login Response
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c8b1f8e4e1a3",
      "username": "staff1",
      "email": "staff1@mini.vn",
      "full_name": "Nguyễn Văn An",
      "phone": "0987654321",
      "role": "staff",
      "staff_id": "60d5ec49f1b2c8b1f8e4e1a4",
      "position": "Cashier",
      "employment_type": "Full-time",
      "is_manager": true,
      "manager_id": "60d5ec49f1b2c8b1f8e4e1a5",
      "access_level": "manager"
    }
  }
}
```

---

## ✅ ĐÃ HOÀN THÀNH

- ✅ Manager: demo account (admin/admin123)
- ✅ Customer: từ database (customer1-4/password123)
- ✅ Staff: từ database (staff1-5/password123)
- ✅ Register customer mới
- ✅ Register staff mới (admin only)
- ✅ Password hashing với bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
