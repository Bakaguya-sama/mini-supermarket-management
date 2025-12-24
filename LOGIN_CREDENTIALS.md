# 🔐 HƯỚNG DẪN ĐĂNG NHẬP

## 🚀 Cách chạy hệ thống

### Cách 1: Tự động (Khuyên dùng)
```bash
# Chạy file start.bat (Windows)
start.bat
```

### Cách 2: Thủ công
```bash
# Từ thư mục root project
npm run dev
```

Sau đó mở trình duyệt: **http://localhost:5174** (hoặc 5173)

---

## 📋 TÀI KHOẢN ĐĂNG NHẬP

### 👔 MANAGER (Admin)
| Username | Password | Vai trò |
|----------|----------|---------|
| `manager1` | `password123` | Superuser |
| `manager2` | `password123` | Manager |
| `admin` | `admin123` | Demo Admin (hardcoded) |

→ **Sau khi login:** Vào trang `/dashboard`

---

### 👥 NHÂN VIÊN (4 loại)

#### 🚚 1. Delivery Staff (Giao hàng)
| Username | Password | Họ tên |
|----------|----------|--------|
| `delivery1` | `password123` | Lê Văn Cường |
| `delivery2` | `password123` | Hoàng Minh Tuấn |

→ **Sau khi login:** Vào trang `/assigned-orders` (CHỈ thấy đơn hàng của mình)

#### 💰 2. Cashier (Thu ngân)
| Username | Password | Họ tên |
|----------|----------|--------|
| `cashier1` | `password123` | Nguyễn Văn An |
| `cashier2` | `password123` | Phạm Thị Dung |

→ **Sau khi login:** Vào trang `/invoice`

#### 📦 3. Merchandise Supervisor (Giám sát hàng hóa)
| Username | Password | Họ tên |
|----------|----------|--------|
| `supervisor1` | `password123` | Hoàng Văn Em |

→ **Sau khi login:** Vào trang `/shelf-product`

#### 📊 4. Warehouse Staff (Kho hàng)
| Username | Password | Họ tên |
|----------|----------|--------|
| `warehouse1` | `password123` | Đinh Văn Phúc |
| `warehouse2` | `password123` | Bùi Thị Giang |

→ **Sau khi login:** Vào trang `/products` (Inventory Management)

---

### 🛒 CUSTOMER (Khách hàng)
| Username | Password | Membership |
|----------|----------|------------|
| `customer1` | `password123` | Gold |
| `customer2` | `password123` | Silver |
| `customer3` | `password123` | Gold |
| `customer4` | `password123` | Standard |

→ **Sau khi login:** Vào trang `/customer-portal`

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Khi đăng nhập:
1. **Chọn đúng tab:**
   - Nhân viên/Manager → Tab **"Staff"**
   - Khách hàng → Tab **"Customer"**

2. **Nếu lỗi đăng nhập:**
   - ✅ Kiểm tra username/password chính xác
   - ✅ Kiểm tra đã chọn đúng tab
   - ✅ Đảm bảo backend đang chạy (port 5000)
   - ✅ Refresh trang nếu error message biến mất

3. **Tài khoản KHÔNG TỒN TẠI:**
   - ❌ `staff1`, `staff2`, `staff3`, `staff4`, `staff5` (cũ - đã xóa)
   - ✅ Dùng `delivery1`, `cashier1`, `supervisor1`, `manager1` (mới)

---

## 🔧 Nếu cần reset database

```bash
cd server
node scripts/seed.js
```

---

## 🎯 Cấu trúc Role & Position

| Role Database | Position | Giao diện |
|---------------|----------|-----------|
| `admin` | Manager | Dashboard quản lý |
| `staff` | Delivery | Assigned Orders |
| `staff` | Cashier | Invoice Management |
| `staff` | Merchandise Supervisor | Products on Shelves |
| `staff` | Warehouse | Products (inventory) |
| `customer` | - | Customer Portal |

**LƯU Ý:** Database chỉ lưu 3 role: `admin`, `staff`, `customer`. Nhưng có 4 LOẠI nhân viên khác nhau dựa vào **Position**.

---

## 🐛 Troubleshooting

**Lỗi:** "Tên đăng nhập hoặc mật khẩu không đúng"
→ Kiểm tra lại username/password từ bảng trên

**Lỗi:** Error message hiện rồi tắt ngay
→ Đã sửa, nếu vẫn bị hãy báo lại

**Lỗi:** Port already in use
→ Frontend sẽ tự động dùng port khác (5174, 5175...)
