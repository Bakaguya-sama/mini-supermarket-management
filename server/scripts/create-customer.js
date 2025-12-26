// Script tạo customer mới
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { Account, Customer } = require("../models");

async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket"
    );
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Lỗi kết nối:", error.message);
    process.exit(1);
  }
}

async function createCustomer() {
  try {
    await connectDB();
    
    // Thông tin customer mới
    const customerData = {
      username: "testcustomer",
      password: "password123", // Mật khẩu mặc định
      email: "testcustomer@gmail.com",
      full_name: "Nguyễn Văn Test",
      phone: "0987654999",
      membership_type: "Standard", // Standard, Silver, hoặc Gold
      points_balance: 0,
      total_spent: 0
    };
    
    console.log("\n🔐 Đang tạo tài khoản customer mới...\n");
    console.log("📝 Thông tin:");
    console.log(`   - Username: ${customerData.username}`);
    console.log(`   - Password: ${customerData.password}`);
    console.log(`   - Email: ${customerData.email}`);
    console.log(`   - Họ tên: ${customerData.full_name}`);
    console.log(`   - Số điện thoại: ${customerData.phone}`);
    console.log(`   - Membership: ${customerData.membership_type}\n`);
    
    // Kiểm tra xem username đã tồn tại chưa
    const existingAccount = await Account.findOne({ 
      username: customerData.username 
    });
    
    if (existingAccount) {
      console.log(`❌ Username "${customerData.username}" đã tồn tại!`);
      console.log("💡 Hãy thử username khác hoặc xóa tài khoản cũ.\n");
      process.exit(1);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(customerData.password, salt);
    
    // Tạo Account
    const newAccount = await Account.create({
      username: customerData.username,
      password_hash: password_hash,
      email: customerData.email,
      full_name: customerData.full_name,
      phone: customerData.phone,
      role: "customer",
      is_active: true,
      isDelete: false,
      avatar_link: "https://i.pravatar.cc/150?img=30"
    });
    
    // Tạo Customer
    const newCustomer = await Customer.create({
      account_id: newAccount._id,
      membership_type: customerData.membership_type,
      points_balance: customerData.points_balance,
      total_spent: customerData.total_spent,
      registered_at: new Date(),
      isDelete: false
    });
    
    console.log("✅ TẠO CUSTOMER THÀNH CÔNG!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 THÔNG TIN ĐĂNG NHẬP:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Username: ${customerData.username}`);
    console.log(`   Password: ${customerData.password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📌 Hướng dẫn đăng nhập:");
    console.log("   1. Mở trang: http://localhost:5174");
    console.log("   2. Chọn tab 'Customer'");
    console.log("   3. Nhập username và password ở trên");
    console.log("   4. Click 'Login'\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ LỖI:", error.message);
    process.exit(1);
  }
}

createCustomer();
