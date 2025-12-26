# 🧪 QUICK TEST - Customer Login Fix Verification

## Test này verify rằng customer có thể login sau khi manager tạo account

### Step 1: Manager Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Copy token from response

### Step 2: Create Customer (paste token below)
POST http://localhost:5000/api/customers
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "username": "quicktest123",
  "email": "quicktest123@test.com",
  "full_name": "Quick Test User",
  "phone": "0900000000",
  "membership_type": "Standard"
}

# Expected response should include:
# "loginInfo": {
#   "username": "quicktest123",
#   "defaultPassword": "Customer@quic",
#   ...
# }

### Step 3: Customer Login (use password from Step 2 response)
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "quicktest123",
  "password": "Customer@quic"
}

# Expected: Success with customer token and user data
# If you see error "Tài khoản chưa được kích hoạt chức năng đăng nhập"
# then the fix hasn't been applied yet

### Step 4: Change Password
PUT http://localhost:5000/api/auth/change-password
Content-Type: application/json
Authorization: Bearer CUSTOMER_TOKEN_FROM_STEP_3

{
  "current_password": "Customer@quic",
  "new_password": "MyNewPass123!"
}

### Step 5: Login with New Password
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "quicktest123",
  "password": "MyNewPass123!"
}

# ✅ If all steps succeed, the fix is working correctly!
