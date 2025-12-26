# 📧 FORGOT PASSWORD SYSTEM - COMPLETE GUIDE

## ✅ Hệ Thống Hoàn Chỉnh

Hệ thống quên mật khẩu với verification code qua email đã được implement hoàn chỉnh, bao gồm:
- ✅ Gửi mã xác thực 6 số qua email
- ✅ Xác thực mã và reset password
- ✅ Gửi lại mã (resend code)
- ✅ Email template đẹp và chuyên nghiệp
- ✅ Error handling và validation đầy đủ
- ✅ Security best practices
- ✅ Rate limiting
- ✅ Auto-expire codes after 10 minutes

---

## 🔧 CẤU HÌNH EMAIL

### Bước 1: Cấu Hình .env

Thêm các biến sau vào file `.env`:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Bước 2: Tạo Gmail App Password

**QUAN TRỌNG**: Không dùng password Gmail thông thường!

1. Đăng nhập Gmail account
2. Vào **Google Account Settings** → **Security**
3. Bật **2-Step Verification** (bắt buộc)
4. Tìm **App Passwords** 
5. Chọn **Mail** và **Other (Custom name)**
6. Nhập tên: `Mini Supermarket`
7. Click **Generate**
8. Copy password (16 ký tự, không có khoảng trắng)
9. Paste vào `EMAIL_PASSWORD` trong .env

**Ví dụ .env thực tế**:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=minisupermarket2025@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # App password từ Google
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

## 📝 FLOW HOÀN CHỈNH

### **User Flow**:

1. **User quên mật khẩu** → Click "Forgot Password" trên trang login
2. **Nhập email** → Submit form
3. **Kiểm tra email** → Nhận mã 6 số (expires in 10 phút)
4. **Nhập verification code** → Nhập mã + password mới
5. **Success** → Redirect về login page
6. **Login** với password mới

### **System Flow**:

```
┌─────────────┐
│  User enters│
│    email    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Check if email  │
│ exists in DB    │
└──────┬──────────┘
       │
       ├─ No  → Return success (security)
       │
       ├─ Yes → Generate 6-digit code
       │        ├─ Save to VerificationCode collection
       │        ├─ Set expiry: 10 minutes
       │        └─ Send email via nodemailer
       │
       ▼
┌─────────────────┐
│ User receives   │
│ email with code │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ User enters:    │
│ - Code          │
│ - New password  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Verify code:    │
│ - Exists?       │
│ - Not expired?  │
│ - Not used?     │
│ - Attempts < 5? │
│ - Code matches? │
└──────┬──────────┘
       │
       ├─ Invalid → Return error + increment attempts
       │
       ├─ Valid → Hash new password
       │          ├─ Update Account.password_hash
       │          ├─ Mark code as used
       │          └─ Send success email
       │
       ▼
┌─────────────────┐
│ Password reset  │
│ successful      │
└─────────────────┘
```

---

## 🛠️ CÁC FILES ĐÃ TẠO/SỬA

### Backend

1. ✅ **server/config/email.js** (NEW)
   - Email transporter configuration
   - `sendVerificationEmail()` - Gửi mã xác thực
   - `sendPasswordResetSuccessEmail()` - Thông báo thành công
   - Email templates (HTML + text)

2. ✅ **server/models/index.js**
   - Added `VerificationCode` schema
   - Auto-expire index (TTL)
   - Email + isUsed index

3. ✅ **server/controllers/authController.js**
   - `forgotPassword()` - Send verification code
   - `verifyResetCode()` - Verify code + reset password
   - `resendVerificationCode()` - Resend code

4. ✅ **server/routes/authRoutes.js**
   - POST `/auth/forgot-password`
   - POST `/auth/verify-reset-code`
   - POST `/auth/resend-verification-code`

5. ✅ **server/.env.example**
   - Email configuration template

6. ✅ **server/package.json**
   - Added `nodemailer` dependency

### Frontend

7. ✅ **client/src/services/authService.js** (NEW)
   - `forgotPassword(email)`
   - `verifyResetCode({ email, code, newPassword })`
   - `resendVerificationCode(email)`

8. ✅ **client/src/views/auth/ForgetPass.jsx**
   - Integrated với APIs
   - 3-step flow: email → verification → success
   - Error handling
   - Loading states
   - Password validation

---

## 📚 API DOCUMENTATION

### 1. Send Verification Code

**Endpoint**: `POST /api/auth/forgot-password`  
**Access**: Public

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Mã xác thực đã được gửi đến email của bạn",
  "data": {
    "email": "user@example.com",
    "expiresIn": "10 minutes"
  }
}
```

**Response** (Email Error):
```json
{
  "success": false,
  "message": "Không thể gửi email. Vui lòng kiểm tra cấu hình email..."
}
```

---

### 2. Verify Code & Reset Password

**Endpoint**: `POST /api/auth/verify-reset-code`  
**Access**: Public

**Request**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePassword123!"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới."
}
```

**Response** (Invalid Code):
```json
{
  "success": false,
  "message": "Mã xác thực không đúng. Còn 3 lần thử."
}
```

**Response** (Expired Code):
```json
{
  "success": false,
  "message": "Mã xác thực không hợp lệ hoặc đã hết hạn"
}
```

---

### 3. Resend Verification Code

**Endpoint**: `POST /api/auth/resend-verification-code`  
**Access**: Public

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Mã xác thực mới đã được gửi đến email của bạn"
}
```

**Response** (Rate Limited):
```json
{
  "success": false,
  "message": "Vui lòng đợi 1 phút trước khi yêu cầu mã mới"
}
```

---

## 🔐 SECURITY FEATURES

### 1. **Code Expiration**
- Mã xác thực tự động expire sau 10 phút
- MongoDB TTL index tự động xóa expired codes

### 2. **Attempt Limiting**
- Maximum 5 lần thử nhập mã sai
- Sau 5 lần sai → yêu cầu mã mới

### 3. **Rate Limiting**
- Không cho phép resend trong vòng 1 phút
- Tránh spam email

### 4. **Code Reuse Prevention**
- Mã được mark `isUsed: true` sau khi dùng
- Không thể sử dụng lại

### 5. **Email Obfuscation**
- Không tiết lộ email có tồn tại hay không
- Luôn trả về "success" message

### 6. **Password Validation**
- Minimum 6 characters
- Hashed với bcrypt trước khi lưu

---

## 🧪 TESTING GUIDE

### Bước 1: Cấu Hình Email

```bash
cd server
cp .env.example .env
# Edit .env và thêm email credentials
```

### Bước 2: Start Server

```bash
npm run dev
```

Check console logs:
```
✅ Email server is ready to send messages
```

Nếu thấy lỗi → kiểm tra lại EMAIL_* variables

### Bước 3: Test với REST Client

Sử dụng file [server/tests/forgotPassword.test.http](server/tests/forgotPassword.test.http)

```http
# 1. Send code
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "staff2@mini.vn"
}

# 2. Check email for 6-digit code

# 3. Verify and reset
POST http://localhost:5000/api/auth/verify-reset-code
Content-Type: application/json

{
  "email": "staff2@mini.vn",
  "code": "123456",
  "newPassword": "NewPassword123!"
}
```

### Bước 4: Test Frontend

1. Navigate to `/forgot-password`
2. Enter email
3. Check mailbox
4. Enter code + new password
5. Verify redirect to login
6. Login with new password

---

## 📧 EMAIL TEMPLATE

### Verification Code Email

**Subject**: Password Reset Verification Code

**Preview**:
```
┌─────────────────────────────────┐
│      🏪 Mini Supermarket        │
├─────────────────────────────────┤
│                                 │
│   Password Reset Request        │
│                                 │
│   Hello User,                   │
│                                 │
│   Your verification code:       │
│                                 │
│      ╔══════════╗               │
│      ║  123456  ║               │
│      ╚══════════╝               │
│                                 │
│   Expires in 10 minutes         │
│                                 │
│   ⚠️ Never share this code      │
│                                 │
└─────────────────────────────────┘
```

---

## ⚠️ ERROR HANDLING

### Email Service Errors

**Error**: Cannot send email

**Causes**:
- Wrong EMAIL_USER or EMAIL_PASSWORD
- Gmail security blocking (need App Password)
- Network issues
- SMTP server down

**Solutions**:
1. Verify .env email credentials
2. Use Gmail App Password (not regular password)
3. Check if 2FA is enabled on Gmail
4. Test email config:
   ```javascript
   const { testEmailConfig } = require('./config/email');
   testEmailConfig();
   ```

### Verification Code Errors

**Error**: Mã xác thực không hợp lệ

**Causes**:
- Code expired (>10 minutes)
- Code already used
- Wrong code entered
- Too many attempts

**Solutions**:
- Request new code
- Check email carefully
- Don't copy extra spaces

---

## 🎯 BEST PRACTICES

### For Users

1. ✅ Check spam folder if no email received
2. ✅ Use strong password (min 6 chars, include numbers/symbols)
3. ✅ Don't share verification code
4. ✅ Complete within 10 minutes

### For Developers

1. ✅ Always use App Password for Gmail
2. ✅ Don't commit .env file
3. ✅ Monitor email sending errors
4. ✅ Set appropriate rate limits
5. ✅ Log verification attempts
6. ✅ Clean up expired codes (auto with TTL)

---

## 📊 DATABASE SCHEMA

### VerificationCode Collection

```javascript
{
  _id: ObjectId,
  email: "user@example.com",        // lowercase, indexed
  code: "123456",                    // 6 digits
  expiresAt: ISODate,                // 10 minutes from creation
  isUsed: false,                     // true after successful use
  attempts: 0,                       // increment on wrong code
  createdAt: ISODate,                // auto
  updatedAt: ISODate                 // auto
}

// Indexes:
// - { expiresAt: 1 } with expireAfterSeconds: 0 (TTL)
// - { email: 1, isUsed: 1 }
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Set production email credentials in .env
- [ ] Test email sending in production
- [ ] Configure CORS for frontend domain
- [ ] Set NODE_ENV=production
- [ ] Monitor email delivery rates
- [ ] Set up email bounce handling
- [ ] Configure email logging
- [ ] Test rate limiting
- [ ] Verify HTTPS for security

---

## 📞 TROUBLESHOOTING

### Q: Email không được gửi

**A**: 
1. Check server logs for detailed error
2. Verify EMAIL_USER and EMAIL_PASSWORD
3. Make sure using App Password (not regular Gmail password)
4. Check Gmail allows "Less secure app access" or use OAuth2

### Q: Mã expire quá nhanh

**A**: Mã có thời hạn 10 phút. Để thay đổi:
```javascript
// authController.js line ~355
expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
```

### Q: User không nhận được email

**A**:
1. Check spam/junk folder
2. Verify email address is correct
3. Check server logs for email errors
4. Test with different email provider

---

## ✅ COMPLETION CHECKLIST

- [x] Install nodemailer
- [x] Create email service configuration
- [x] Create VerificationCode model
- [x] Implement forgot-password API
- [x] Implement verify-reset-code API
- [x] Implement resend-code API
- [x] Update .env.example
- [x] Create authService.js frontend
- [x] Update ForgetPass.jsx with API integration
- [x] Add error handling
- [x] Add loading states
- [x] Create email templates
- [x] Create test file
- [x] Create documentation

---

**Status**: ✅ **HOÀN THÀNH & SẴN SÀNG SỬ DỤNG**

**Last Updated**: December 26, 2025

**Next Steps**:
1. Configure production email service
2. Test with real users
3. Monitor email delivery
4. Add email analytics (optional)
5. Consider SMS backup (optional)
