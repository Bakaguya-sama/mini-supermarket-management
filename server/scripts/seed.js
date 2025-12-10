// scripts/seed.js - SEED ĐẦY ĐỦ 24 BẢNG
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  Account, Staff, Manager, Customer, Supplier, Product, Shelf, ProductShelf,
  Promotion, PromotionProduct, Order, OrderItem, DeliveryOrder, Invoice,
  InvoiceItem, Payment, Report, Instruction, CustomerFeedback, ProductStock,
  Cart, CartItem, DamagedProduct
} = require('../models');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-supermarket');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    await connectDB();
    console.log('\n🌱 BẮT ĐẦU SEED DATABASE ĐẦY ĐỦ...\n');
    
    // XÓA DỮ LIỆU CŨ (LUÔN LUÔN XÓA)
    console.log('🗑️  Đang xóa dữ liệu cũ...');
      await Promise.all([
        Account.deleteMany({}), Staff.deleteMany({}), Manager.deleteMany({}),
        Customer.deleteMany({}), Supplier.deleteMany({}), Product.deleteMany({}),
        Shelf.deleteMany({}), ProductShelf.deleteMany({}), Promotion.deleteMany({}),
        PromotionProduct.deleteMany({}), Order.deleteMany({}), OrderItem.deleteMany({}),
        DeliveryOrder.deleteMany({}), Invoice.deleteMany({}), InvoiceItem.deleteMany({}),
        Payment.deleteMany({}), Report.deleteMany({}), Instruction.deleteMany({}),
        CustomerFeedback.deleteMany({}), ProductStock.deleteMany({}), Cart.deleteMany({}),
        CartItem.deleteMany({}), DamagedProduct.deleteMany({})
      ]);
    console.log('✅ Đã xóa dữ liệu cũ\n');

    const password = await bcrypt.hash('password123', 10);
    
    // 1. ACCOUNTS
    console.log('1/24 👤 Tạo Accounts...');
    const accounts = await Account.insertMany([
      { username: 'admin', password_hash: password, email: 'admin@mini.vn', full_name: 'Admin', role: 'admin', is_active: true },
      { username: 'staff1', password_hash: password, email: 'staff1@mini.vn', full_name: 'Nguyễn Văn A', phone: '0987654321', role: 'staff' },
      { username: 'staff2', password_hash: password, email: 'staff2@mini.vn', full_name: 'Trần Thị B', phone: '0987654322', role: 'staff' },
      { username: 'customer1', password_hash: password, email: 'customer1@gmail.com', full_name: 'Phạm Văn C', phone: '0912345678', address: 'TP.HCM', role: 'customer' },
      { username: 'customer2', password_hash: password, email: 'customer2@gmail.com', full_name: 'Lê Thị D', phone: '0912345679', address: 'Hà Nội', role: 'customer' }
    ]);
    console.log(`   ✅ ${accounts.length} accounts\n`);

    // 2. STAFF
    console.log('2/24 👥 Tạo Staff...');
    const staffs = await Staff.insertMany([
      { account_id: accounts[1]._id, position: 'Cashier', employment_type: 'Full-time', annual_salary: 180000000, hire_date: new Date('2023-01-15'), is_active: true },
      { account_id: accounts[2]._id, position: 'Warehouse', employment_type: 'Full-time', annual_salary: 200000000, hire_date: new Date('2023-03-01'), is_active: true }
    ]);
    console.log(`   ✅ ${staffs.length} staff\n`);

    // 3. MANAGERS
    console.log('3/24 👔 Tạo Managers...');
    const managers = await Manager.insertMany([
      { staff_id: staffs[1]._id, account_id: accounts[2]._id, access_level: 'admin', is_superuser: false, permissions: { inventory: true, reports: true }, scope: 'all', assigned_since: new Date() }
    ]);
    console.log(`   ✅ ${managers.length} manager\n`);

    // 4. CUSTOMERS
    console.log('4/24 🛒 Tạo Customers...');
    const customers = await Customer.insertMany([
      { account_id: accounts[3]._id, membership_type: 'Gold', points_balance: 1500, total_spent: 5000000 },
      { account_id: accounts[4]._id, membership_type: 'Silver', points_balance: 500, total_spent: 2000000 }
    ]);
    console.log(`   ✅ ${customers.length} customers\n`);

    // 5. SUPPLIERS
    console.log('5/24 🏢 Tạo Suppliers...');
    const suppliers = await Supplier.insertMany([
      { name: 'Công ty Thực phẩm Sạch', contact_person_name: 'Nguyễn X', email: 'contact@tps.vn', phone: '0281234567', address: 'TP.HCM', tax_id: '0123456789', is_active: true },
      { name: 'Vinamilk', contact_person_name: 'Trần Y', email: 'b2b@vinamilk.vn', phone: '0283456789', address: 'TP.HCM', tax_id: '1122334455', is_active: true }
    ]);
    console.log(`   ✅ ${suppliers.length} suppliers\n`);

    // 6. PRODUCTS
    console.log('6/24 📦 Tạo Products...');
    const products = await Product.insertMany([
      { name: 'Gạo ST25 5kg', description: 'Gạo thơm cao cấp', unit: 'túi', current_stock: 100, minimum_stock_level: 20, maximum_stock_level: 200, price: 145000, status: 'active', supplier_id: suppliers[0]._id, category: 'Lương thực' },
      { name: 'Sữa Vinamilk 1L', description: 'Sữa tươi tiệt trùng', unit: 'hộp', current_stock: 200, minimum_stock_level: 50, maximum_stock_level: 500, price: 32000, status: 'active', supplier_id: suppliers[1]._id, category: 'Sữa' },
      { name: 'Coca Cola 330ml', description: 'Nước giải khát', unit: 'lon', current_stock: 500, minimum_stock_level: 100, maximum_stock_level: 1000, price: 10000, status: 'active', supplier_id: suppliers[0]._id, category: 'Đồ uống' },
      { name: 'Trứng gà', description: 'Trứng tươi sạch', unit: 'vỉ', current_stock: 80, minimum_stock_level: 20, maximum_stock_level: 150, price: 45000, status: 'active', supplier_id: suppliers[0]._id, category: 'Thực phẩm tươi' }
    ]);
    console.log(`   ✅ ${products.length} products\n`);

    // 7. SHELVES
    console.log('7/24 📚 Tạo Shelves...');
    const shelves = await Shelf.insertMany([
      { shelf_number: 'A1', category: 'Lương thực', capacity: 500, isfull: false },
      { shelf_number: 'B1', category: 'Sữa', capacity: 300, isfull: false },
      { shelf_number: 'C1', category: 'Đồ uống', capacity: 1000, isfull: false }
    ]);
    console.log(`   ✅ ${shelves.length} shelves\n`);

    // 8. PRODUCT SHELVES
    console.log('8/24 📍 Tạo ProductShelves...');
    const productShelves = await ProductShelf.insertMany([
      { product_id: products[0]._id, shelf_id: shelves[0]._id, quantity: 100 },
      { product_id: products[1]._id, shelf_id: shelves[1]._id, quantity: 200 },
      { product_id: products[2]._id, shelf_id: shelves[2]._id, quantity: 500 }
    ]);
    console.log(`   ✅ ${productShelves.length} product-shelf links\n`);

    // 9. PROMOTIONS
    console.log('9/24 🎁 Tạo Promotions...');
    const promotions = await Promotion.insertMany([
      { name: 'Khuyến mãi Tết', description: 'Giảm 20%', promotion_type: 'percentage', discount_value: 20, minimum_purchase_amount: 500000, promo_code: 'TET2024', start_date: new Date('2024-01-20'), end_date: new Date('2024-02-15'), status: 'active' },
      { name: 'Flash Sale', description: 'Giảm 50k', promotion_type: 'fixed', discount_value: 50000, minimum_purchase_amount: 300000, promo_code: 'FLASH50', start_date: new Date(), end_date: new Date('2024-12-31'), status: 'active' }
    ]);
    console.log(`   ✅ ${promotions.length} promotions\n`);

    // 10. PROMOTION PRODUCTS
    console.log('10/24 🏷️  Tạo PromotionProducts...');
    const promotionProducts = await PromotionProduct.insertMany([
      { promotion_id: promotions[0]._id, product_id: products[0]._id, discount_override: 25 },
      { promotion_id: promotions[1]._id, product_id: products[2]._id, discount_override: null }
    ]);
    console.log(`   ✅ ${promotionProducts.length} promotion-product links\n`);

    // 11. ORDERS
    console.log('11/24 📋 Tạo Orders...');
    const orders = await Order.insertMany([
      { order_number: 'ORD-001', customer_id: customers[0]._id, order_date: new Date(), status: 'pending', total_amount: 500000, notes: 'Giao giờ hành chính' },
      { order_number: 'ORD-002', customer_id: customers[1]._id, order_date: new Date(), status: 'confirmed', total_amount: 300000, tracking_number: 'TRACK-001' }
    ]);
    console.log(`   ✅ ${orders.length} orders\n`);

    // 12. ORDER ITEMS
    console.log('12/24 📦 Tạo OrderItems...');
    const orderItems = await OrderItem.insertMany([
      { order_id: orders[0]._id, product_id: products[0]._id, quantity: 2, unit_price: 145000, status: 'pending' },
      { order_id: orders[0]._id, product_id: products[1]._id, quantity: 5, unit_price: 32000, status: 'pending' },
      { order_id: orders[1]._id, product_id: products[2]._id, quantity: 10, unit_price: 10000, status: 'picked' }
    ]);
    console.log(`   ✅ ${orderItems.length} order items\n`);

    // 13. DELIVERY ORDERS
    console.log('13/24 🚚 Tạo DeliveryOrders...');
    const deliveryOrders = await DeliveryOrder.insertMany([
      { order_id: orders[1]._id, staff_id: staffs[0]._id, order_date: new Date(), status: 'assigned', tracking_number: 'TRACK-001', notes: 'Giao trước 5PM' }
    ]);
    console.log(`   ✅ ${deliveryOrders.length} delivery orders\n`);

    // 14. INVOICES
    console.log('14/24 🧾 Tạo Invoices...');
    const invoices = await Invoice.insertMany([
      { invoice_number: 'INV-001', customer_id: customers[0]._id, order_id: orders[0]._id, invoice_date: new Date(), total_amount: 500000, payment_status: 'unpaid' },
      { invoice_number: 'INV-002', customer_id: customers[1]._id, order_id: orders[1]._id, invoice_date: new Date(), total_amount: 300000, payment_status: 'paid' }
    ]);
    console.log(`   ✅ ${invoices.length} invoices\n`);

    // 15. INVOICE ITEMS
    console.log('15/24 📄 Tạo InvoiceItems...');
    const invoiceItems = await InvoiceItem.insertMany([
      { invoice_id: invoices[0]._id, product_id: products[0]._id, description: 'Gạo ST25', quantity: 2, unit_price: 145000, line_total: 290000 },
      { invoice_id: invoices[1]._id, product_id: products[2]._id, description: 'Coca Cola', quantity: 10, unit_price: 10000, line_total: 100000 }
    ]);
    console.log(`   ✅ ${invoiceItems.length} invoice items\n`);

    // 16. PAYMENTS
    console.log('16/24 💳 Tạo Payments...');
    const payments = await Payment.insertMany([
      { payment_number: 'PAY-001', payment_date: new Date(), customer_id: customers[1]._id, order_id: orders[1]._id, invoice_id: invoices[1]._id, payment_method: 'Card', status: 'completed', reference: 'CARD-12345' }
    ]);
    console.log(`   ✅ ${payments.length} payments\n`);

    // 17. REPORTS
    console.log('17/24 📊 Tạo Reports...');
    const reports = await Report.insertMany([
      { title: 'Báo cáo bán hàng tháng 11', staff_id: staffs[0]._id, description: 'Doanh thu tốt', report_date: new Date(), status: 'completed', hours_worked: 160, sales_amount: 50000000, rating: 5 }
    ]);
    console.log(`   ✅ ${reports.length} reports\n`);

    // 18. INSTRUCTIONS
    console.log('18/24 📢 Tạo Instructions...');
    const instructions = await Instruction.insertMany([
      { title: 'Hướng dẫn đóng gói', detail: 'Đóng gói cẩn thận, dán tem đầy đủ', sent_date: new Date(), created_by_staff_id: staffs[1]._id, status: 'active' }
    ]);
    console.log(`   ✅ ${instructions.length} instructions\n`);

    // 19. CUSTOMER FEEDBACK
    console.log('19/24 💬 Tạo CustomerFeedback...');
    const feedbacks = await CustomerFeedback.insertMany([
      { category: 'praise', subject: 'Dịch vụ tốt', detail: 'Giao hàng nhanh, nhân viên thân thiện', customer_id: customers[0]._id, status: 'open' },
      { category: 'complaint', subject: 'Sản phẩm hỏng', detail: 'Trứng bị vỡ khi giao', customer_id: customers[1]._id, status: 'in_progress', assigned_to_staff_id: staffs[1]._id }
    ]);
    console.log(`   ✅ ${feedbacks.length} feedbacks\n`);

    // 20. PRODUCT STOCK
    console.log('20/24 📊 Tạo ProductStock...');
    const productStocks = await ProductStock.insertMany([
      { product_id: products[0]._id, shelf_id: shelves[0]._id, quantity: 100, status: 'available', last_updated: new Date() },
      { product_id: products[1]._id, shelf_id: shelves[1]._id, quantity: 200, status: 'available', last_updated: new Date() }
    ]);
    console.log(`   ✅ ${productStocks.length} stock records\n`);

    // 21. CARTS
    console.log('21/24 🛒 Tạo Carts...');
    const carts = await Cart.insertMany([
      { customer_id: customers[0]._id, status: 'active', currency: 'VND', subtotal: 200000, discounts: 0, total: 200000, last_activity_at: new Date() },
      { customer_id: customers[1]._id, status: 'checked_out', currency: 'VND', subtotal: 100000, discounts: 10000, total: 90000, applied_promo_id: promotions[1]._id }
    ]);
    console.log(`   ✅ ${carts.length} carts\n`);

    // 22. CART ITEMS
    console.log('22/24 🛍️  Tạo CartItems...');
    const cartItems = await CartItem.insertMany([
      { cart_id: carts[0]._id, product_id: products[0]._id, product_name: 'Gạo ST25 5kg', quantity: 1, unit: 'túi', unit_price: 145000, line_total: 145000, status: 'active', added_at: new Date() },
      { cart_id: carts[0]._id, product_id: products[2]._id, product_name: 'Coca Cola', quantity: 5, unit: 'lon', unit_price: 10000, line_total: 50000, status: 'active', added_at: new Date() }
    ]);
    console.log(`   ✅ ${cartItems.length} cart items\n`);

    // 23. DAMAGED PRODUCTS
    console.log('23/24 ⚠️  Tạo DamagedProducts...');
    const damagedProducts = await DamagedProduct.insertMany([
      { product_id: products[3]._id, product_name: 'Trứng gà', damaged_quantity: 5, unit: 'vỉ', status: 'reported', description: 'Vỡ khi vận chuyển', resolution_action: 'discard', inventory_adjusted: false }
    ]);
    console.log(`   ✅ ${damagedProducts.length} damaged products\n`);

    // TỔNG KẾT
    console.log('\n========================================');
    console.log('✨ SEED DATABASE HOÀN TẤT!');
    console.log('========================================');
    console.log('📊 TỔNG KẾT:');
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
    console.log('========================================');
    console.log('🔑 Thông tin đăng nhập:');
    console.log('   Admin: admin / password123');
    console.log('   Staff: staff1 / password123');
    console.log('   Customer: customer1 / password123');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ LỖI:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Đã đóng kết nối database');
    process.exit(0);
  }
}

seedDatabase();