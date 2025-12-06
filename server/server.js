// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const models = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const staffRoutes = require('./routes/staff.routes');
const productRoutes = require('./routes/product.routes');
const supplierRoutes = require('./routes/supplier.routes');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');
const invoiceRoutes = require('./routes/invoice.routes');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== KẾT NỐI DATABASE ====================
// Database connection happens in startServer() below

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
  res.json({ 
    message: '🏪 Mini Supermarket API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      staff: '/api/staff',
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
      suppliers: '/api/suppliers',
      carts: '/api/carts',
      promotions: '/api/promotions'
    }
  });
});

// ==================== ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);

// ==================== PRODUCTS API ====================

// GET tất cả sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const products = await models.Product.find(query)
      .populate('supplierId', 'name phone')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      count: products.length,
      data: products 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET 1 sản phẩm
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await models.Product.findById(req.params.id)
      .populate('supplierId');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy sản phẩm' 
      });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST tạo sản phẩm mới
app.post('/api/products', async (req, res) => {
  try {
    const product = await models.Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT cập nhật sản phẩm
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await models.Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy sản phẩm' 
      });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE xóa sản phẩm
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await models.Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy sản phẩm' 
      });
    }
    
    res.json({ success: true, message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ORDERS API ====================

// GET tất cả đơn hàng
app.get('/api/orders', async (req, res) => {
  try {
    const { status, customerId, limit = 50 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    
    const orders = await models.Order.find(query)
      .populate('customerId', 'fullName email phone')
      .populate('items.productId', 'name price')
      .sort({ orderDate: -1 })
      .limit(parseInt(limit));
    
    res.json({ 
      success: true, 
      count: orders.length,
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET 1 đơn hàng
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await models.Order.findById(req.params.id)
      .populate('customerId')
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy đơn hàng' 
      });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST tạo đơn hàng
app.post('/api/orders', async (req, res) => {
  try {
    // Generate order number
    const count = await models.Order.countDocuments();
    req.body.orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    
    const order = await models.Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== CUSTOMERS API ====================

// GET tất cả khách hàng
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await models.Customer.find()
      .populate('accountId', 'username email fullName phone address')
      .limit(50);
    
    res.json({ 
      success: true, 
      count: customers.length,
      data: customers 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SUPPLIERS API ====================

// GET tất cả nhà cung cấp
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await models.Supplier.find({ isActive: true });
    
    res.json({ 
      success: true, 
      count: suppliers.length,
      data: suppliers 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CARTS API ====================

// GET giỏ hàng của customer
app.get('/api/carts/:customerId', async (req, res) => {
  try {
    const cart = await models.Cart.findOne({ 
      customerId: req.params.customerId,
      status: 'active'
    }).populate('items.productId', 'name price unit');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST thêm sản phẩm vào giỏ
app.post('/api/carts/add', async (req, res) => {
  try {
    const { customerId, productId, quantity } = req.body;
    
    // Tìm hoặc tạo giỏ hàng
    let cart = await models.Cart.findOne({ 
      customerId, 
      status: 'active' 
    });
    
    if (!cart) {
      cart = await models.Cart.create({ 
        customerId, 
        items: [] 
      });
    }
    
    // Lấy thông tin sản phẩm
    const product = await models.Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy sản phẩm' 
      });
    }
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.lineTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        quantity,
        unit: product.unit,
        unitPrice: product.price,
        lineTotal: quantity * product.price
      });
    }
    
    // Tính lại tổng
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    cart.total = cart.subtotal - cart.discounts;
    cart.lastActivityAt = new Date();
    
    await cart.save();
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== PROMOTIONS API ====================

// GET khuyến mãi đang active
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await models.Promotion.find({ 
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    res.json({ 
      success: true, 
      count: promotions.length,
      data: promotions 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route không tồn tại' 
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🏪  MINI SUPERMARKET API SERVER');
      console.log('='.repeat(50));
      console.log(`🚀 Server:      http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 CORS:        ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log('\n📚 API Endpoints:');
      console.log('   STAFF:');
      console.log('      GET    /api/staff');
      console.log('      GET    /api/staff/:id');
      console.log('      POST   /api/staff');
      console.log('      PUT    /api/staff/:id');
      console.log('      DELETE /api/staff/:id');
      console.log('   PRODUCTS:');
      console.log('      GET    /api/products');
      console.log('      GET    /api/products/:id');
      console.log('      POST   /api/products');
      console.log('      PUT    /api/products/:id');
      console.log('      PUT    /api/products/:id/stock');
      console.log('      DELETE /api/products/:id');
      console.log('   SUPPLIERS:');
      console.log('      GET    /api/suppliers');
      console.log('      GET    /api/suppliers/:id');
      console.log('      POST   /api/suppliers');
      console.log('      PUT    /api/suppliers/:id');
      console.log('      DELETE /api/suppliers/:id');
      console.log('   ORDERS:');
      console.log('      GET    /api/orders');
      console.log('      GET    /api/orders/:id');
      console.log('      POST   /api/orders');
      console.log('      PUT    /api/orders/:id');
      console.log('      PUT    /api/orders/:id/status');
      console.log('      DELETE /api/orders/:id');
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Export app for testing
module.exports = app;