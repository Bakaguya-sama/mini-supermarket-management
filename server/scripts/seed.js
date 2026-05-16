// scripts/seed.js - SEED ĐẦY ĐỦ DATABASE VỚI 4 CUSTOMERS
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const {
  Account,
  Staff,
  Manager,
  Customer,
  Supplier,
  Product,
  Shelf,
  ProductShelf,
  Promotion,
  PromotionProduct,
  Order,
  OrderItem,
  DeliveryOrder,
  Invoice,
  InvoiceItem,
  Payment,
  Report,
  Instruction,
  CustomerFeedback,
  ProductStock,
  Cart,
  CartItem,
  DamagedProduct,
} = require("../models");

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

async function seedDatabase() {
  try {
    await connectDB();
    console.log("\n🌱 BẮT ĐẦU SEED DATABASE ĐẦY ĐỦ...\n");

    // XÓA DỮ LIỆU CŨ
    console.log("🗑️  Đang xóa dữ liệu cũ...");
    await Promise.all([
      Account.deleteMany({}),
      Staff.deleteMany({}),
      Manager.deleteMany({}),
      Customer.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Shelf.deleteMany({}),
      ProductShelf.deleteMany({}),
      Promotion.deleteMany({}),
      PromotionProduct.deleteMany({}),
      Order.deleteMany({}),
      OrderItem.deleteMany({}),
      DeliveryOrder.deleteMany({}),
      Invoice.deleteMany({}),
      InvoiceItem.deleteMany({}),
      Payment.deleteMany({}),
      Report.deleteMany({}),
      Instruction.deleteMany({}),
      CustomerFeedback.deleteMany({}),
      ProductStock.deleteMany({}),
      Cart.deleteMany({}),
      CartItem.deleteMany({}),
      DamagedProduct.deleteMany({}),
    ]);

    // Drop unique index on staff_id trong Manager collection
    try {
      await Manager.collection.dropIndex("staff_id_1");
      console.log("✅ Đã drop index staff_id_1 từ Manager collection");
    } catch (error) {
      if (error.code !== 27) {
        // 27 = IndexNotFound
        console.log("⚠️  Index staff_id_1 không tồn tại hoặc đã bị xóa");
      }
    }

    console.log("✅ Đã xóa dữ liệu cũ\n");

    const password = await bcrypt.hash("password123", 10);

    // 1. ACCOUNTS (2 manager + 7 staff + 4 customer = 13 accounts)
    console.log("1/23 👤 Tạo Accounts...");
    const accounts = await Account.insertMany([
      // Managers
      {
        username: "manager1",
        password_hash: password,
        email: "manager1@mini.vn",
        full_name: "Trần Thị Bình",
        phone: "0901234567",
        role: "admin",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=5",
      },
      {
        username: "manager2",
        password_hash: password,
        email: "manager2@mini.vn",
        full_name: "Nguyễn Văn Quản",
        phone: "0901234568",
        role: "admin",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=11",
      },

      // Staff - Delivery
      {
        username: "delivery1",
        password_hash: password,
        email: "delivery1@mini.vn",
        full_name: "Lê Văn Cường",
        phone: "0987654323",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=13",
      },
      {
        username: "delivery2",
        password_hash: password,
        email: "delivery2@mini.vn",
        full_name: "Hoàng Minh Tuấn",
        phone: "0987654326",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=16",
      },

      // Staff - Cashier
      {
        username: "cashier1",
        password_hash: password,
        email: "cashier1@mini.vn",
        full_name: "Nguyễn Văn An",
        phone: "0987654321",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=12",
      },
      {
        username: "cashier2",
        password_hash: password,
        email: "cashier2@mini.vn",
        full_name: "Phạm Thị Dung",
        phone: "0987654324",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=9",
      },

      // Staff - Merchandise Supervisor
      {
        username: "supervisor1",
        password_hash: password,
        email: "supervisor1@mini.vn",
        full_name: "Hoàng Văn Em",
        phone: "0987654325",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=14",
      },
      {
        username: "supervisor2",
        password_hash: password,
        email: "supervisor2@mini.vn",
        full_name: "Trần Thị Lan",
        phone: "0987654329",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=8",
      },

      // Staff - Warehouse
      {
        username: "warehouse1",
        password_hash: password,
        email: "warehouse1@mini.vn",
        full_name: "Đinh Văn Phúc",
        phone: "0987654327",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=17",
      },
      {
        username: "warehouse2",
        password_hash: password,
        email: "warehouse2@mini.vn",
        full_name: "Bùi Thị Giang",
        phone: "0987654328",
        role: "staff",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=10",
      },

      // Customers
      {
        username: "customer1",
        password_hash: password,
        email: "customer1@gmail.com",
        full_name: "Võ Thị Hoa",
        phone: "0912345678",
        address: "123 Lê Lợi, Q1, TP.HCM",
        role: "customer",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=7",
      },
      {
        username: "customer2",
        password_hash: password,
        email: "customer2@gmail.com",
        full_name: "Đặng Văn Khoa",
        phone: "0912345679",
        address: "456 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
        role: "customer",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=8",
      },
      {
        username: "customer3",
        password_hash: password,
        email: "customer3@gmail.com",
        full_name: "Mai Thị Lan",
        phone: "0912345680",
        address: "789 Nguyễn Huệ, Q1, TP.HCM",
        role: "customer",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=20",
      },
      {
        username: "customer4",
        password_hash: password,
        email: "customer4@gmail.com",
        full_name: "Trương Văn Nam",
        phone: "0912345681",
        address: "101 Hai Bà Trưng, Q3, TP.HCM",
        role: "customer",
        is_active: true,
        isDelete: false,
        avatar_link: "https://i.pravatar.cc/150?img=15",
      },
    ]);
    console.log(`   ✅ ${accounts.length} accounts\n`);

    // 2. STAFF (10 nhân viên - KHÔNG BAO GỒM MANAGER - 4 POSITIONS)
    console.log(
      "2/23 👥 Tạo Staff (4 positions: Delivery, Cashier, Warehouse, Merchandise Supervisor)..."
    );
    const staffs = await Staff.insertMany([
      // Delivery Staff
      {
        account_id: accounts[2]._id,
        position: "Delivery",
        employment_type: "Full-time",
        annual_salary: 190000000,
        hire_date: new Date("2023-05-10"),
        is_active: true,
        isDelete: false,
      },
      {
        account_id: accounts[3]._id,
        position: "Delivery",
        employment_type: "Full-time",
        annual_salary: 185000000,
        hire_date: new Date("2023-06-15"),
        is_active: true,
        isDelete: false,
      },

      // Cashier
      {
        account_id: accounts[4]._id,
        position: "Cashier",
        employment_type: "Full-time",
        annual_salary: 180000000,
        hire_date: new Date("2023-01-15"),
        is_active: true,
        isDelete: false,
      },
      {
        account_id: accounts[5]._id,
        position: "Cashier",
        employment_type: "Part-time",
        annual_salary: 120000000,
        hire_date: new Date("2023-07-20"),
        is_active: true,
        isDelete: false,
      },

      // Merchandise Supervisor
      {
        account_id: accounts[6]._id,
        position: "Merchandise Supervisor",
        employment_type: "Full-time",
        annual_salary: 250000000,
        hire_date: new Date("2023-02-01"),
        is_active: true,
        isDelete: false,
      },
      {
        account_id: accounts[7]._id,
        position: "Merchandise Supervisor",
        employment_type: "Full-time",
        annual_salary: 245000000,
        hire_date: new Date("2023-08-15"),
        is_active: true,
        isDelete: false,
      },

      // Warehouse Staff
      {
        account_id: accounts[8]._id,
        position: "Warehouse",
        employment_type: "Full-time",
        annual_salary: 200000000,
        hire_date: new Date("2023-03-15"),
        is_active: true,
        isDelete: false,
      },
      {
        account_id: accounts[9]._id,
        position: "Warehouse",
        employment_type: "Full-time",
        annual_salary: 195000000,
        hire_date: new Date("2023-04-20"),
        is_active: true,
        isDelete: false,
      },
    ]);
    console.log(
      `   ✅ ${staffs.length} staff (4 positions: Delivery x2, Cashier x2, Merchandise Supervisor x2, Warehouse x2)\n`
    );

    // 3. MANAGERS (2 quản lý - RIÊNG BIỆT VỚI STAFF)
    console.log(
      "3/23 👔 Tạo Managers (riêng biệt, không phải staff positions)..."
    );
    const managers = await Manager.insertMany([
      {
        account_id: accounts[0]._id,
        access_level: "admin",
        is_superuser: true,
        permissions: {
          inventory: true,
          reports: true,
          staff: true,
          financial: true,
        },
        scope: "all",
        assigned_since: new Date("2023-01-01"),
        isDelete: false,
      },
      {
        account_id: accounts[1]._id,
        access_level: "manager",
        is_superuser: false,
        permissions: { inventory: true, reports: true, staff: false },
        scope: "operations",
        assigned_since: new Date("2023-02-01"),
        isDelete: false,
      },
    ]);
    console.log(
      `   ✅ ${managers.length} managers (pure manager role, không có staff position)\n`
    );

    // 4. CUSTOMERS (4 khách hàng)
    console.log("4/23 🛒 Tạo Customers...");
    const customers = await Customer.insertMany([
      {
        account_id: accounts[10]._id,
        membership_type: "Gold",
        points_balance: 1500,
        total_spent: 5000000,
        isDelete: false,
      },
      {
        account_id: accounts[11]._id,
        membership_type: "Silver",
        points_balance: 800,
        total_spent: 3000000,
        isDelete: false,
      },
      {
        account_id: accounts[12]._id,
        membership_type: "Gold",
        points_balance: 2000,
        total_spent: 7500000,
        isDelete: false,
      },
      {
        account_id: accounts[13]._id,
        membership_type: "Standard",
        points_balance: 200,
        total_spent: 800000,
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${customers.length} customers\n`);

    // 5. SUPPLIERS (4 nhà cung cấp)
    console.log("5/23 🏢 Tạo Suppliers...");
    const suppliers = await Supplier.insertMany([
      {
        name: "Công ty Thực phẩm Sạch",
        contact_person_name: "Nguyễn Xuân A",
        email: "contact@tps.vn",
        phone: "0281234567",
        address: "123 Đường ABC, Q.Bình Thạnh, TP.HCM",
        tax_id: "0123456789",
        is_active: true,
        image_link: "https://via.placeholder.com/300x200?text=Thuc+Pham+Sach",
        isDelete: false,
      },
      {
        name: "Vinamilk",
        contact_person_name: "Trần Thị B",
        email: "b2b@vinamilk.vn",
        phone: "0283456789",
        address: "456 Phạm Văn Đồng, Q.Bình Thạnh, TP.HCM",
        tax_id: "1122334455",
        is_active: true,
        image_link: "https://via.placeholder.com/300x200?text=Vinamilk",
        isDelete: false,
      },
      {
        name: "TH True Milk",
        contact_person_name: "Lê Văn C",
        email: "sales@thmilk.vn",
        phone: "0284567890",
        address: "789 Nguyễn Văn Linh, Q.7, TP.HCM",
        tax_id: "2233445566",
        is_active: true,
        image_link: "https://via.placeholder.com/300x200?text=TH+True+Milk",
        isDelete: false,
      },
      {
        name: "Coca Cola Vietnam",
        contact_person_name: "Phạm Thị D",
        email: "vietnam@coca-cola.com",
        phone: "0285678901",
        address: "101 Võ Văn Kiệt, Q.1, TP.HCM",
        tax_id: "3344556677",
        is_active: true,
        image_link: "https://via.placeholder.com/300x200?text=Coca+Cola",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${suppliers.length} suppliers\n`);

    // 6. PRODUCTS (12 sản phẩm)
    console.log("6/23 📦 Tạo Products...");

    // helper to generate dates relative to today
    const addDays = (d) => {
      const dt = new Date();
      dt.setDate(dt.getDate() + d);
      return dt;
    };

    const products = await Product.insertMany([
      {
        name: "Gạo ST25 5kg",
        description: "Gạo thơm cao cấp",
        unit: "túi",
        current_stock: 100,
        minimum_stock_level: 20,
        maximum_stock_level: 200,
        price: 145000,
        expiry_date: addDays(365 * 2),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Grains",
        image_link: "https://via.placeholder.com/300x200?text=Gao+ST25",
        sku: "SKU-001",
        barcode: "8934567890123",
        isDelete: false,
      },
      {
        name: "Sữa Vinamilk 1L",
        description: "Sữa tươi tiệt trùng",
        unit: "hộp",
        current_stock: 200,
        minimum_stock_level: 50,
        maximum_stock_level: 500,
        price: 32000,
        expiry_date: addDays(30),
        status: "active",
        supplier_id: suppliers[1]._id,
        category: "Dairy & Eggs",
        image_link: "https://via.placeholder.com/300x200?text=Sua+Vinamilk",
        sku: "SKU-002",
        barcode: "8934567890124",
        isDelete: false,
      },
      {
        name: "Coca Cola 330ml",
        description: "Nước giải khát",
        unit: "lon",
        current_stock: 500,
        minimum_stock_level: 100,
        maximum_stock_level: 1000,
        price: 10000,
        expiry_date: addDays(365),
        status: "active",
        supplier_id: suppliers[3]._id,
        category: "Beverages",
        image_link: "https://via.placeholder.com/300x200?text=Coca+Cola",
        sku: "SKU-003",
        barcode: "8934567890125",
        isDelete: false,
      },
      {
        name: "Trứng gà",
        description: "Trứng tươi sạch 10 quả/vỉ",
        unit: "vỉ",
        current_stock: 80,
        minimum_stock_level: 20,
        maximum_stock_level: 150,
        price: 45000,
        expiry_date: addDays(14),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Dairy & Eggs",
        image_link: "https://via.placeholder.com/300x200?text=Trung+Ga",
        sku: "SKU-004",
        barcode: "8934567890126",
        isDelete: false,
      },
      {
        name: "Mì gói Hảo Hảo",
        description: "Mì ăn liền hương vị tôm",
        unit: "gói",
        current_stock: 300,
        minimum_stock_level: 100,
        maximum_stock_level: 600,
        price: 4000,
        expiry_date: addDays(365 * 2),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Snacks",
        image_link: "https://via.placeholder.com/300x200?text=Mi+Hao+Hao",
        sku: "SKU-005",
        barcode: "8934567890127",
        isDelete: false,
      },
      {
        name: "Bánh mì Kinh Đô",
        description: "Bánh mì sandwich",
        unit: "gói",
        current_stock: 150,
        minimum_stock_level: 30,
        maximum_stock_level: 300,
        price: 28000,
        expiry_date: addDays(3),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Bakery",
        image_link: "https://via.placeholder.com/300x200?text=Banh+Mi",
        sku: "SKU-006",
        barcode: "8934567890128",
        isDelete: false,
      },
      {
        name: "Nước suối Lavie 500ml",
        description: "Nước khoáng thiên nhiên",
        unit: "chai",
        current_stock: 400,
        minimum_stock_level: 100,
        maximum_stock_level: 800,
        price: 5000,
        expiry_date: addDays(365 * 3),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Beverages",
        image_link: "https://via.placeholder.com/300x200?text=Lavie",
        sku: "SKU-007",
        barcode: "8934567890129",
        isDelete: false,
      },
      {
        name: "Dầu ăn Simply 1L",
        description: "Dầu ăn cao cấp",
        unit: "chai",
        current_stock: 120,
        minimum_stock_level: 30,
        maximum_stock_level: 250,
        price: 42000,
        expiry_date: addDays(365 * 3),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Household",
        image_link: "https://via.placeholder.com/300x200?text=Dau+An",
        sku: "SKU-008",
        barcode: "8934567890130",
        isDelete: false,
      },
      {
        name: "Sữa TH True Milk 1L",
        description: "Sữa tươi organic",
        unit: "hộp",
        current_stock: 180,
        minimum_stock_level: 40,
        maximum_stock_level: 400,
        price: 35000,
        expiry_date: addDays(30),
        status: "active",
        supplier_id: suppliers[2]._id,
        category: "Dairy & Eggs",
        image_link: "https://via.placeholder.com/300x200?text=TH+Milk",
        sku: "SKU-009",
        barcode: "8934567890131",
        isDelete: false,
      },
      {
        name: "Pepsi 330ml",
        description: "Nước ngọt có ga",
        unit: "lon",
        current_stock: 450,
        minimum_stock_level: 100,
        maximum_stock_level: 1000,
        price: 9500,
        expiry_date: addDays(365),
        status: "active",
        supplier_id: suppliers[3]._id,
        category: "Beverages",
        image_link: "https://via.placeholder.com/300x200?text=Pepsi",
        sku: "SKU-010",
        barcode: "8934567890132",
        isDelete: false,
      },
      {
        name: "Bột giặt OMO 3kg",
        description: "Bột giặt siêu sạch",
        unit: "túi",
        current_stock: 90,
        minimum_stock_level: 20,
        maximum_stock_level: 200,
        price: 125000,
        expiry_date: addDays(365 * 2),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Household",
        image_link: "https://via.placeholder.com/300x200?text=OMO",
        sku: "SKU-011",
        barcode: "8934567890133",
        isDelete: false,
      },
      {
        name: "Nước tương Chinsu 500ml",
        description: "Nước tương đậm đặc",
        unit: "chai",
        current_stock: 140,
        minimum_stock_level: 30,
        maximum_stock_level: 300,
        price: 22000,
        expiry_date: addDays(365 * 2),
        status: "active",
        supplier_id: suppliers[0]._id,
        category: "Household",
        image_link: "https://via.placeholder.com/300x200?text=Chinsu",
        sku: "SKU-012",
        barcode: "8934567890134",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${products.length} products\n`);

    // 7. SHELVES (6 kệ x 4 section = 24 shelves)
    console.log(
      "7/23 📚 Tạo Shelves (6 shelves: A-F, mỗi shelf có 4 sections)..."
    );
    const shelves = await Shelf.insertMany([
      // Shelf A - Lương thực (Grains & Staples)
      {
        shelf_number: "A1",
        shelf_name: "A",
        section_number: 1,
        slot_number: "01",
        description: "Lương thực - Section 1",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "A2",
        shelf_name: "A",
        section_number: 2,
        slot_number: "02",
        description: "Lương thực - Section 2",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "A3",
        shelf_name: "A",
        section_number: 3,
        slot_number: "03",
        description: "Lương thực - Section 3",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "A4",
        shelf_name: "A",
        section_number: 4,
        slot_number: "04",
        description: "Lương thực - Section 4",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },

      // Shelf B - Sữa & Trứng (Dairy & Eggs)
      {
        shelf_number: "B1",
        shelf_name: "B",
        section_number: 1,
        slot_number: "05",
        description: "Sữa & Trứng - Section 1",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "B2",
        shelf_name: "B",
        section_number: 2,
        slot_number: "06",
        description: "Sữa & Trứng - Section 2",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "B3",
        shelf_name: "B",
        section_number: 3,
        slot_number: "07",
        description: "Sữa & Trứng - Section 3",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "B4",
        shelf_name: "B",
        section_number: 4,
        slot_number: "08",
        description: "Sữa & Trứng - Section 4",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },

      // Shelf C - Đồ uống (Beverages)
      {
        shelf_number: "C1",
        shelf_name: "C",
        section_number: 1,
        slot_number: "09",
        description: "Đồ uống - Section 1",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "C2",
        shelf_name: "C",
        section_number: 2,
        slot_number: "10",
        description: "Đồ uống - Section 2",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "C3",
        shelf_name: "C",
        section_number: 3,
        slot_number: "11",
        description: "Đồ uống - Section 3",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "C4",
        shelf_name: "C",
        section_number: 4,
        slot_number: "12",
        description: "Đồ uống - Section 4",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },

      // Shelf D - Gia dụng (Household)
      {
        shelf_number: "D1",
        shelf_name: "D",
        section_number: 1,
        slot_number: "13",
        description: "Gia dụng - Section 1",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "D2",
        shelf_name: "D",
        section_number: 2,
        slot_number: "14",
        description: "Gia dụng - Section 2",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "D3",
        shelf_name: "D",
        section_number: 3,
        slot_number: "15",
        description: "Gia dụng - Section 3",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "D4",
        shelf_name: "D",
        section_number: 4,
        slot_number: "16",
        description: "Gia dụng - Section 4",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },

      // Shelf E - Bánh kẹo (Snacks & Sweets)
      {
        shelf_number: "E1",
        shelf_name: "E",
        section_number: 1,
        slot_number: "17",
        description: "Bánh kẹo - Section 1",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "E2",
        shelf_name: "E",
        section_number: 2,
        slot_number: "18",
        description: "Bánh kẹo - Section 2",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "E3",
        shelf_name: "E",
        section_number: 3,
        slot_number: "19",
        description: "Bánh kẹo - Section 3",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "E4",
        shelf_name: "E",
        section_number: 4,
        slot_number: "20",
        description: "Bánh kẹo - Section 4",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },

      // Shelf F - Đông lạnh (Frozen Food)
      {
        shelf_number: "F1",
        shelf_name: "F",
        section_number: 1,
        slot_number: "21",
        description: "Đông lạnh - Section 1",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "F2",
        shelf_name: "F",
        section_number: 2,
        slot_number: "22",
        description: "Đông lạnh - Section 2",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "F3",
        shelf_name: "F",
        section_number: 3,
        slot_number: "23",
        description: "Đông lạnh - Section 3",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
      {
        shelf_number: "F4",
        shelf_name: "F",
        section_number: 4,
        slot_number: "24",
        description: "Đông lạnh - Section 4",
        capacity: 50,
        current_quantity: 0,
        isDelete: false,
      },
    ]);
    console.log(
      `   ✅ ${shelves.length} shelf sections (6 shelves x 4 sections)\n`
    );

    // 8. PRODUCT SHELVES (Chỉ một số sản phẩm đã được xếp vào kệ)
    // Business Rule: 1 product can only be on 1 shelf
    console.log("8/23 📍 Tạo ProductShelves (1 product = 1 shelf only)...");
    const productShelves = await ProductShelf.insertMany([
      {
        product_id: products[0]._id,
        shelf_id: shelves[0]._id,
        quantity: 45,
        isDelete: false,
      }, // Gạo ST25 -> A1 (45/50)
      {
        product_id: products[1]._id,
        shelf_id: shelves[4]._id,
        quantity: 40,
        isDelete: false,
      }, // Sữa Vinamilk -> B1 (40/50)
      {
        product_id: products[2]._id,
        shelf_id: shelves[8]._id,
        quantity: 50,
        isDelete: false,
      }, // Coca -> C1 (50/50 FULL)
      {
        product_id: products[5]._id,
        shelf_id: shelves[1]._id,
        quantity: 30,
        isDelete: false,
      }, // Bánh mì -> A2 (30/50)
      {
        product_id: products[6]._id,
        shelf_id: shelves[9]._id,
        quantity: 48,
        isDelete: false,
      }, // Nước suối -> C2 (48/50)
      {
        product_id: products[3]._id,
        shelf_id: shelves[5]._id,
        quantity: 20,
        isDelete: false,
      }, // Trứng gà -> B2 (20/50)
      {
        product_id: products[4]._id,
        shelf_id: shelves[12]._id,
        quantity: 35,
        isDelete: false,
      }, // Mì Hảo Hảo -> D1 (35/50)
    ]);
    console.log(`   ✅ ${productShelves.length} product-shelf mappings\n`);

    // Update shelf current_quantity based on ProductShelf mappings
    console.log("   Updating shelf quantities...");
    for (const mapping of productShelves) {
      await Shelf.findByIdAndUpdate(mapping.shelf_id, {
        $inc: { current_quantity: mapping.quantity },
      });
      // Also deduct from product current_stock
      await Product.findByIdAndUpdate(mapping.product_id, {
        $inc: { current_stock: -mapping.quantity },
      });
    }
    console.log(`   ✅ Shelf quantities and product stocks updated\n`);

    // 9. PROMOTIONS (Nhiều khuyến mãi đa dạng)
    console.log("9/23 🎁 Tạo Promotions...");
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const oneWeekAgo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7
    );
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const oneWeekLater = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 7
    );
    const oneMonthLater = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
    const threeMonthsLater = new Date(
      now.getFullYear(),
      now.getMonth() + 3,
      now.getDate()
    );
    const sixMonthsLater = new Date(
      now.getFullYear(),
      now.getMonth() + 6,
      now.getDate()
    );
    const oneYearLater = new Date(
      now.getFullYear() + 1,
      now.getMonth(),
      now.getDate()
    );

    const promotions = await Promotion.insertMany([
      // Active promotions - Percentage discounts
      {
        name: "Weekend Special - Fresh Produce",
        description: "20% off on all fresh produce this weekend",
        discount_type: "percentage",
        discount_value: 20,
        minimum_purchase_amount: 0,
        promo_code: "WEEKEND20",
        start_date: oneWeekAgo,
        end_date: oneWeekLater,
        status: "active",
        terms: "Valid for fresh produce category only",
        isDelete: false,
      },
      {
        name: "Mega Sale - 30% Off",
        description: "30% discount for purchases above $50",
        discount_type: "percentage",
        discount_value: 30,
        minimum_purchase_amount: 50,
        promo_code: "MEGA30",
        start_date: now,
        end_date: oneMonthLater,
        status: "active",
        terms: "Minimum purchase $50 required",
        isDelete: false,
      },
      {
        name: "New Customer Welcome",
        description: "15% off your first purchase",
        discount_type: "percentage",
        discount_value: 15,
        minimum_purchase_amount: 20,
        promo_code: "WELCOME15",
        start_date: oneMonthAgo,
        end_date: threeMonthsLater,
        status: "active",
        terms: "For new customers only, minimum $20 purchase",
        isDelete: false,
      },
      {
        name: "Gold Member Exclusive",
        description: "25% off for Gold members",
        discount_type: "percentage",
        discount_value: 25,
        minimum_purchase_amount: 100,
        promo_code: "GOLD25",
        start_date: oneMonthAgo,
        end_date: sixMonthsLater,
        status: "active",
        terms: "Gold membership required, minimum $100 purchase",
        isDelete: false,
      },
      {
        name: "Daily Deals - 10% Off",
        description: "10% off on all items, no minimum",
        discount_type: "percentage",
        discount_value: 10,
        minimum_purchase_amount: 0,
        promo_code: "DAILY10",
        start_date: now,
        end_date: oneYearLater,
        status: "active",
        terms: "No minimum purchase required",
        isDelete: false,
      },

      // Active promotions - Fixed amount discounts
      {
        name: "Flash Sale - $5 Off",
        description: "Get $5 off your purchase",
        discount_type: "fixed",
        discount_value: 5,
        minimum_purchase_amount: 30,
        promo_code: "FLASH5",
        start_date: now,
        end_date: oneWeekLater,
        status: "active",
        terms: "Minimum purchase $30 required",
        isDelete: false,
      },
      {
        name: "Super Saver - $15 Off",
        description: "Save $15 on orders above $100",
        discount_type: "fixed",
        discount_value: 15,
        minimum_purchase_amount: 100,
        promo_code: "SAVE15",
        start_date: oneWeekAgo,
        end_date: oneMonthLater,
        status: "active",
        terms: "Minimum purchase $100 required",
        isDelete: false,
      },
      {
        name: "Loyalty Reward - $10 Off",
        description: "$10 off for loyal customers",
        discount_type: "fixed",
        discount_value: 10,
        minimum_purchase_amount: 50,
        promo_code: "LOYAL10",
        start_date: oneMonthAgo,
        end_date: threeMonthsLater,
        status: "active",
        terms: "Minimum purchase $50 required",
        isDelete: false,
      },
      {
        name: "Holiday Special - $25 Off",
        description: "Huge $25 discount for big purchases",
        discount_type: "fixed",
        discount_value: 25,
        minimum_purchase_amount: 150,
        promo_code: "HOLIDAY25",
        start_date: now,
        end_date: oneMonthLater,
        status: "active",
        terms: "Minimum purchase $150 required",
        isDelete: false,
      },
      {
        name: "Beverage Bonanza - $3 Off",
        description: "$3 off on beverage purchases above $20",
        discount_type: "fixed",
        discount_value: 3,
        minimum_purchase_amount: 20,
        promo_code: "DRINK3",
        start_date: oneWeekAgo,
        end_date: oneWeekLater,
        status: "active",
        terms: "Beverage category only, minimum $20",
        isDelete: false,
      },

      // Upcoming promotions
      {
        name: "Coming Soon - 40% Off",
        description: "Biggest sale of the year - starting tomorrow!",
        discount_type: "percentage",
        discount_value: 40,
        minimum_purchase_amount: 80,
        promo_code: "COMING40",
        start_date: tomorrow,
        end_date: oneMonthLater,
        status: "active",
        terms: "Starts tomorrow, minimum $80 purchase",
        isDelete: false,
      },

      // Inactive/Expired promotions
      {
        name: "Black Friday 2024",
        description: "50% off everything - event ended",
        discount_type: "percentage",
        discount_value: 50,
        minimum_purchase_amount: 0,
        promo_code: "BLACK50",
        start_date: new Date("2024-11-25"),
        end_date: new Date("2024-11-30"),
        status: "expired",
        terms: "Promotion has ended",
        isDelete: false,
      },
      {
        name: "Christmas 2024",
        description: "$20 off - expired",
        discount_type: "fixed",
        discount_value: 20,
        minimum_purchase_amount: 100,
        promo_code: "XMAS20",
        start_date: new Date("2024-12-20"),
        end_date: new Date("2024-12-26"),
        status: "expired",
        terms: "Promotion has ended",
        isDelete: false,
      },
      {
        name: "Test Inactive Promo",
        description: "This promotion is manually deactivated",
        discount_type: "percentage",
        discount_value: 5,
        minimum_purchase_amount: 10,
        promo_code: "INACTIVE5",
        start_date: now,
        end_date: oneMonthLater,
        status: "inactive",
        terms: "Temporarily disabled by admin",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${promotions.length} promotions\n`);

    // 10. PROMOTION PRODUCTS (Ánh xạ promotions với products)
    console.log("10/23 🏷️  Tạo PromotionProducts...");
    const promotionProducts = await PromotionProduct.insertMany([
      // Weekend Special (20% off) - Applies to fresh produce
      {
        promotion_id: promotions[0]._id, // WEEKEND20
        product_id: products[0]._id, // Coca Cola
        discount_override: null,
        isDelete: false,
      },
      {
        promotion_id: promotions[0]._id, // WEEKEND20
        product_id: products[2]._id, // Nước suối
        discount_override: null,
        isDelete: false,
      },

      // Mega Sale 30% - Applies to all products
      {
        promotion_id: promotions[1]._id, // MEGA30
        product_id: products[1]._id, // Sữa tươi
        discount_override: null,
        isDelete: false,
      },
      {
        promotion_id: promotions[1]._id, // MEGA30
        product_id: products[3]._id, // Any product
        discount_override: null,
        isDelete: false,
      },

      // Welcome 15% - Applies to starter products
      {
        promotion_id: promotions[2]._id, // WELCOME15
        product_id: products[0]._id,
        discount_override: null,
        isDelete: false,
      },

      // Gold Member 25% - Premium products
      {
        promotion_id: promotions[3]._id, // GOLD25
        product_id: products[1]._id, // Sữa tươi
        discount_override: 28, // Override with higher discount
        isDelete: false,
      },

      // Daily Deals 10% - All products
      {
        promotion_id: promotions[4]._id, // DAILY10
        product_id: products[0]._id,
        discount_override: null,
        isDelete: false,
      },
      {
        promotion_id: promotions[4]._id, // DAILY10
        product_id: products[2]._id,
        discount_override: null,
        isDelete: false,
      },

      // Flash Sale $5 - Selected products
      {
        promotion_id: promotions[5]._id, // FLASH5
        product_id: products[0]._id,
        discount_override: null,
        isDelete: false,
      },

      // Beverage Bonanza - Drink products
      {
        promotion_id: promotions[9]._id, // DRINK3
        product_id: products[0]._id, // Coca Cola
        discount_override: null,
        isDelete: false,
      },
      {
        promotion_id: promotions[9]._id, // DRINK3
        product_id: products[2]._id, // Nước suối
        discount_override: null,
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${promotionProducts.length} promotion-product links\n`);

    // 11. ORDERS (15 đơn hàng từ 4 customers - nhiều hơn để test delivery)
    console.log("11/23 📋 Tạo Orders...");
    const orders = await Order.insertMany([
      // Customer 1 - 4 orders
      {
        order_number: "ORD-001",
        customer_id: customers[0]._id,
        orderItems: [],
        order_date: new Date("2024-12-01"),
        status: "delivered",
        total_amount: 540000,
        notes: "Giao giờ hành chính",
        tracking_number: "TRACK-001",
        isDelete: false,
      },
      {
        order_number: "ORD-005",
        customer_id: customers[0]._id,
        orderItems: [],
        order_date: new Date("2024-12-12"),
        status: "delivered",
        total_amount: 346000,
        notes: "Giao buổi sáng",
        tracking_number: "TRACK-005",
        isDelete: false,
      },
      {
        order_number: "ORD-009",
        customer_id: customers[0]._id,
        orderItems: [],
        order_date: new Date("2024-12-13"),
        status: "confirmed",
        total_amount: 220000,
        notes: "Giao sau 5pm",
        tracking_number: "TRACK-009",
        isDelete: false,
      },
      {
        order_number: "ORD-013",
        customer_id: customers[0]._id,
        orderItems: [],
        order_date: new Date("2024-12-14"),
        status: "pending",
        total_amount: 180000,
        isDelete: false,
      },

      // Customer 2 - 4 orders
      {
        order_number: "ORD-002",
        customer_id: customers[1]._id,
        orderItems: [],
        order_date: new Date("2024-12-05"),
        status: "delivered",
        total_amount: 340000,
        tracking_number: "TRACK-002",
        isDelete: false,
      },
      {
        order_number: "ORD-006",
        customer_id: customers[1]._id,
        orderItems: [],
        order_date: new Date("2024-12-11"),
        status: "shipped",
        total_amount: 416000,
        tracking_number: "TRACK-006",
        isDelete: false,
      },
      {
        order_number: "ORD-010",
        customer_id: customers[1]._id,
        orderItems: [],
        order_date: new Date("2024-12-13"),
        status: "confirmed",
        total_amount: 396000,
        notes: "Gọi trước 30 phút",
        tracking_number: "TRACK-010",
        isDelete: false,
      },
      {
        order_number: "ORD-014",
        customer_id: customers[1]._id,
        orderItems: [],
        order_date: new Date("2024-12-14"),
        status: "pending",
        total_amount: 290000,
        isDelete: false,
      },

      // Customer 3 - 4 orders
      {
        order_number: "ORD-003",
        customer_id: customers[2]._id,
        orderItems: [],
        order_date: new Date("2024-12-08"),
        status: "delivered",
        total_amount: 206000,
        notes: "Giao cuối tuần",
        tracking_number: "TRACK-003",
        isDelete: false,
      },
      {
        order_number: "ORD-007",
        customer_id: customers[2]._id,
        orderItems: [],
        order_date: new Date("2024-12-10"),
        status: "delivered",
        total_amount: 500000,
        tracking_number: "TRACK-007",
        isDelete: false,
      },
      {
        order_number: "ORD-011",
        customer_id: customers[2]._id,
        orderItems: [],
        order_date: new Date("2024-12-14"),
        status: "shipped",
        total_amount: 313000,
        notes: "Để ở bảo vệ",
        tracking_number: "TRACK-011",
        isDelete: false,
      },
      {
        order_number: "ORD-015",
        customer_id: customers[2]._id,
        orderItems: [],
        order_date: new Date("2024-12-14"),
        status: "pending",
        total_amount: 210000,
        isDelete: false,
      },

      // Customer 4 - 3 orders
      {
        order_number: "ORD-004",
        customer_id: customers[3]._id,
        orderItems: [],
        order_date: new Date("2024-12-10"),
        status: "delivered",
        total_amount: 139000,
        tracking_number: "TRACK-004",
        isDelete: false,
      },
      {
        order_number: "ORD-008",
        customer_id: customers[3]._id,
        orderItems: [],
        order_date: new Date("2024-12-12"),
        status: "shipped",
        total_amount: 243000,
        notes: "Tầng 3, phòng 301",
        tracking_number: "TRACK-008",
        isDelete: false,
      },
      {
        order_number: "ORD-012",
        customer_id: customers[3]._id,
        orderItems: [],
        order_date: new Date("2024-12-14"),
        status: "confirmed",
        total_amount: 179000,
        tracking_number: "TRACK-012",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${orders.length} orders\n`);

    // 12. ORDER ITEMS (30+ chi tiết đơn hàng cho các orders)
    console.log("12/23 📦 Tạo OrderItems...");
    const orderItems = await OrderItem.insertMany([
      // Order 1 (ORD-001) - Delivered
      {
        order_id: orders[0]._id,
        product_id: products[0]._id,
        quantity: 2,
        unit_price: 145000,
        status: "shipped",
        isDelete: false,
      },
      {
        order_id: orders[0]._id,
        product_id: products[1]._id,
        quantity: 5,
        unit_price: 32000,
        status: "shipped",
        isDelete: false,
      },
      {
        order_id: orders[0]._id,
        product_id: products[3]._id,
        quantity: 2,
        unit_price: 45000,
        status: "shipped",
        isDelete: false,
      },

      // Order 2 (ORD-002) - Delivered
      {
        order_id: orders[4]._id,
        product_id: products[2]._id,
        quantity: 10,
        unit_price: 10000,
        status: "picked",
        isDelete: false,
      },
      {
        order_id: orders[4]._id,
        product_id: products[6]._id,
        quantity: 20,
        unit_price: 5000,
        status: "picked",
        isDelete: false,
      },
      {
        order_id: orders[4]._id,
        product_id: products[5]._id,
        quantity: 5,
        unit_price: 28000,
        status: "picked",
        isDelete: false,
      },

      // Order 3 (ORD-003) - Delivered
      {
        order_id: orders[8]._id,
        product_id: products[7]._id,
        quantity: 3,
        unit_price: 42000,
        status: "pending",
        isDelete: false,
      },
      {
        order_id: orders[8]._id,
        product_id: products[4]._id,
        quantity: 20,
        unit_price: 4000,
        status: "pending",
        isDelete: false,
      },

      // Order 4 (ORD-004) - Delivered
      {
        order_id: orders[12]._id,
        product_id: products[9]._id,
        quantity: 10,
        unit_price: 9500,
        status: "pending",
        isDelete: false,
      },
      {
        order_id: orders[12]._id,
        product_id: products[11]._id,
        quantity: 2,
        unit_price: 22000,
        status: "pending",
        isDelete: false,
      },

      // Order 5 (ORD-005) - Delivered
      {
        order_id: orders[1]._id,
        product_id: products[1]._id,
        quantity: 8,
        unit_price: 32000,
        status: "shipped",
        isDelete: false,
      },
      {
        order_id: orders[1]._id,
        product_id: products[3]._id,
        quantity: 2,
        unit_price: 45000,
        status: "shipped",
        isDelete: false,
      },

      // Order 6 (ORD-006) - Shipped (in_transit)
      {
        order_id: orders[5]._id,
        product_id: products[0]._id,
        quantity: 2,
        unit_price: 145000,
        status: "picked",
        isDelete: false,
      },
      {
        order_id: orders[5]._id,
        product_id: products[7]._id,
        quantity: 3,
        unit_price: 42000,
        status: "picked",
        isDelete: false,
      },

      // Order 7 (ORD-007) - Delivered
      {
        order_id: orders[9]._id,
        product_id: products[8]._id,
        quantity: 10,
        unit_price: 35000,
        status: "shipped",
        isDelete: false,
      },
      {
        order_id: orders[9]._id,
        product_id: products[2]._id,
        quantity: 15,
        unit_price: 10000,
        status: "shipped",
        isDelete: false,
      },

      // Order 8 (ORD-008) - Shipped (in_transit)
      {
        order_id: orders[13]._id,
        product_id: products[5]._id,
        quantity: 6,
        unit_price: 28000,
        status: "picked",
        isDelete: false,
      },
      {
        order_id: orders[13]._id,
        product_id: products[6]._id,
        quantity: 15,
        unit_price: 5000,
        status: "picked",
        isDelete: false,
      },

      // Order 9 (ORD-009) - Confirmed (assigned)
      {
        order_id: orders[2]._id,
        product_id: products[4]._id,
        quantity: 30,
        unit_price: 4000,
        status: "pending",
        isDelete: false,
      },
      {
        order_id: orders[2]._id,
        product_id: products[6]._id,
        quantity: 20,
        unit_price: 5000,
        status: "pending",
        isDelete: false,
      },

      // Order 10 (ORD-010) - Confirmed (assigned)
      {
        order_id: orders[6]._id,
        product_id: products[1]._id,
        quantity: 10,
        unit_price: 32000,
        status: "pending",
        isDelete: false,
      },
      {
        order_id: orders[6]._id,
        product_id: products[9]._id,
        quantity: 8,
        unit_price: 9500,
        status: "pending",
        isDelete: false,
      },

      // Order 11 (ORD-011) - Shipped (in_transit)
      {
        order_id: orders[10]._id,
        product_id: products[0]._id,
        quantity: 1,
        unit_price: 145000,
        status: "picked",
        isDelete: false,
      },
      {
        order_id: orders[10]._id,
        product_id: products[7]._id,
        quantity: 4,
        unit_price: 42000,
        status: "picked",
        isDelete: false,
      },

      // Order 12 (ORD-012) - Confirmed (assigned)
      {
        order_id: orders[14]._id,
        product_id: products[3]._id,
        quantity: 3,
        unit_price: 45000,
        status: "pending",
        isDelete: false,
      },
      {
        order_id: orders[14]._id,
        product_id: products[11]._id,
        quantity: 2,
        unit_price: 22000,
        status: "pending",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${orderItems.length} order items\n`);

    // ✅ UPDATE ORDERS WITH ORDERITEMS IDS
    console.log("   Updating orders with orderItems references...");
    for (let order of orders) {
      const itemsForOrder = orderItems.filter((oi) =>
        oi.order_id.equals(order._id)
      );
      await Order.findByIdAndUpdate(order._id, {
        orderItems: itemsForOrder.map((i) => i._id),
      });
    }
    console.log("   ✅ Orders updated with items\n");

    // 13. DELIVERY ORDERS (12 đơn giao hàng - phân cho 2 delivery staff)
    console.log("13/23 🚚 Tạo DeliveryOrders...");
    const deliveryOrders = await DeliveryOrder.insertMany([
      // DELIVERED orders - delivery1 (Lê Văn Cường - staffs[0])
      {
        order_id: orders[0]._id,
        staff_id: staffs[0]._id, // delivery1
        order_date: new Date("2024-12-01T08:00:00"),
        delivery_date: new Date("2024-12-01T10:30:00"),
        status: "delivered",
        tracking_number: "TRACK-001",
        notes: "Đã giao thành công, khách hàng ký nhận",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[4]._id,
        staff_id: staffs[0]._id, // delivery1
        order_date: new Date("2024-12-05T09:00:00"),
        delivery_date: new Date("2024-12-05T11:45:00"),
        status: "delivered",
        tracking_number: "TRACK-002",
        notes: "Giao thành công, để ở bảo vệ theo yêu cầu",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[8]._id,
        staff_id: staffs[0]._id, // delivery1
        order_date: new Date("2024-12-08T10:00:00"),
        delivery_date: new Date("2024-12-08T14:20:00"),
        status: "delivered",
        tracking_number: "TRACK-003",
        notes: "Giao cuối tuần, đã hoàn thành",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[12]._id,
        staff_id: staffs[1]._id, // delivery2
        order_date: new Date("2024-12-10T07:30:00"),
        delivery_date: new Date("2024-12-10T09:15:00"),
        status: "delivered",
        tracking_number: "TRACK-004",
        notes: "Giao sớm theo yêu cầu khách hàng",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[1]._id,
        staff_id: staffs[1]._id, // delivery2
        order_date: new Date("2024-12-12T08:30:00"),
        delivery_date: new Date("2024-12-12T10:00:00"),
        status: "delivered",
        tracking_number: "TRACK-005",
        notes: "Giao buổi sáng thành công",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[9]._id,
        staff_id: staffs[1]._id, // delivery2
        order_date: new Date("2024-12-10T09:00:00"),
        delivery_date: new Date("2024-12-10T12:30:00"),
        status: "delivered",
        tracking_number: "TRACK-007",
        notes: "Đơn hàng lớn, giao thành công",
        orderItems: [],
        isDelete: false,
      },

      // IN_TRANSIT orders - delivery1
      {
        order_id: orders[5]._id,
        staff_id: staffs[0]._id, // delivery1
        order_date: new Date("2024-12-14T08:00:00"),
        status: "in_transit",
        tracking_number: "TRACK-006",
        notes: "Đang trên đường giao, dự kiến 30 phút nữa",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[13]._id,
        staff_id: staffs[0]._id, // delivery1
        order_date: new Date("2024-12-14T09:15:00"),
        status: "in_transit",
        tracking_number: "TRACK-008",
        notes: "Đang giao tầng 3 phòng 301",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[10]._id,
        staff_id: staffs[1]._id, // delivery2
        order_date: new Date("2024-12-14T10:00:00"),
        status: "in_transit",
        tracking_number: "TRACK-011",
        notes: "Đang giao, sẽ để ở bảo vệ",
        orderItems: [],
        isDelete: false,
      },

      // ASSIGNED orders - delivery1 và delivery2
      {
        order_id: orders[2]._id,
        staff_id: staffs[0]._id, // delivery1
        order_date: new Date("2024-12-14T11:00:00"),
        status: "assigned",
        tracking_number: "TRACK-009",
        notes: "Chờ lấy hàng, giao sau 5pm theo yêu cầu",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[6]._id,
        staff_id: staffs[0]._id, // delivery1
        order_date: new Date("2024-12-14T11:30:00"),
        status: "assigned",
        tracking_number: "TRACK-010",
        notes: "Mới assign, cần gọi trước 30 phút",
        orderItems: [],
        isDelete: false,
      },
      {
        order_id: orders[14]._id,
        staff_id: staffs[1]._id, // delivery2
        order_date: new Date("2024-12-14T12:00:00"),
        status: "assigned",
        tracking_number: "TRACK-012",
        notes: "Chờ xác nhận lấy hàng",
        orderItems: [],
        isDelete: false,
      },
    ]);
    console.log(
      `   ✅ ${deliveryOrders.length} delivery orders (delivery1: 7 orders, delivery2: 5 orders)\n`
    );

    // ✅ UPDATE DELIVERY ORDERS WITH ORDERITEMS FROM ORDERS
    console.log("   Updating delivery orders with orderItems...");
    for (let delivery of deliveryOrders) {
      const order = orders.find((o) => o._id.equals(delivery.order_id));
      if (order && order.orderItems && order.orderItems.length > 0) {
        await DeliveryOrder.findByIdAndUpdate(delivery._id, {
          orderItems: order.orderItems,
        });
      }
    }
    console.log("   ✅ Delivery orders updated with items\n");

    // Ensure Staff.current_assignments matches seeded delivery orders counts
    console.log("   Reconciling staff assignment counts...");
    const assignmentCounts = await DeliveryOrder.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: "$staff_id", count: { $sum: 1 } } },
    ]);

    for (let c of assignmentCounts) {
      await Staff.findByIdAndUpdate(c._id, { current_assignments: c.count });
    }
    console.log("   ✅ Staff assignment counts reconciled");

    // 14. INVOICES (4 hóa đơn từ 4 customers)
    console.log("14/23 🧾 Tạo Invoices...");
    const invoices = await Invoice.insertMany([
      {
        invoice_number: "INV-001",
        customer_id: customers[0]._id,
        order_id: orders[0]._id,
        invoice_date: new Date("2024-12-01"),
        total_amount: 500000,
        payment_status: "paid",
        isDelete: false,
      },
      {
        invoice_number: "INV-002",
        customer_id: customers[1]._id,
        order_id: orders[1]._id,
        invoice_date: new Date("2024-12-05"),
        total_amount: 350000,
        payment_status: "paid",
        isDelete: false,
      },
      {
        invoice_number: "INV-003",
        customer_id: customers[2]._id,
        order_id: orders[2]._id,
        invoice_date: new Date("2024-12-08"),
        total_amount: 280000,
        payment_status: "unpaid",
        isDelete: false,
      },
      {
        invoice_number: "INV-004",
        customer_id: customers[3]._id,
        order_id: orders[3]._id,
        invoice_date: new Date("2024-12-10"),
        total_amount: 150000,
        payment_status: "unpaid",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${invoices.length} invoices\n`);

    // 15. INVOICE ITEMS (8 chi tiết hóa đơn)
    console.log("15/23 📄 Tạo InvoiceItems...");
    const invoiceItems = await InvoiceItem.insertMany([
      {
        invoice_id: invoices[0]._id,
        product_id: products[0]._id,
        description: "Gạo ST25 5kg",
        quantity: 2,
        unit_price: 145000,
        line_total: 290000,
        isDelete: false,
      },
      {
        invoice_id: invoices[0]._id,
        product_id: products[1]._id,
        description: "Sữa Vinamilk 1L",
        quantity: 5,
        unit_price: 32000,
        line_total: 160000,
        isDelete: false,
      },
      {
        invoice_id: invoices[1]._id,
        product_id: products[2]._id,
        description: "Coca Cola 330ml",
        quantity: 10,
        unit_price: 10000,
        line_total: 100000,
        isDelete: false,
      },
      {
        invoice_id: invoices[1]._id,
        product_id: products[6]._id,
        description: "Nước suối Lavie 500ml",
        quantity: 20,
        unit_price: 5000,
        line_total: 100000,
        isDelete: false,
      },
      {
        invoice_id: invoices[2]._id,
        product_id: products[7]._id,
        description: "Dầu ăn Simply 1L",
        quantity: 3,
        unit_price: 42000,
        line_total: 126000,
        isDelete: false,
      },
      {
        invoice_id: invoices[2]._id,
        product_id: products[4]._id,
        description: "Mì gói Hảo Hảo",
        quantity: 20,
        unit_price: 4000,
        line_total: 80000,
        isDelete: false,
      },
      {
        invoice_id: invoices[3]._id,
        product_id: products[9]._id,
        description: "Pepsi 330ml",
        quantity: 10,
        unit_price: 9500,
        line_total: 95000,
        isDelete: false,
      },
      {
        invoice_id: invoices[3]._id,
        product_id: products[11]._id,
        description: "Nước tương Chinsu 500ml",
        quantity: 2,
        unit_price: 22000,
        line_total: 44000,
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${invoiceItems.length} invoice items\n`);

    // 16. PAYMENTS (3 thanh toán từ customers)
    console.log("16/23 💳 Tạo Payments...");
    const payments = await Payment.insertMany([
      {
        payment_number: "PAY-001",
        payment_date: new Date("2024-12-01"),
        customer_id: customers[0]._id,
        order_id: orders[0]._id,
        invoice_id: invoices[0]._id,
        payment_method: "Card",
        status: "completed",
        reference: "CARD-12345",
        isDelete: false,
      },
      {
        payment_number: "PAY-002",
        payment_date: new Date("2024-12-05"),
        customer_id: customers[1]._id,
        order_id: orders[1]._id,
        invoice_id: invoices[1]._id,
        payment_method: "Cash",
        status: "completed",
        reference: "CASH-67890",
        isDelete: false,
      },
      {
        payment_number: "PAY-003",
        payment_date: new Date("2024-12-08"),
        customer_id: customers[2]._id,
        order_id: orders[2]._id,
        invoice_id: invoices[2]._id,
        payment_method: "Bank Transfer",
        status: "pending",
        reference: "BANK-11223",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${payments.length} payments\n`);

    // 17. REPORTS (3 báo cáo)
    console.log("17/23 📊 Tạo Reports...");
    const reports = await Report.insertMany([
      {
        title: "Báo cáo bán hàng tháng 11/2024",
        staff_id: staffs[0]._id,
        description: "Doanh thu tốt, tăng 15% so với tháng trước",
        report_date: new Date("2024-11-30"),
        status: "completed",
        hours_worked: 160,
        sales_amount: 50000000,
        rating: 5,
        isDelete: false,
      },
      {
        title: "Báo cáo kho hàng tháng 11/2024",
        staff_id: staffs[1]._id,
        description: "Tồn kho ổn định, cần nhập thêm sữa",
        report_date: new Date("2024-11-30"),
        status: "completed",
        hours_worked: 160,
        sales_amount: 0,
        rating: 4,
        isDelete: false,
      },
      {
        title: "Báo cáo giao hàng tháng 11/2024",
        staff_id: staffs[2]._id,
        description: "Giao hàng đúng hạn 95%",
        report_date: new Date("2024-11-30"),
        status: "completed",
        hours_worked: 180,
        sales_amount: 0,
        rating: 5,
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${reports.length} reports\n`);

    // 18. INSTRUCTIONS (3 hướng dẫn)
    console.log("18/23 📢 Tạo Instructions...");
    const instructions = await Instruction.insertMany([
      {
        title: "Hướng dẫn đóng gói hàng",
        detail:
          "Đóng gói cẩn thận, dán tem đầy đủ, kiểm tra hạn sử dụng trước khi giao",
        sent_date: new Date("2024-01-01"),
        created_by_staff_id: staffs[1]._id,
        status: "active",
        isDelete: false,
      },
      {
        title: "Quy trình xử lý khiếu nại",
        detail:
          "Tiếp nhận -> Xác minh -> Giải quyết -> Phản hồi khách hàng trong 24h",
        sent_date: new Date("2024-02-01"),
        created_by_staff_id: staffs[1]._id,
        status: "active",
        isDelete: false,
      },
      {
        title: "Hướng dẫn kiểm tra hàng hóa",
        detail: "Kiểm tra hạn sử dụng, chất lượng bao bì, nhiệt độ bảo quản",
        sent_date: new Date("2024-03-01"),
        created_by_staff_id: staffs[4]._id,
        status: "archived",
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${instructions.length} instructions\n`);

    // 19. CUSTOMER FEEDBACK (5 phản hồi từ customers)
    console.log("19/23 💬 Tạo CustomerFeedback...");
    const feedbacks = await CustomerFeedback.insertMany([
      {
        category: "praise",
        subject: "Dịch vụ xuất sắc",
        detail: "Giao hàng nhanh, nhân viên thân thiện, sản phẩm chất lượng",
        customer_id: customers[0]._id,
        status: "resolved",
        assigned_to_staff_id: staffs[1]._id,
        created_at: new Date("2024-12-01"),
        isDelete: false,
      },
      {
        category: "complaint",
        subject: "Sản phẩm bị hư hỏng",
        detail: "Trứng bị vỡ khi giao hàng, yêu cầu đổi trả",
        customer_id: customers[1]._id,
        status: "in_progress",
        assigned_to_staff_id: staffs[1]._id,
        created_at: new Date("2024-12-05"),
        isDelete: false,
      },
      {
        category: "suggestion",
        subject: "Bổ sung sản phẩm hữu cơ",
        detail: "Nên có thêm rau củ hữu cơ cho khách hàng lựa chọn",
        customer_id: customers[2]._id,
        status: "open",
        created_at: new Date("2024-12-08"),
        isDelete: false,
      },
      {
        category: "praise",
        subject: "Nhân viên nhiệt tình",
        detail: "Nhân viên giao hàng rất lịch sự và chu đáo",
        customer_id: customers[0]._id,
        status: "closed",
        assigned_to_staff_id: staffs[2]._id,
        created_at: new Date("2024-12-03"),
        isDelete: false,
      },
      {
        category: "complaint",
        subject: "Giao hàng chậm",
        detail: "Đơn hàng giao chậm hơn dự kiến 1 ngày",
        customer_id: customers[3]._id,
        status: "open",
        created_at: new Date("2024-12-10"),
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${feedbacks.length} feedbacks\n`);

    // 20. PRODUCT STOCK (8 tồn kho)
    console.log("20/23 📊 Tạo ProductStock...");
    const productStocks = await ProductStock.insertMany([
      {
        product_id: products[0]._id,
        shelf_id: shelves[0]._id,
        quantity: 100,
        status: "available",
        last_updated: new Date(),
        isDelete: false,
      },
      {
        product_id: products[1]._id,
        shelf_id: shelves[2]._id,
        quantity: 200,
        status: "available",
        last_updated: new Date(),
        isDelete: false,
      },
      {
        product_id: products[2]._id,
        shelf_id: shelves[3]._id,
        quantity: 500,
        status: "available",
        last_updated: new Date(),
        isDelete: false,
      },
      {
        product_id: products[3]._id,
        shelf_id: shelves[2]._id,
        quantity: 80,
        status: "available",
        last_updated: new Date(),
        isDelete: false,
      },
      {
        product_id: products[5]._id,
        shelf_id: shelves[1]._id,
        quantity: 150,
        status: "available",
        last_updated: new Date(),
        isDelete: false,
      },
      {
        product_id: products[6]._id,
        shelf_id: shelves[3]._id,
        quantity: 400,
        status: "available",
        last_updated: new Date(),
        isDelete: false,
      },
      {
        product_id: products[7]._id,
        shelf_id: shelves[4]._id,
        quantity: 120,
        status: "available",
        last_updated: new Date(),
        isDelete: false,
      },
      {
        product_id: products[8]._id,
        shelf_id: shelves[2]._id,
        quantity: 180,
        status: "low_stock",
        last_updated: new Date(),
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${productStocks.length} stock records\n`);

    // 21. CARTS (4 giỏ hàng từ 4 customers)
    console.log("21/23 🛒 Tạo Carts...");
    const carts = await Cart.insertMany([
      {
        customer_id: customers[0]._id,
        cartItems: [],
        status: "active",
        currency: "VND",
        subtotal: 200000,
        discounts: 0,
        total: 200000,
        last_activity_at: new Date(),
        isDelete: false,
      },
      {
        customer_id: customers[1]._id,
        cartItems: [],
        status: "checked_out",
        currency: "VND",
        subtotal: 350000,
        discounts: 50000,
        total: 300000,
        applied_promo_id: promotions[1]._id,
        checkout_at: new Date("2024-12-05"),
        isDelete: false,
      },
      {
        customer_id: customers[2]._id,
        cartItems: [],
        status: "active",
        currency: "VND",
        subtotal: 150000,
        discounts: 0,
        total: 150000,
        last_activity_at: new Date(),
        isDelete: false,
      },
      {
        customer_id: customers[3]._id,
        cartItems: [],
        status: "abandoned",
        currency: "VND",
        subtotal: 80000,
        discounts: 0,
        total: 80000,
        last_activity_at: new Date("2024-12-01"),
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${carts.length} carts\n`);

    // 22. CART ITEMS (8 sản phẩm trong giỏ từ customers)
    console.log("22/23 🛍️  Tạo CartItems...");
    const cartItems = await CartItem.insertMany([
      {
        cart_id: carts[0]._id,
        product_id: products[0]._id,
        product_name: "Gạo ST25 5kg",
        quantity: 1,
        unit: "túi",
        unit_price: 145000,
        line_total: 145000,
        status: "active",
        added_at: new Date(),
        isDelete: false,
      },
      {
        cart_id: carts[0]._id,
        product_id: products[2]._id,
        product_name: "Coca Cola 330ml",
        quantity: 5,
        unit: "lon",
        unit_price: 10000,
        line_total: 50000,
        status: "active",
        added_at: new Date(),
        isDelete: false,
      },
      {
        cart_id: carts[1]._id,
        product_id: products[1]._id,
        product_name: "Sữa Vinamilk 1L",
        quantity: 10,
        unit: "hộp",
        unit_price: 32000,
        line_total: 320000,
        status: "purchased",
        added_at: new Date("2024-12-04"),
        isDelete: false,
      },
      {
        cart_id: carts[2]._id,
        product_id: products[4]._id,
        product_name: "Mì gói Hảo Hảo",
        quantity: 20,
        unit: "gói",
        unit_price: 4000,
        line_total: 80000,
        status: "active",
        added_at: new Date(),
        isDelete: false,
      },
      {
        cart_id: carts[2]._id,
        product_id: products[6]._id,
        product_name: "Nước suối Lavie 500ml",
        quantity: 10,
        unit: "chai",
        unit_price: 5000,
        line_total: 50000,
        status: "active",
        added_at: new Date(),
        isDelete: false,
      },
      {
        cart_id: carts[3]._id,
        product_id: products[9]._id,
        product_name: "Pepsi 330ml",
        quantity: 8,
        unit: "lon",
        unit_price: 9500,
        line_total: 76000,
        status: "removed",
        added_at: new Date("2024-12-01"),
        isDelete: false,
      },
      {
        cart_id: carts[2]._id,
        product_id: products[11]._id,
        product_name: "Nước tương Chinsu 500ml",
        quantity: 1,
        unit: "chai",
        unit_price: 22000,
        line_total: 22000,
        status: "saved_for_later",
        added_at: new Date(),
        isDelete: false,
      },
      {
        cart_id: carts[0]._id,
        product_id: products[5]._id,
        product_name: "Bánh mì Kinh Đô",
        quantity: 2,
        unit: "gói",
        unit_price: 28000,
        line_total: 56000,
        status: "active",
        added_at: new Date(),
        backorder: false,
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${cartItems.length} cart items\n`);

    // ✅ UPDATE CARTS WITH CARTITEMS IDS
    console.log("   Updating carts with cartItems references...");
    for (let cart of carts) {
      const itemsForCart = cartItems.filter((ci) =>
        ci.cart_id.equals(cart._id)
      );
      await Cart.findByIdAndUpdate(cart._id, {
        cartItems: itemsForCart.map((i) => i._id),
      });
    }
    console.log("   ✅ Carts updated with items\n");

    // 23. DAMAGED PRODUCTS (3 sản phẩm hư hỏng)
    console.log("23/23 ⚠️  Tạo DamagedProducts...");
    const damagedProducts = await DamagedProduct.insertMany([
      {
        product_id: products[3]._id,
        shelf_id: shelves[5]._id, // B2 - Trứng gà shelf
        product_name: "Trứng gà",
        damaged_quantity: 5,
        unit: "vỉ",
        status: "resolved",
        description: "Vỡ khi vận chuyển",
        resolution_action: "damaged",
        inventory_adjusted: true,
        reported_at: new Date("2024-12-01"),
        resolved_at: new Date("2024-12-02"),
        isDelete: false,
      },
      {
        product_id: products[1]._id,
        shelf_id: shelves[4]._id, // B1 - Sữa Vinamilk shelf
        product_name: "Sữa Vinamilk 1L",
        damaged_quantity: 3,
        unit: "hộp",
        status: "reviewed",
        description: "Bao bì bị rách",
        resolution_action: "damaged",
        inventory_adjusted: false,
        reported_at: new Date("2024-12-05"),
        isDelete: false,
      },
      {
        product_id: products[5]._id,
        shelf_id: shelves[1]._id, // A2 - Bánh mì shelf
        product_name: "Bánh mì Kinh Đô",
        damaged_quantity: 10,
        unit: "gói",
        status: "reported",
        description: "Hết hạn sử dụng",
        resolution_action: "expired",
        inventory_adjusted: false,
        reported_at: new Date("2024-12-10"),
        isDelete: false,
      },
      {
        product_id: products[0]._id,
        shelf_id: shelves[0]._id, // A1 - Gạo ST25 shelf
        product_name: "Gạo ST25 5kg",
        damaged_quantity: 6,
        unit: "túi",
        status: "reported",
        description: "sfsdfdsfsd",
        resolution_action: "other",
        inventory_adjusted: false,
        reported_at: new Date("2024-12-15"),
        isDelete: false,
      },
    ]);
    console.log(`   ✅ ${damagedProducts.length} damaged products\n`);

    // TỔNG KẾT
    console.log("\n========================================");
    console.log("✨ SEED DATABASE HOÀN TẤT!");
    console.log("========================================");
    console.log("📊 TỔNG KẾT:");
    console.log(`   1. Accounts: ${accounts.length}`);
    console.log(`   2. Staff: ${staffs.length}`);
    console.log(`   3. Managers: ${managers.length}`);
    console.log(`   4. Customers: ${customers.length}`);
    console.log(`   5. Suppliers: ${suppliers.length}`);
    console.log(`   6. Products: ${products.length}`);
    console.log(`   7. Shelves: ${shelves.length}`);
    console.log(`   8. ProductShelves: ${productShelves.length}`);
    console.log(`   9. Promotions: ${promotions.length}`);
    console.log(`   10. PromotionProducts: ${promotionProducts.length}`);
    console.log(`   11. Orders: ${orders.length}`);
    console.log(`   12. OrderItems: ${orderItems.length}`);
    console.log(`   13. DeliveryOrders: ${deliveryOrders.length}`);
    console.log(`   14. Invoices: ${invoices.length}`);
    console.log(`   15. InvoiceItems: ${invoiceItems.length}`);
    console.log(`   16. Payments: ${payments.length}`);
    console.log(`   17. Reports: ${reports.length}`);
    console.log(`   18. Instructions: ${instructions.length}`);
    console.log(`   19. CustomerFeedback: ${feedbacks.length}`);
    console.log(`   20. ProductStock: ${productStocks.length}`);
    console.log(`   21. Carts: ${carts.length}`);
    console.log(`   22. CartItems: ${cartItems.length}`);
    console.log(`   23. DamagedProducts: ${damagedProducts.length}`);
    console.log("========================================");
    console.log("🔑 Thông tin đăng nhập:");
    console.log("   Admin: admin / password123");
    console.log("   Staff: staff1 / password123");
    console.log("   Customer: customer1-4 / password123");
    console.log("========================================\n");
  } catch (error) {
    console.error("❌ LỖI:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Đã đóng kết nối database");
    process.exit(0);
  }
}

seedDatabase();
