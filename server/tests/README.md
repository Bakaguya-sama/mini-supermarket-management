// server/tests/README.md
# Staff API Tests

## Test Coverage

Bộ test này bao phủ tất cả chức năng của Staff API:

### 1. **GET /api/staff** - Lấy danh sách nhân viên
- ✅ Kiểm tra authentication (token)
- ✅ Kiểm tra authorization (role)
- ✅ Lọc theo chức vụ (position)
- ✅ Phân trang (pagination)
- ✅ Tìm kiếm (search)

### 2. **GET /api/staff/:id** - Lấy chi tiết nhân viên
- ✅ Xử lý staff không tồn tại (404)
- ✅ Trả về thông tin đầy đủ

### 3. **POST /api/staff** - Tạo nhân viên mới
- ✅ Kiểm tra quyền (Admin only)
- ✅ Validate dữ liệu bắt buộc
- ✅ Validate chức vụ hợp lệ
- ✅ Prevent duplicate username/email
- ✅ Hash password trước khi lưu

### 4. **PUT /api/staff/:id** - Cập nhật thông tin nhân viên
- ✅ Xử lý staff không tồn tại
- ✅ Cập nhật thành công
- ✅ Prevent duplicate email

### 5. **DELETE /api/staff/:id** - Xóa nhân viên
- ✅ Kiểm tra quyền (Admin only)
- ✅ Soft delete (đánh dấu isActive=false)
- ✅ Hard delete (xóa hoàn toàn)

### 6. **PUT /api/staff/:id/change-password** - Đổi mật khẩu
- ✅ Validate password cũ/mới
- ✅ Verify password cũ chính xác
- ✅ Hash password mới

### 7. **GET /api/staff/position/:position** - Lấy nhân viên theo chức vụ
- ✅ Validate position
- ✅ Trả về danh sách

### 8. **GET /api/staff/statistics/overview** - Thống kê nhân viên
- ✅ Trả về tổng số và phân chia theo chức vụ

### 9. **Authentication & Authorization**
- ✅ Reject requests without token
- ✅ Reject expired token
- ✅ Reject invalid token

### 10. **Input Validation**
- ✅ Username validation (3+ chars, only alphanumeric + - _)
- ✅ Password validation (6+ chars)
- ✅ Email validation
- ✅ Position validation
- ✅ Employment type validation

## Cách chạy test

### Install dependencies
\`\`\`bash
npm install --save-dev jest supertest
\`\`\`

### Chạy tất cả test
\`\`\`bash
npm test
\`\`\`

### Chạy test với coverage report
\`\`\`bash
npm test -- --coverage
\`\`\`

### Chạy test file cụ thể
\`\`\`bash
npm test staff.test.js
\`\`\`

### Watch mode (tự động chạy khi file thay đổi)
\`\`\`bash
npm test -- --watch
\`\`\`

### Chạy test với verbose output
\`\`\`bash
npm test -- --verbose
\`\`\`

## Test Structure

```
tests/
├── staff.test.js          # Main test file
├── setup.js               # Test setup & configuration
└── README.md             # Documentation
```

## Mock Data

Test sử dụng mock data để không phụ thuộc vào database thực:

- **mockAccount**: Account object mẫu
- **mockStaff**: Staff object mẫu
- **adminToken**: JWT token for admin user
- **managerToken**: JWT token for manager user

## Điểm cần lưu ý

1. Tests dùng **mocked models** từ mongoose, không kết nối database thực
2. Sử dụng **JWT tokens** để test authentication
3. Test **authorization** bằng cách check role
4. Mock **bcrypt** để validate password hashing logic
5. Use **supertest** để test HTTP requests

## Coverage Goals

Target coverage: **90%+**

- Statements: 90%+
- Branches: 85%+
- Functions: 90%+
- Lines: 90%+

## Troubleshooting

### Test fails với "Cannot find module"
→ Kiểm tra imports trong staff.controller.js

### Mock không hoạt động
→ Đảm bảo jest.mock() được gọi trước require()

### Token test fails
→ Kiểm tra JWT_SECRET trong setup.js
