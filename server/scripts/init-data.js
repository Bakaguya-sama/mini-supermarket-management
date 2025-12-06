// server/scripts/init-data.js
/**
 * Script để khởi tạo dữ liệu test cho hệ thống
 * Chạy: node server/scripts/init-data.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const models = require('../models');

async function initializeData() {
  try {
    console.log('🔄 Đang kết nối đến MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini_supermarket', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Kết nối thành công');

    // Clear existing data (optional)
    console.log('🗑️  Xóa dữ liệu cũ...');
    await models.Account.deleteMany({});
    await models.Staff.deleteMany({});
    await models.Customer.deleteMany({});
    await models.Supplier.deleteMany({});
    await models.Product.deleteMany({});
    await models.Order.deleteMany({});
    await models.Invoice.deleteMany({});
    console.log('✅ Đã xóa dữ liệu cũ');

    // Create admin account
    console.log('👤 Tạo tài khoản admin...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminAccount = await models.Account.create({
      username: 'admin',
      email: 'admin@minisupermarket.com',
      passwordHash: adminPassword,
      fullName: 'Admin Account',
      phone: '0900000001',
      role: 'admin'
    });
    console.log('✅ Tài khoản admin: admin / admin123');

    // Create manager account
    console.log('👨‍💼 Tạo tài khoản quản lý...');
    const managerPassword = await bcrypt.hash('manager123', 10);
    const managerAccount = await models.Account.create({
      username: 'manager',
      email: 'manager@minisupermarket.com',
      passwordHash: managerPassword,
      fullName: 'Manager Account',
      phone: '0900000002',
      role: 'manager'
    });

    const manager = await models.Staff.create({
      accountId: managerAccount._id,
      position: 'manager',
      employmentType: 'fulltime',
      annualSalary: 30000000,
      hireDate: new Date()
    });
    console.log('✅ Tài khoản quản lý: manager / manager123');

    // Create staff accounts
    console.log('👥 Tạo tài khoản nhân viên...');
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staffAccount = await models.Account.create({
      username: 'cashier1',
      email: 'cashier1@minisupermarket.com',
      passwordHash: staffPassword,
      fullName: 'Cashier Staff',
      phone: '0900000003',
      role: 'staff'
    });

    const staff = await models.Staff.create({
      accountId: staffAccount._id,
      position: 'cashier',
      employmentType: 'fulltime',
      annualSalary: 15000000,
      hireDate: new Date()
    });
    console.log('✅ Tài khoản nhân viên: cashier1 / staff123');

    // Create customer account
    console.log('🛒 Tạo tài khoản khách hàng...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customerAccount = await models.Account.create({
      username: 'customer1',
      email: 'customer1@email.com',
      passwordHash: customerPassword,
      fullName: 'Customer Test',
      phone: '0900000004',
      role: 'customer'
    });

    const customer = await models.Customer.create({
      accountId: customerAccount._id,
      membershipType: 'regular',
      pointsBalance: 0,
      totalSpent: 0
    });
    console.log('✅ Tài khoản khách hàng: customer1 / customer123');

    // Create suppliers
    console.log('🏭 Tạo nhà cung cấp...');
    const supplier1 = await models.Supplier.create({
      name: 'Supplier ABC',
      contactPersonName: 'Nguyễn Văn A',
      email: 'supplier1@abc.com',
      phone: '0901111111',
      address: 'Hà Nội'
    });

    const supplier2 = await models.Supplier.create({
      name: 'Supplier XYZ',
      contactPersonName: 'Trần Thị B',
      email: 'supplier2@xyz.com',
      phone: '0902222222',
      address: 'TP.HCM'
    });
    console.log('✅ Đã tạo 2 nhà cung cấp');

    // Create products
    console.log('📦 Tạo sản phẩm...');
    const products = [];
    const productData = [
      { name: 'Nước Coca 500ml', price: 15000, category: 'Đồ uống', unit: 'chai', stock: 100 },
      { name: 'Bánh Mỳ', price: 30000, category: 'Thực phẩm', unit: 'cái', stock: 50 },
      { name: 'Sữa Vinamilk 1L', price: 35000, category: 'Sữa', unit: 'hộp', stock: 75 },
      { name: 'Mì Omachi', price: 12000, category: 'Thực phẩm', unit: 'gói', stock: 200 },
      { name: 'Nước Cam Натурель', price: 25000, category: 'Đồ uống', unit: 'chai', stock: 80 }
    ];

    for (let i = 0; i < productData.length; i++) {
      const supplier = i % 2 === 0 ? supplier1 : supplier2;
      const product = await models.Product.create({
        name: productData[i].name,
        price: productData[i].price,
        category: productData[i].category,
        unit: productData[i].unit,
        currentStock: productData[i].stock,
        minimumStockLevel: 10,
        maximumStockLevel: 500,
        supplierId: supplier._id,
        status: 'available'
      });
      products.push(product);
    }
    console.log('✅ Đã tạo 5 sản phẩm');

    // Create an order
    console.log('📋 Tạo đơn hàng...');
    const order = await models.Order.create({
      orderNumber: `ORD-${new Date().getFullYear()}-000001`,
      customerId: customer._id,
      totalAmount: 100000,
      status: 'confirmed'
    });

    // Create order items
    const orderItem = await models.OrderItem.create({
      orderId: order._id,
      productId: products[0]._id,
      quantity: 2,
      unitPrice: 50000
    });
    console.log('✅ Đã tạo đơn hàng');

    // Create an invoice
    console.log('💳 Tạo hóa đơn...');
    const invoice = await models.Invoice.create({
      invoiceNumber: `INV-${new Date().getFullYear()}-000001`,
      customerId: customer._id,
      orderId: order._id,
      totalAmount: 100000,
      paymentStatus: 'unpaid'
    });

    const invoiceItem = await models.InvoiceItem.create({
      invoiceId: invoice._id,
      productId: products[0]._id,
      description: 'Nước Coca 500ml x 2',
      quantity: 2,
      unitPrice: 50000,
      lineTotal: 100000
    });
    console.log('✅ Đã tạo hóa đơn');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Khởi tạo dữ liệu thành công!');
    console.log('='.repeat(50));
    console.log('\n📝 Tài khoản Test:\n');
    console.log('Admin:');
    console.log('  - Username: admin');
    console.log('  - Password: admin123\n');
    console.log('Manager:');
    console.log('  - Username: manager');
    console.log('  - Password: manager123\n');
    console.log('Staff:');
    console.log('  - Username: cashier1');
    console.log('  - Password: staff123\n');
    console.log('Customer:');
    console.log('  - Username: customer1');
    console.log('  - Password: customer123\n');
    console.log('='.repeat(50) + '\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

initializeData();
