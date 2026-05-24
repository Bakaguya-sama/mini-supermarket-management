# Danh Sách Tài Khoản Và Mật Khẩu Trong Database

Tài liệu này tổng hợp các tài khoản dùng để đăng nhập trong dự án Mini Supermarket Management, dựa trên dữ liệu seed trong `server/scripts/seed.js` và cơ chế xác thực trong `server/middleware/auth.js`.

Mục tiêu của file này là:
- Liệt kê đầy đủ các tài khoản có sẵn trong DB sau khi seed.
- Giải thích mật khẩu được sinh như thế nào.
- Phân tích vai trò của từng nhóm tài khoản trong hệ thống.
- Chỉ ra tài khoản nào là dữ liệu DB thật, tài khoản nào là demo hardcoded.

## 1) Nguồn dữ liệu

### 1.1. Seed database
Các tài khoản bên dưới được tạo trong script seed:
- [server/scripts/seed.js](server/scripts/seed.js)

Điểm quan trọng:
- Mọi tài khoản trong seed đều dùng chung mật khẩu gốc `password123`.
- Mật khẩu này không được lưu dạng plain text trong DB, mà được mã hóa bằng `bcrypt`.
- Script seed tạo dữ liệu cho 3 nhóm chính:
  - `admin` / Manager
  - `staff`
  - `customer`

### 1.2. Tài khoản demo hardcoded
Ngoài dữ liệu trong DB, hệ thống còn có một tài khoản demo được gắn trực tiếp trong middleware xác thực:
- [server/middleware/auth.js](server/middleware/auth.js)

Tài khoản này không phụ thuộc vào collection `Account` trong MongoDB:
- `admin@supermarket.com`
- token tương ứng có `id = demo-admin-id`

## 2) Quy tắc mật khẩu

### 2.1. Mật khẩu seed
Trong `seed.js`, password gốc được hash một lần rồi gán cho tất cả account:
- password gốc: `password123`
- lưu trong DB dưới trường `password_hash`

Nghĩa là:
- Username khác nhau
- Email khác nhau
- Nhưng mật khẩu đăng nhập seed là giống nhau: `password123`

### 2.2. Tài khoản demo
Tài khoản demo `admin@supermarket.com` không có password DB vì đây là luồng đặc biệt dựa trên JWT payload `demo-admin-id`.

## 3) Danh sách tài khoản trong DB

> Ghi chú: Các mật khẩu dưới đây đều là `password123` trừ tài khoản demo hardcoded.

### 3.1. Manager / Admin
| Username | Email | Họ tên | Vai trò | Mật khẩu |
|---|---|---|---|---|
| manager1 | manager1@mini.vn | Trần Thị Bình | admin | password123 |
| manager2 | manager2@mini.vn | Nguyễn Văn Quản | admin | password123 |

### 3.2. Staff - Delivery
| Username | Email | Họ tên | Position | Mật khẩu |
|---|---|---|---|---|
| delivery1 | delivery1@mini.vn | Lê Văn Cường | Delivery | password123 |
| delivery2 | delivery2@mini.vn | Hoàng Minh Tuấn | Delivery | password123 |

### 3.3. Staff - Cashier
| Username | Email | Họ tên | Position | Mật khẩu |
|---|---|---|---|---|
| cashier1 | cashier1@mini.vn | Nguyễn Văn An | Cashier | password123 |
| cashier2 | cashier2@mini.vn | Phạm Thị Dung | Cashier | password123 |

### 3.4. Staff - Merchandise Supervisor
| Username | Email | Họ tên | Position | Mật khẩu |
|---|---|---|---|---|
| supervisor1 | supervisor1@mini.vn | Hoàng Văn Em | Merchandise Supervisor | password123 |
| supervisor2 | supervisor2@mini.vn | Trần Thị Lan | Merchandise Supervisor | password123 |

### 3.5. Staff - Warehouse
| Username | Email | Họ tên | Position | Mật khẩu |
|---|---|---|---|---|
| warehouse1 | warehouse1@mini.vn | Đinh Văn Phúc | Warehouse | password123 |
| warehouse2 | warehouse2@mini.vn | Bùi Thị Giang | Warehouse | password123 |

### 3.6. Customer
| Username | Email | Họ tên | Membership / Ghi chú | Mật khẩu |
|---|---|---|---|---|
| customer1 | customer1@gmail.com | Võ Thị Hoa | customer | password123 |
| customer2 | customer2@gmail.com | Đặng Văn Khoa | customer | password123 |
| customer3 | customer3@gmail.com | Mai Thị Lan | customer | password123 |
| customer4 | customer4@gmail.com | Trương Văn Nam | customer | password123 |

### 3.7. Tài khoản demo hardcoded
| Username | Email | Nguồn | Mật khẩu |
|---|---|---|---|
| admin | admin@supermarket.com | Hardcoded trong auth middleware | Không dùng password DB |

## 4) Phân tích cấu trúc tài khoản

### 4.1. Chỉ có 3 role ở mức Account
Trong database, trường `role` của `Account` chỉ chia thành:
- `admin`
- `staff`
- `customer`

Điều này có nghĩa là:
- Hệ thống không tách `Delivery`, `Cashier`, `Warehouse`, `Merchandise Supervisor` thành role riêng ở cấp Account.
- Các loại nhân viên này được phân biệt bằng trường `position` trong collection `Staff`.

### 4.2. Mapping giữa Account và Staff
Với nhân viên:
- `Account.role = staff`
- `Staff.position` quyết định màn hình/chức năng cụ thể

Ví dụ:
- `delivery1` → `Staff.position = Delivery`
- `cashier1` → `Staff.position = Cashier`
- `supervisor1` → `Staff.position = Merchandise Supervisor`
- `warehouse1` → `Staff.position = Warehouse`

### 4.3. Mapping giữa Account và Customer
Với khách hàng:
- `Account.role = customer`
- Collection `Customer` giữ thêm thông tin nghiệp vụ như membership, địa chỉ, lịch sử mua hàng, v.v.

### 4.4. Admin thật và admin demo
Hệ thống có 2 kiểu admin:
- Admin trong DB: `manager1`, `manager2` với `role = admin`
- Admin demo hardcoded: `admin@supermarket.com`

Khác nhau ở chỗ:
- Admin DB đi qua validate account bình thường.
- Admin demo được middleware nhận diện bằng `demo-admin-id`, không cần tra trong MongoDB.

## 5) Cách xác thực mật khẩu trong code

Luồng đăng nhập ở mức khái quát:
1. Người dùng nhập `username` và `password`.
2. Server tìm `Account` theo username/email.
3. `password` nhập vào được so với `password_hash` trong DB bằng bcrypt.
4. Nếu đúng, hệ thống trả JWT.
5. Khi request về sau gửi JWT, middleware xác thực sẽ gắn `req.user`.

Vì vậy:
- Mật khẩu thật trong DB là `password_hash`, không phải plain text.
- File này liệt kê mật khẩu gốc để phục vụ test, demo và kiểm tra thủ công.

## 6) Ghi chú thực tế khi dùng

### 6.1. Tài khoản nào nên dùng để test?
- Test quyền admin: `manager1` / `manager2`
- Test luồng giao hàng: `delivery1`
- Test thu ngân: `cashier1`
- Test giám sát hàng hóa: `supervisor1`
- Test kho: `warehouse1`
- Test customer portal: `customer1`

### 6.2. Nếu vừa seed lại DB
Sau khi chạy seed lại, bộ tài khoản này sẽ xuất hiện đồng bộ theo script.

### 6.3. Nếu muốn kiểm tra nhanh trong code
- Script seed: [server/scripts/seed.js](server/scripts/seed.js)
- Middleware xác thực demo admin: [server/middleware/auth.js](server/middleware/auth.js)
- Schema account: [server/models/index.js](server/models/index.js)

## 7) Kết luận

Danh sách đăng nhập của hệ thống này khá đơn giản:
- Hầu hết tài khoản seed đều dùng chung mật khẩu `password123`.
- Phân quyền thật sự nằm ở `role` và `position`, không chỉ ở username.
- Có một tài khoản demo `admin@supermarket.com` được hardcode để phục vụ truy cập nhanh.

Nếu cần, có thể tạo tiếp một file riêng chỉ dành cho:
- tài khoản test theo role,
- sơ đồ quan hệ `Account -> Staff/Customer/Manager`,
- hoặc bảng mapping màn hình sau khi đăng nhập.
