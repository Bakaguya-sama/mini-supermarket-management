// server/scripts/init-db.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

console.log('🚀 Bắt đầu khởi tạo database...');
console.log('📁 Đang load models...');

const models = require('../models');

console.log('✅ Models loaded successfully');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket';
console.log('🔗 MongoDB URI:', MONGODB_URI);

async function initDatabase() {
  try {
    console.log('⏳ Đang kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');
    
    // Xóa dữ liệu cũ
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    await Promise.all([
      models.Account.deleteMany({}),
      models.Staff.deleteMany({}),
      models.Manager.deleteMany({}),
      models.Customer.deleteMany({}),
      models.Supplier.deleteMany({}),
      models.Product.deleteMany({}),
      models.Shelf.deleteMany({}),
      models.ProductShelf.deleteMany({}),
      models.Promotion.deleteMany({}),
      models.PromotionProduct.deleteMany({}),
      models.Cart.deleteMany({}),
      models.CartItem.deleteMany({}),
      models.Order.deleteMany({}),
      models.OrderItem.deleteMany({}),
      models.DeliveryOrder.deleteMany({}),
      models.Payment.deleteMany({}),
      models.Invoice.deleteMany({}),
      models.InvoiceItem.deleteMany({}),
      models.ProductStock.deleteMany({}),
      models.DamagedProduct.deleteMany({}),
      models.Report.deleteMany({}),
      models.Instruction.deleteMany({}),
      models.CustomerFeedback.deleteMany({})
    ]);
    console.log('✅ Đã xóa dữ liệu cũ\n');

    // TẠO ACCOUNTS
    console.log('👥 Đang tạo Accounts...');
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const accounts = await models.Account.insertMany([
      {
        username: 'admin',
        passwordHash: hashedPassword,
        email: 'admin@minimart.com',
        fullName: 'Administrator',
        phone: '0901234567',
        role: 'admin'
      },
      {
        username: 'manager1',
        passwordHash: hashedPassword,
        email: 'manager1@minimart.com',
        fullName: 'Nguyen Van Manager',
        phone: '0901234568',
        role: 'manager'
      },
      {
        username: 'cashier1',
        passwordHash: hashedPassword,
        email: 'cashier@minimart.com',
        fullName: 'Tran Thi Thu',
        phone: '0901234569',
        role: 'staff'
      },
      {
        username: 'warehouse1',
        passwordHash: hashedPassword,
        email: 'warehouse@minimart.com',
        fullName: 'Le Van Warehouse',
        phone: '0901234570',
        role: 'staff'
      },
      {
        username: 'customer1',
        passwordHash: hashedPassword,
        email: 'customer1@gmail.com',
        fullName: 'Le Van Khach',
        phone: '0909876543',
        address: '123 Nguyen Hue, Q1, TPHCM',
        role: 'customer'
      },
      {
        username: 'customer2',
        passwordHash: hashedPassword,
        email: 'customer2@gmail.com',
        fullName: 'Pham Thi Mai',
        phone: '0909876544',
        address: '456 Le Loi, Q3, TPHCM',
        role: 'customer'
      }
    ]);
    console.log(`✅ Đã tạo ${accounts.length} accounts`);

    // TẠO STAFF
    console.log('👔 Đang tạo Staff...');
    const staffList = await models.Staff.insertMany([
      {
        accountId: accounts[1]._id,
        position: 'manager',
        employmentType: 'fulltime',
        annualSalary: 300000000,
        hireDate: new Date('2023-01-01')
      },
      {
        accountId: accounts[2]._id,
        position: 'cashier',
        employmentType: 'fulltime',
        annualSalary: 120000000,
        hireDate: new Date('2023-03-15')
      },
      {
        accountId: accounts[3]._id,
        position: 'warehouse',
        employmentType: 'fulltime',
        annualSalary: 150000000,
        hireDate: new Date('2023-02-01')
      }
    ]);
    console.log(`✅ Đã tạo ${staffList.length} staff`);

    // TẠO MANAGERS (Separate table)
    console.log('👑 Đang tạo Managers...');
    const managers = await models.Manager.insertMany([
      {
        staffId: staffList[0]._id,
        accountId: accounts[1]._id,
        accessLevel: 'admin',
        isSuperuser: false,
        permissions: { canApprove: true, canDelete: true, canViewReports: true },
        scope: 'all',
        assignedSince: new Date('2023-01-01'),
        bio: 'Experienced manager with 10+ years in retail'
      }
    ]);
    console.log(`✅ Đã tạo ${managers.length} managers`);

    // TẠO CUSTOMERS
    console.log('🛒 Đang tạo Customers...');
    const customers = await models.Customer.insertMany([
      {
        accountId: accounts[3]._id,
        membershipType: 'gold',
        pointsBalance: 1500,
        totalSpent: 15000000
      },
      {
        accountId: accounts[4]._id,
        membershipType: 'silver',
        pointsBalance: 800,
        totalSpent: 8000000
      }
    ]);
    console.log(`✅ Đã tạo ${customers.length} customers`);

    // TẠO SUPPLIERS
    console.log('🏭 Đang tạo Suppliers...');
    const suppliers = await models.Supplier.insertMany([
      {
        name: 'Vinamilk',
        contactPersonName: 'Nguyen Van A',
        email: 'contact@vinamilk.com',
        phone: '0281234567',
        address: 'Binh Thanh, TPHCM',
        isActive: true
      },
      {
        name: 'Coca Cola Vietnam',
        contactPersonName: 'Tran Thi B',
        email: 'sales@cocacola.vn',
        phone: '0281234568',
        address: 'Q1, TPHCM',
        isActive: true
      },
      {
        name: 'Unilever Vietnam',
        contactPersonName: 'Le Van C',
        email: 'info@unilever.vn',
        phone: '0281234569',
        address: 'Q7, TPHCM',
        isActive: true
      }
    ]);
    console.log(`✅ Đã tạo ${suppliers.length} suppliers`);

    // TẠO SHELVES
    console.log('📦 Đang tạo Shelves...');
    const shelves = await models.Shelf.insertMany([
      { shelfNumber: 'A-01', category: 'Dairy', capacity: 100, isFull: false },
      { shelfNumber: 'A-02', category: 'Dairy', capacity: 100, isFull: false },
      { shelfNumber: 'B-01', category: 'Beverages', capacity: 150, isFull: false },
      { shelfNumber: 'B-02', category: 'Beverages', capacity: 150, isFull: false },
      { shelfNumber: 'C-01', category: 'Personal Care', capacity: 80, isFull: false },
      { shelfNumber: 'D-01', category: 'Snacks', capacity: 120, isFull: false }
    ]);
    console.log(`✅ Đã tạo ${shelves.length} shelves`);

    // TẠO PRODUCTS
    console.log('🛍️  Đang tạo Products...');
    const products = await models.Product.insertMany([
      {
        name: 'Sữa tươi Vinamilk 1L',
        description: 'Sữa tươi nguyên kem không đường',
        unit: 'hộp',
        currentStock: 100,
        minimumStockLevel: 20,
        price: 32000,
        status: 'available',
        supplierId: suppliers[0]._id,
        category: 'Dairy',
        stockLocations: [
          { shelfId: shelves[0]._id, quantity: 60, status: 'good' },
          { shelfId: shelves[1]._id, quantity: 40, status: 'good' }
        ]
      },
      {
        name: 'Coca Cola 330ml',
        description: 'Nước ngọt có gas',
        unit: 'lon',
        currentStock: 200,
        minimumStockLevel: 50,
        price: 10000,
        status: 'available',
        supplierId: suppliers[1]._id,
        category: 'Beverages',
        stockLocations: [
          { shelfId: shelves[2]._id, quantity: 120, status: 'good' },
          { shelfId: shelves[3]._id, quantity: 80, status: 'good' }
        ]
      },
      {
        name: 'Pepsi 330ml',
        description: 'Nước ngọt có gas',
        unit: 'lon',
        currentStock: 180,
        minimumStockLevel: 50,
        price: 10000,
        status: 'available',
        supplierId: suppliers[1]._id,
        category: 'Beverages',
        stockLocations: [
          { shelfId: shelves[2]._id, quantity: 100, status: 'good' },
          { shelfId: shelves[3]._id, quantity: 80, status: 'good' }
        ]
      },
      {
        name: 'Kem đánh răng Closeup 150g',
        description: 'Kem đánh răng bạc hà',
        unit: 'tuýp',
        currentStock: 80,
        minimumStockLevel: 15,
        price: 25000,
        status: 'available',
        supplierId: suppliers[2]._id,
        category: 'Personal Care',
        stockLocations: [
          { shelfId: shelves[4]._id, quantity: 80, status: 'good' }
        ]
      },
      {
        name: 'Dầu gội Clear 650ml',
        description: 'Dầu gội sạch gàu cho nam',
        unit: 'chai',
        currentStock: 60,
        minimumStockLevel: 10,
        price: 89000,
        status: 'available',
        supplierId: suppliers[2]._id,
        category: 'Personal Care',
        stockLocations: [
          { shelfId: shelves[4]._id, quantity: 60, status: 'good' }
        ]
      },
      {
        name: 'Bánh Oreo 137g',
        description: 'Bánh quy socola kem vani',
        unit: 'gói',
        currentStock: 150,
        minimumStockLevel: 30,
        price: 18000,
        status: 'available',
        supplierId: suppliers[0]._id,
        category: 'Snacks',
        stockLocations: [
          { shelfId: shelves[5]._id, quantity: 150, status: 'good' }
        ]
      }
    ]);
    console.log(`✅ Đã tạo ${products.length} products`);

    // TẠO PRODUCT SHELVES (Junction table)
    console.log('📦 Đang tạo ProductShelves...');
    const productShelves = await models.ProductShelf.insertMany([
      { productId: products[0]._id, shelfId: shelves[0]._id, quantity: 60 },
      { productId: products[0]._id, shelfId: shelves[1]._id, quantity: 40 },
      { productId: products[1]._id, shelfId: shelves[2]._id, quantity: 120 },
      { productId: products[1]._id, shelfId: shelves[3]._id, quantity: 80 },
      { productId: products[2]._id, shelfId: shelves[2]._id, quantity: 100 },
      { productId: products[3]._id, shelfId: shelves[4]._id, quantity: 80 },
      { productId: products[4]._id, shelfId: shelves[4]._id, quantity: 60 },
      { productId: products[5]._id, shelfId: shelves[5]._id, quantity: 150 }
    ]);
    console.log(`✅ Đã tạo ${productShelves.length} product-shelf relationships`);

    // TẠO DAMAGED PRODUCTS (NEW)
    console.log('⚠️  Đang tạo DamagedProducts...');
    const damagedProducts = await models.DamagedProduct.insertMany([
      {
        productId: products[0]._id,
        productName: products[0].name,
        damagedQuantity: 5,
        unit: products[0].unit,
        status: 'reported',
        description: 'Sản phẩm bị hư hộp do vận chuyển',
        imageUrls: [],
        resolutionAction: null,
        inventoryAdjusted: false,
        notes: 'Cần kiểm tra kỹ'
      },
      {
        productId: products[5]._id,
        productName: products[5].name,
        damagedQuantity: 10,
        unit: products[5].unit,
        status: 'expired',
        description: 'Sản phẩm đã hết hạn sử dụng',
        imageUrls: [],
        resolutionAction: 'discard',
        inventoryAdjusted: true,
        notes: 'Đã loại bỏ'
      }
    ]);
    console.log(`✅ Đã tạo ${damagedProducts.length} damaged products`);

    // TẠO PROMOTIONS
    console.log('🎉 Đang tạo Promotions...');
    const promotions = await models.Promotion.insertMany([
      {
        name: 'Giảm giá cuối tuần',
        description: 'Giảm 15% tất cả sản phẩm',
        promotionType: 'percentage',
        discountValue: 15,
        minimumPurchaseAmount: 100000,
        promoCode: 'WEEKEND15',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        applicableProducts: products.map(p => ({ productId: p._id }))
      }
    ]);
    console.log(`✅ Đã tạo ${promotions.length} promotions`);

    // TẠO PROMOTION PRODUCTS (Junction table)
    console.log('🎁 Đang tạo PromotionProducts...');
    const promotionProducts = await models.PromotionProduct.insertMany(
      products.map(p => ({
        promotionId: promotions[0]._id,
        productId: p._id,
        discountOverride: null
      }))
    );
    console.log(`✅ Đã tạo ${promotionProducts.length} promotion-product relationships`);

    // TẠO ORDERS MẪU
    console.log('📋 Đang tạo Orders...');
    const orders = await models.Order.insertMany([
      {
        orderNumber: 'ORD-2024-001',
        customerId: customers[0]._id,
        orderDate: new Date('2024-12-01'),
        status: 'delivered',
        totalAmount: (5 * products[0].price) + (10 * products[1].price),
        trackingNumber: 'TRK-001'
      }
    ]);
    console.log(`✅ Đã tạo ${orders.length} orders`);

    // TẠO ORDER ITEMS
    console.log('📦 Đang tạo OrderItems...');
    const orderItems = await models.OrderItem.insertMany([
      {
        orderId: orders[0]._id,
        productId: products[0]._id,
        quantity: 5,
        unitPrice: products[0].price,
        status: 'shipped',
        warehouseIssuedByStaffId: staffList[2]._id
      },
      {
        orderId: orders[0]._id,
        productId: products[1]._id,
        quantity: 10,
        unitPrice: products[1].price,
        status: 'shipped',
        warehouseIssuedByStaffId: staffList[2]._id
      }
    ]);
    console.log(`✅ Đã tạo ${orderItems.length} order items`);

    // TẠO DELIVERY ORDERS
    console.log('🚚 Đang tạo DeliveryOrders...');
    const deliveryOrders = await models.DeliveryOrder.insertMany([
      {
        orderId: orders[0]._id,
        staffId: staffList[2]._id,
        deliveryDate: new Date('2024-12-02'),
        status: 'delivered',
        trackingNumber: 'TRK-001'
      }
    ]);
    console.log(`✅ Đã tạo ${deliveryOrders.length} delivery orders`);

    // THỐNG KÊ
    console.log('\n🎉 KHỞI TẠO DATABASE HOÀN TẤT!\n');
    console.log('📊 THỐNG KÊ:');
    console.log(`   ├─ Accounts: ${await models.Account.countDocuments()}`);
    console.log(`   ├─ Staff: ${await models.Staff.countDocuments()}`);
    console.log(`   ├─ Managers: ${await models.Manager.countDocuments()}`);
    console.log(`   ├─ Customers: ${await models.Customer.countDocuments()}`);
    console.log(`   ├─ Suppliers: ${await models.Supplier.countDocuments()}`);
    console.log(`   ├─ Products: ${await models.Product.countDocuments()}`);
    console.log(`   ├─ Shelves: ${await models.Shelf.countDocuments()}`);
    console.log(`   ├─ ProductShelves: ${await models.ProductShelf.countDocuments()}`);
    console.log(`   ├─ DamagedProducts: ${await models.DamagedProduct.countDocuments()}`);
    console.log(`   ├─ Promotions: ${await models.Promotion.countDocuments()}`);
    console.log(`   ├─ PromotionProducts: ${await models.PromotionProduct.countDocuments()}`);
    console.log(`   ├─ Orders: ${await models.Order.countDocuments()}`);
    console.log(`   ├─ OrderItems: ${await models.OrderItem.countDocuments()}`);
    console.log(`   └─ DeliveryOrders: ${await models.DeliveryOrder.countDocuments()}\n`);

    console.log('📝 THÔNG TIN ĐĂNG NHẬP:');
    console.log('   👑 Admin:    username: admin     | password: 123456');
    console.log('   👔 Manager:  username: manager1  | password: 123456');
    console.log('   💼 Staff:    username: cashier1  | password: 123456');
    console.log('   🛒 Customer: username: customer1 | password: 123456\n');

  } catch (error) {
    console.error('❌ LỖI KHI KHỞI TẠO DATABASE:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('👋 Đã đóng kết nối database');
    } catch (err) {
      console.error('Lỗi khi đóng connection:', err);
    }
    process.exit(0);
  }
}

console.log('🎬 Gọi hàm initDatabase()...');
initDatabase()
  .then(() => {
    console.log('✅ Script hoàn thành');
  })
  .catch((err) => {
    console.error('❌ Lỗi không mong đợi:', err);
    process.exit(1);
  });