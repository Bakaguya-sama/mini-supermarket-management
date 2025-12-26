# 🔐 CUSTOMER LOGIN SYSTEM - COMPLETE GUIDE

## 📋 Tổng Quan

Hệ thống login cho khách hàng đã được fix hoàn chỉnh. Khi Manager tạo tài khoản Customer, hệ thống tự động:
- ✅ Tạo password mặc định
- ✅ Customer có thể login ngay lập tức
- ✅ Customer có thể đổi password
- ✅ Manager có thể reset password khi cần

---

## 🔧 Các Thay Đổi Đã Thực Hiện

### 1. **Fix Customer Creation API**
**File**: `server/controllers/customerController.js`

**Trước đây**: Khi manager tạo customer, Account được tạo KHÔNG CÓ password_hash
```javascript
// OLD CODE - Account without password
const newAccount = await Account.create({
  username,
  email,
  // NO password_hash ❌
  role: 'customer'
});
```

**Bây giờ**: Account được tạo với default password
```javascript
// NEW CODE - Account with default password ✅
const defaultPassword = `Customer@${username.substring(0, 4)}`;
const salt = await bcrypt.genSalt(10);
const password_hash = await bcrypt.hash(defaultPassword, salt);

const newAccount = await Account.create({
  username,
  password_hash, // ✅ Password included
  email,
  role: 'customer'
});
```

**Response khi tạo customer**:
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": { ...customer data... },
  "loginInfo": {
    "username": "johndoe",
    "defaultPassword": "Customer@john",
    "message": "Customer can login with this default password. Please advise them to change it after first login."
  }
}
```

---

### 2. **New API: Reset Password for Customer**
**Endpoint**: `POST /api/auth/reset-password-for-customer`  
**Access**: Admin/Manager only  
**File**: `server/controllers/authController.js`

**Use Case**: Khi customer quên mật khẩu, manager có thể reset

**Request**:
```json
{
  "customer_account_id": "674c8c0f4fe5a05dc41",
  "new_password": "NewPassword123"  // Optional - nếu không có sẽ dùng default
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "username": "johndoe",
    "newPassword": "NewPassword123",
    "message": "Please provide this password to the customer"
  }
}
```

---

### 3. **Existing API: Change Password (Customer)**
**Endpoint**: `PUT /api/auth/change-password`  
**Access**: Customer (authenticated)

**Use Case**: Customer tự đổi password sau khi login lần đầu

**Request**:
```json
{
  "current_password": "Customer@john",
  "new_password": "MySecurePassword123!"
}
```

---

## 🔐 Default Password Format

```
Pattern: "Customer@" + first 4 characters of username

Examples:
- Username: "johndoe"    → Password: "Customer@john"
- Username: "maryjane"   → Password: "Customer@mary"
- Username: "abc"        → Password: "Customer@abc"
- Username: "testuser01" → Password: "Customer@test"
```

---

## 📝 Complete Workflow

### **Scenario 1: Manager Tạo Customer Mới**

1. **Manager login**
```http
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

2. **Manager tạo customer**
```http
POST /api/customers
Authorization: Bearer {manager_token}
{
  "username": "nguyenvana",
  "email": "nguyenvana@gmail.com",
  "full_name": "Nguyen Van A",
  "phone": "0901234567",
  "membership_type": "Standard"
}
```

Response includes login info:
```json
{
  "loginInfo": {
    "username": "nguyenvana",
    "defaultPassword": "Customer@nguy",
    "message": "Customer can login with this default password..."
  }
}
```

3. **Customer login lần đầu**
```http
POST /api/auth/login
{
  "username": "nguyenvana",
  "password": "Customer@nguy"
}
```

4. **Customer đổi password**
```http
PUT /api/auth/change-password
Authorization: Bearer {customer_token}
{
  "current_password": "Customer@nguy",
  "new_password": "MyNewPassword123!"
}
```

5. **Customer login với password mới**
```http
POST /api/auth/login
{
  "username": "nguyenvana",
  "password": "MyNewPassword123!"
}
```

---

### **Scenario 2: Customer Quên Mật Khẩu**

1. **Manager reset password**
```http
POST /api/auth/reset-password-for-customer
Authorization: Bearer {manager_token}
{
  "customer_account_id": "674c8c0f4fe5a05dc41",
  "new_password": "TempPassword123"  // Or omit for default
}
```

2. **Manager cung cấp password mới cho customer**

3. **Customer login với password đã reset**
```http
POST /api/auth/login
{
  "username": "nguyenvana",
  "password": "TempPassword123"
}
```

4. **Customer đổi lại password**
```http
PUT /api/auth/change-password
Authorization: Bearer {customer_token}
{
  "current_password": "TempPassword123",
  "new_password": "MyFinalPassword123!"
}
```

---

## 🧪 Testing Guide

Sử dụng file test đã tạo: `server/tests/customerLogin.test.http`

**Các test cases**:
1. ✅ Manager creates customer → receives default password
2. ✅ Customer login with default password
3. ✅ Customer changes password
4. ✅ Customer login with new password
5. ✅ Manager resets customer password
6. ✅ Customer login after password reset
7. ❌ Login with wrong password (should fail)
8. ❌ Login with non-existent customer (should fail)
9. ❌ Create duplicate customer (should fail)
10. ❌ Change password with wrong current password (should fail)

---

## 🔍 API Reference

### **1. Create Customer (Manager)**
```
POST /api/customers
Authorization: Bearer {manager_token}
```

**Request Body**:
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "full_name": "string (required)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "membership_type": "string (optional, default: Standard)",
  "notes": "string (optional)"
}
```

**Response**: Includes `loginInfo` with default password

---

### **2. Customer Login**
```
POST /api/auth/login
```

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "JWT token",
    "user": {
      "id": "...",
      "username": "...",
      "role": "customer",
      "customer_id": "...",
      "membership_type": "...",
      "points_balance": 0
    }
  }
}
```

---

### **3. Change Password (Customer)**
```
PUT /api/auth/change-password
Authorization: Bearer {customer_token}
```

**Request Body**:
```json
{
  "current_password": "string",
  "new_password": "string (min 6 chars)"
}
```

---

### **4. Reset Password (Manager)**
```
POST /api/auth/reset-password-for-customer
Authorization: Bearer {manager_token}
```

**Request Body**:
```json
{
  "customer_account_id": "ObjectId",
  "new_password": "string (optional - defaults to Customer@xxxx)"
}
```

---

## ⚠️ Important Notes

1. **Security**: Default password should be changed by customer after first login
2. **Manager Role**: Only admin/manager can reset customer passwords
3. **Password Strength**: Minimum 6 characters required
4. **Login Validation**: 
   - Account must have `password_hash` (now auto-generated)
   - Account must be active (`is_active: true`)
   - Account must not be deleted (`isDelete: false`)

---

## 🐛 Troubleshooting

### Issue: "Tài khoản chưa được kích hoạt chức năng đăng nhập"
**Cause**: Account doesn't have password_hash  
**Solution**: ✅ FIXED - Now auto-generated when manager creates customer

### Issue: Customer can't login after creation
**Cause**: Old implementation didn't set password  
**Solution**: ✅ FIXED - Default password now created automatically

### Issue: Customer forgot password
**Solution**: Manager uses reset-password-for-customer API

---

## 📊 Files Modified

1. ✅ `server/controllers/customerController.js`
   - Added bcrypt import
   - Generate default password on customer creation
   - Return loginInfo in response

2. ✅ `server/controllers/authController.js`
   - Added `resetPasswordForCustomer` function

3. ✅ `server/routes/authRoutes.js`
   - Added route for reset-password-for-customer

4. ✅ `server/tests/customerLogin.test.http`
   - Complete test suite for customer login flow

---

## ✅ Verification Checklist

- [x] Manager can create customer with auto-generated password
- [x] Customer can login immediately after creation
- [x] Customer can change password
- [x] Manager can reset customer password
- [x] Login properly validates password
- [x] Proper error messages for invalid credentials
- [x] Default password follows consistent pattern
- [x] Test file covers all scenarios

---

## 📞 Support

Nếu có vấn đề:
1. Check test file: `server/tests/customerLogin.test.http`
2. Verify API responses match documentation
3. Check console logs for detailed error messages
4. Ensure database is running and connected

---

**Last Updated**: December 26, 2025  
**Status**: ✅ COMPLETE & TESTED
