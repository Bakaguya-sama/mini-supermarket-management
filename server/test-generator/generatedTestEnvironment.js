const fs = require('fs');
const path = require('path');
const { BadRequestError } = require('../middleware/errorClasses');

function mockCreateDocument(seed = {}) {
  const base = {
    _id: '507f1f77bcf86cd799439012',
    id: '507f1f77bcf86cd799439012',
    ...seed,
  };

  return {
    ...base,
    toObject() {
      return { ...base };
    },
    populate() {
      return Promise.resolve(this);
    },
    save() {
      return Promise.resolve(this);
    },
  };
}

function mockCreateQueryResult(items = []) {
  const value = Array.isArray(items) ? items : [items];
  const chain = {
    populate() {
      return chain;
    },
    sort() {
      return chain;
    },
    skip() {
      return chain;
    },
    limit() {
      return chain;
    },
    lean() {
      return Promise.resolve(value.map((item) => ({ ...item })));
    },
    exec() {
      return Promise.resolve(value.map((item) => ({ ...item })));
    },
    then(resolve, reject) {
      return Promise.resolve(value.map((item) => ({ ...item }))).then(resolve, reject);
    },
    catch(reject) {
      return Promise.resolve(value.map((item) => ({ ...item }))).catch(reject);
    },
  };

  return chain;
}

function mockCreateModel(modelName) {
  const methodHandlers = {
    find() {
      return mockCreateQueryResult([{ _id: '507f1f77bcf86cd799439012', model: modelName }]);
    },
    findById() {
      return Promise.resolve(mockCreateDocument({ model: modelName }));
    },
    findOne() {
      return mockCreateQueryResult([mockCreateDocument({ model: modelName })]);
    },
    create(data = {}) {
      return Promise.resolve(mockCreateDocument({ ...data, model: modelName }));
    },
    countDocuments() {
      return Promise.resolve(1);
    },
    aggregate() {
      return Promise.resolve([]);
    },
    findByIdAndDelete() {
      return Promise.resolve(mockCreateDocument({ model: modelName }));
    },
    findByIdAndUpdate(id, update = {}) {
      return Promise.resolve(mockCreateDocument({ _id: id, ...update, model: modelName }));
    },
    updateOne() {
      return Promise.resolve({ acknowledged: true, modifiedCount: 1 });
    },
    updateMany() {
      return Promise.resolve({ acknowledged: true, modifiedCount: 1 });
    },
    deleteMany() {
      return Promise.resolve({ acknowledged: true, deletedCount: 1 });
    },
    exists() {
      return Promise.resolve(false);
    },
  };

  return new Proxy({}, {
    get(target, property) {
      if (property === '__esModule') {
        return true;
      }

      if (property in methodHandlers) {
        return jest.fn(methodHandlers[property]);
      }

      if (property === 'default') {
        return target;
      }

      return jest.fn(() => Promise.resolve(mockCreateDocument({ model: modelName })));
    },
  });
}

    function mockCreateRepository(repositoryName) {
  return new Proxy({}, {
    get(target, property) {
      if (property === '__esModule') {
        return true;
      }

      if (property === 'default') {
        return target;
      }

      if (property === 'findAll') {
        return jest.fn(() => Promise.resolve([{ _id: '507f1f77bcf86cd799439012', repository: repositoryName }]));
      }

      if (property === 'countDocuments') {
        return jest.fn(() => Promise.resolve(1));
      }

      if (property === 'findOne') {
        return jest.fn(() => Promise.resolve(null));
      }

      if (property === 'findById' || property === 'findByIdAndUpdate' || property === 'save') {
        return jest.fn((id, update = {}) => Promise.resolve(mockCreateDocument({ _id: id, ...update, repository: repositoryName })));
      }

      if (property === 'create') {
        return jest.fn((data = {}) => Promise.resolve(mockCreateDocument({ ...data, repository: repositoryName })));
      }

      if (property === 'aggregate') {
        return jest.fn(() => Promise.resolve([]));
      }

      if (property === 'deleteRelatedData' || property === 'deleteMany') {
        return jest.fn(() => Promise.resolve({ acknowledged: true, deletedCount: 1 }));
      }

      return jest.fn(() => Promise.resolve(mockCreateDocument({ repository: repositoryName })));
    },
  });
}

function mockCreateService(serviceName) {
  const serviceLabel = String(serviceName || 'Service');

  const mockListResult = () => {
    const item = mockCreateDocument({ service: serviceLabel });
    return {
      items: [item],
      data: [item],
      results: [item],
      customers: [item],
      customer: item,
      carts: [item],
      cart: item,
      orders: [item],
      order: item,
      invoices: [item],
      invoice: item,
      products: [item],
      product: item,
      suppliers: [item],
      supplier: item,
      staff: [item],
      staffs: [item],
      feedbacks: [item],
      feedback: item,
      deliveries: [item],
      deliveryOrders: [item],
      deliveryOrder: item,
      sections: [item],
      section: item,
      shelves: [item],
      shelf: item,
      promotions: [item],
      promotion: item,
      batches: [item],
      batch: item,
      stocks: [item],
      stock: item,
      damagedProducts: [item],
      damagedProduct: item,
      total: 1,
      page: 1,
      pages: 1,
      count: 1,
    };
  };

  const mockDetailResult = (seed = {}) => mockCreateDocument({ service: serviceLabel, ...seed });

  const methodHandlers = {
    registerCustomer(data = {}) {
      return {
        token: 'generated.jwt.token',
        account: mockDetailResult({
          username: data.username || 'generated_customer',
          email: data.email || 'generated_customer@example.com',
          full_name: data.full_name || 'Generated Customer',
          phone: data.phone || '0901234567',
          role: 'customer',
        }),
        customer: mockDetailResult({
          membership_type: data.membership_type || 'Standard',
          points_balance: 0,
        }),
      };
    },
    registerStaff(data = {}) {
      return {
        account: mockDetailResult({
          username: data.username || 'generated_staff',
          email: data.email || 'generated_staff@example.com',
          full_name: data.full_name || 'Generated Staff',
          phone: data.phone || '0901234567',
          role: 'staff',
        }),
        staff: mockDetailResult({
          position: data.position || 'Cashier',
          employment_type: data.employment_type || 'full-time',
        }),
      };
    },
    login(username = 'generated_user') {
      return {
        token: 'generated.jwt.token',
        account: mockDetailResult({
          _id: '507f1f77bcf86cd799439012',
          id: '507f1f77bcf86cd799439012',
          username,
          role: 'customer',
          email: `${username}@example.com`,
          full_name: 'Generated User',
        }),
        profile: mockDetailResult({
          membership_type: 'Standard',
        }),
      };
    },
    getProfile(userId) {
      return mockDetailResult({
        _id: userId || '507f1f77bcf86cd799439012',
        id: userId || '507f1f77bcf86cd799439012',
        username: 'generated_user',
        email: 'generated_user@example.com',
        full_name: 'Generated User',
        role: 'customer',
      });
    },
    updateProfile(userId, updateData = {}) {
      return mockDetailResult({
        _id: userId || '507f1f77bcf86cd799439012',
        id: userId || '507f1f77bcf86cd799439012',
        full_name: updateData.full_name || 'Updated User',
        email: updateData.email || 'updated_user@example.com',
        phone: updateData.phone || '0901234567',
        address: updateData.address || '1 Nguyen Trai',
      });
    },
    verifyToken(token) {
      return {
        id: '507f1f77bcf86cd799439012',
        role: 'customer',
        email: 'generated_user@example.com',
        token: token || 'generated.jwt.token',
      };
    },
    createOrder(data = {}) {
      return {
        order: mockDetailResult({
          customer_id: data.customer_id || '507f1f77bcf86cd799439012',
          cart_id: data.cart_id || '507f1f77bcf86cd799439013',
          status: 'pending',
        }),
        invoice: mockDetailResult({
          total_amount: 1000,
          payment_status: 'unpaid',
        }),
        pointsEarned: 0,
        itemCount: 1,
        totalAmount: 1000,
        promoDiscount: 0,
        pointsRedeemed: 0,
      };
    },
    getAllOrders() {
      return mockListResult();
    },
    getOrderById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    getOrdersByCustomer() {
      return mockListResult();
    },
    getOrderStats() {
      return { totalOrders: 1, totalRevenue: 1000, avgOrderValue: 1000, byStatus: [] };
    },
    updateOrder(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    updateOrderItemStatus(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    cancelOrder(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', status: 'cancelled', ...data });
    },
    createInvoice(data = {}) {
      return mockDetailResult({
        customer_id: data.customer_id || '507f1f77bcf86cd799439012',
        total_amount: 1000,
        payment_status: 'unpaid',
      });
    },
    getAllInvoices() {
      return mockListResult();
    },
    getInvoiceById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    getInvoicesByCustomer() {
      return mockListResult();
    },
    getInvoiceStats() {
      return { totalInvoices: 1, totalAmount: 1000, paidCount: 1, unpaidCount: 0 };
    },
    updateInvoice(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    markAsPaid(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', payment_status: 'paid', ...data });
    },
    createSupplier(data = {}) {
      return mockDetailResult({ name: data.name || 'Generated Supplier', email: data.email || 'supplier@example.com' });
    },
    getAllSuppliers() {
      return mockListResult();
    },
    getSupplierStats() {
      return { totalSuppliers: 1, activeSuppliers: 1, inactiveSuppliers: 0 };
    },
    getActiveSuppliers() {
      return [mockDetailResult({ name: 'Active Supplier' })];
    },
    getSupplierById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    getSupplierProducts() {
      return mockListResult();
    },
    updateSupplier(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    deleteSupplier(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    permanentDeleteSupplier(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    activateSupplier(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', is_active: true });
    },
    createCustomer(data = {}) {
      return mockDetailResult({
        name: data.name || 'Generated Customer',
        email: data.email || 'customer@example.com',
        phone: data.phone || '0901234567',
      });
    },
    getAllCustomers() {
      return mockListResult();
    },
    getCustomerById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    getCustomerByAccount(id) {
      return mockDetailResult({ account_id: id || '507f1f77bcf86cd799439012' });
    },
    getCustomerStats() {
      return { totalCustomers: 1, activeCustomers: 1, inactiveCustomers: 0 };
    },
    getCustomerOrders() {
      return mockListResult();
    },
    updateCustomer(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    updatePoints(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', points_balance: data.pointsToAdd || 0 });
    },
    updateTotalSpent(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', total_spent: data.amount || 0 });
    },
    deleteCustomer(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    createFeedback(data = {}) {
      const validCategories = ['complaint', 'suggestion', 'praise'];

      if (!data.category || !data.subject || !data.customer_id) {
        throw new BadRequestError('Please provide category, subject, and customer_id');
      }

      if (!validCategories.includes(data.category)) {
        throw new BadRequestError(`Category must be one of: ${validCategories.join(', ')}`);
      }

      if (!/^[0-9a-fA-F]{24}$/.test(String(data.customer_id))) {
        throw new BadRequestError('Invalid ID format');
      }

      if (data.order_id && !/^[0-9a-fA-F]{24}$/.test(String(data.order_id))) {
        throw new BadRequestError('Invalid ID format');
      }

      return {
        feedback: mockDetailResult({
          customer_id: data.customer_id || '507f1f77bcf86cd799439012',
          category: data.category || 'complaint',
          subject: data.subject || 'Generated feedback subject',
          detail: data.detail || 'Generated feedback',
        }),
        bonusPoints: data.detail && String(data.detail).length > 100 ? 50 : 0,
      };
    },
    getAllFeedbacks() {
      return mockListResult();
    },
    getCustomerFeedbacks() {
      return mockListResult();
    },
    getFeedbackById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    updateFeedbackStatus(id, data = {}) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

      if (!data.status) {
        throw new BadRequestError('Status is required');
      }

      if (!validStatuses.includes(data.status)) {
        throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      if (data.assigned_to_staff_id && !/^[0-9a-fA-F]{24}$/.test(String(data.assigned_to_staff_id))) {
        throw new BadRequestError('Invalid ID format');
      }

      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', status: data.status || 'resolved' });
    },
    deleteFeedback(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    getFeedbackStats() {
      return { totalFeedbacks: 1, pendingFeedbacks: 0, resolvedFeedbacks: 1 };
    },
    createDeliveryOrder(data = {}) {
      return mockDetailResult({ order_id: data.order_id || '507f1f77bcf86cd799439012', status: 'pending' });
    },
    getAllDeliveryOrders() {
      return mockListResult();
    },
    getDeliveryOrderById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    updateDeliveryOrder(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    deleteDeliveryOrder(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    getDeliveriesByStaff() {
      return mockListResult();
    },
    getDeliveryStats() {
      return { totalDeliveries: 1, pending: 0, completed: 1 };
    },
    reassignDelivery(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', staff_id: data.staff_id || '507f1f77bcf86cd799439012' });
    },
    createProduct(data = {}) {
      return mockDetailResult({ name: data.name || 'Generated Product', price: data.price || 1000, quantity: data.quantity || 1 });
    },
    getAllProducts() {
      return mockListResult();
    },
    getProductStats() {
      return { totalProducts: 1, activeProducts: 1, lowStockProducts: 0 };
    },
    getLowStockProducts() {
      return mockListResult();
    },
    getProductsByCategory() {
      return mockListResult();
    },
    getProductsBySupplier() {
      return mockListResult();
    },
    getProductById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    updateProduct(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    updateProductStock(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', current_stock: data.quantity || data.stock || 1 });
    },
    updateProductPrice(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', price: data.price || 1000 });
    },
    deleteProduct(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    permanentDeleteProduct(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    activateProduct(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', is_active: true });
    },
    createSection(data = {}) {
      return mockDetailResult({ name: data.name || 'Generated Section' });
    },
    getAllSections() {
      return mockListResult();
    },
    getSectionById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    updateSection(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    deleteSection(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    getShelvesInSection() {
      return mockListResult();
    },
    createShelf(data = {}) {
      return mockDetailResult({ name: data.name || 'Generated Shelf' });
    },
    getShelfStats() {
      return { totalShelves: 1, availableShelves: 1 };
    },
    getShelvesByCategory() {
      return mockListResult();
    },
    getAvailableShelves() {
      return mockListResult();
    },
    toggleShelfFull(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', is_full: data.is_full ?? true });
    },
    getShelfCapacity(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', capacity: 100 });
    },
    createPromotion(data = {}) {
      return mockDetailResult({ code: data.code || 'PROMO10', discount_value: data.discount_value || 10 });
    },
    getAllPromotions() {
      return mockListResult();
    },
    getPromotionById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    updatePromotion(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    deletePromotion(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    validatePromoCode(code = 'PROMO10') {
      return { valid: true, code };
    },
    getApplicablePromotions() {
      return mockListResult();
    },
    createStaff(data = {}) {
      return mockDetailResult({
        username: data.username || 'generated_staff',
        email: data.email || 'generated_staff@example.com',
        full_name: data.full_name || 'Generated Staff',
        role: data.role || 'staff',
      });
    },
    getAllStaff() {
      return mockListResult();
    },
    getStaffStats() {
      return { totalStaff: 1, activeStaff: 1, inactiveStaff: 0 };
    },
    getStaffById(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012' });
    },
    updateStaff(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', ...data });
    },
    deleteStaff(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    permanentDeleteStaff(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', deleted: true });
    },
    activateStaff(id) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', is_active: true });
    },
    getStaffByAccountId(id) {
      return mockDetailResult({ account_id: id || '507f1f77bcf86cd799439012' });
    },
    createProductBatch(data = {}) {
      return mockDetailResult({ product_id: data.product_id || '507f1f77bcf86cd799439012', quantity: data.quantity || 1 });
    },
    getBatchesByProduct() {
      return mockListResult();
    },
    adjustBatchQuantity(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', quantity: data.quantity || 1 });
    },
    getProductBatchStats() {
      return { totalBatches: 1, expiredBatches: 0 };
    },
    createProductStock(data = {}) {
      return mockDetailResult({ product_id: data.product_id || '507f1f77bcf86cd799439012', shelf_id: data.shelf_id || '507f1f77bcf86cd799439013' });
    },
    getProductStockStats() {
      return { totalStocks: 1, lowStock: 0 };
    },
    getStockByProduct() {
      return mockListResult();
    },
    getStockByShelf() {
      return mockListResult();
    },
    getLowStockProducts() {
      return mockListResult();
    },
    adjustStockQuantity(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', quantity: data.quantity || 1 });
    },
    bulkUpdateStatus(data = {}) {
      return { updated: true, count: Array.isArray(data) ? data.length : 1 };
    },
    getProductShelfStats() {
      return { totalAssignments: 1, activeAssignments: 1 };
    },
    getShelvesByProduct() {
      return mockListResult();
    },
    getProductsByShelf() {
      return mockListResult();
    },
    moveProductToShelf(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', shelf_id: data.shelf_id || '507f1f77bcf86cd799439013' });
    },
    bulkAssignToShelf(data = {}) {
      return { assigned: true, count: Array.isArray(data) ? data.length : 1 };
    },
    getProductsForDamagedRecord() {
      return mockListResult();
    },
    getDamagedProductStats() {
      return { totalDamaged: 1, pending: 0, resolved: 1 };
    },
    getDamagedProductsByProductId() {
      return mockListResult();
    },
    adjustInventoryForDamaged(id, data = {}) {
      return mockDetailResult({ _id: id || '507f1f77bcf86cd799439012', quantity: data.quantity || 1 });
    },
    getDamagedProductShelves() {
      return mockListResult();
    },
    bulkUpdateStatus(data = {}) {
      return { updated: true, count: Array.isArray(data) ? data.length : 1 };
    },
  };

  return new Proxy({}, {
    get(target, property) {
      if (property === '__esModule') {
        return true;
      }

      if (property in methodHandlers) {
        return jest.fn(methodHandlers[property]);
      }

      if (property === 'default') {
        return target;
      }

      const propertyName = String(property);

      if (/^getAll|^list|^findAll/i.test(propertyName)) {
        return jest.fn(() => Promise.resolve(mockListResult()));
      }

      if (/Stats$/i.test(propertyName)) {
        return jest.fn(() => Promise.resolve({ total: 1, count: 1, generated: true }));
      }

      if (/^get.*By/i.test(propertyName)) {
        return jest.fn(() => Promise.resolve(mockDetailResult()));
      }

      if (/^create|^update|^register|^mark|^activate|^toggle|^apply|^remove|^clear|^checkout|^reassign|^adjust|^move|^bulk|^delete|^permanentDelete|^change/i.test(propertyName)) {
        return jest.fn((...args) => Promise.resolve(mockDetailResult({ args })));
      }

      return jest.fn(() => Promise.resolve(mockDetailResult()));
    },
  });
}

function mockTracing() {
  return {
    attachTraceId: (req, res, next) => next(),
    traceLogin: async (...args) => {
      const callback = args[args.length - 1];
      return callback();
    },
    traceCheckout: async (...args) => {
      const callback = args[args.length - 1];
      return callback({ setOrderAttributes: () => undefined });
    },
  };
}

function mockAuthMiddleware() {
  return {
    authenticate: (req, res, next) => {
      req.user = req.user || { _id: '507f1f77bcf86cd799439012', id: '507f1f77bcf86cd799439012', role: 'admin' };
      return next();
    },
    requireRoles: () => (req, res, next) => next(),
    requireAdmin: (req, res, next) => next(),
    requireStaff: (req, res, next) => next(),
  };
}

function mockLogger() {
  const noOp = () => undefined;
  return {
    info: noOp,
    warn: noOp,
    error: noOp,
    debug: noOp,
    child: () => mockLogger(),
  };
}

function applyMocks() {
  const repositoriesDir = path.join(__dirname, '..', 'repositories');
  const servicesDir = path.join(__dirname, '..', 'services');
  const repositoryFiles = fs
    .readdirSync(repositoriesDir)
    .filter((file) => file.endsWith('.js'));
  const serviceFiles = fs
    .readdirSync(servicesDir)
    .filter((file) => file.endsWith('.js'));

  jest.mock('../middleware/auth', () => mockAuthMiddleware());
  jest.mock('../config/logger', () => mockLogger());
  jest.mock('../middleware/tracing', () => mockTracing());

  for (const mockFileName of repositoryFiles) {
    const modulePath = `../repositories/${mockFileName.replace(/\.js$/i, '')}`;
    jest.doMock(modulePath, () => mockCreateRepository(mockFileName.replace(/\.js$/i, '')));
  }

  for (const mockFileName of serviceFiles) {
    const modulePath = `../services/${mockFileName.replace(/\.js$/i, '')}`;
    jest.doMock(modulePath, () => mockCreateService(mockFileName.replace(/\.js$/i, '')));
  }

  jest.mock('../models', () => {
    return new Proxy({}, {
      get(target, property) {
        if (property === '__esModule') {
          return true;
        }

        if (property === 'default') {
          return target;
        }

        if (!target[property]) {
          target[property] = mockCreateModel(String(property));
        }

        return target[property];
      },
    });
  });
}

applyMocks();
