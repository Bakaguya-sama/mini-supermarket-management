// server/models/index.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ==================== ACCOUNT SCHEMA ====================
const accountSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  fullName: String,
  phone: String,
  address: String,
  dateOfBirth: Date,
  avatarLink: String,
  isActive: { type: Boolean, default: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['customer', 'staff', 'manager', 'admin'],
    default: 'customer'
  }
}, { timestamps: true });

// ==================== STAFF SCHEMA ====================
const staffSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
  position: { 
    type: String, 
    required: true,
    enum: ['cashier', 'warehouse', 'delivery', 'manager']
  },
  employmentType: { type: String, enum: ['fulltime', 'parttime', 'contract'] },
  annualSalary: Number,
  hireDate: Date,
  notes: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ==================== MANAGER SCHEMA (NEW - Separate table) ====================
const managerSchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, unique: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'Account' }, // Duplicate for fast query
  accessLevel: { 
    type: String, 
    enum: ['super', 'admin', 'manager'],
    default: 'manager'
  },
  isSuperuser: { type: Boolean, default: false },
  permissions: Schema.Types.Mixed, // JSON permissions
  scope: String, // "all", "warehouse-A", etc.
  assignedSince: Date,
  bio: String
}, { timestamps: true });

// ==================== CUSTOMER SCHEMA ====================
const customerSchema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
  membershipType: { 
    type: String, 
    enum: ['regular', 'silver', 'gold', 'platinum'],
    default: 'regular'
  },
  pointsBalance: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  notes: String,
  registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ==================== SUPPLIER SCHEMA ====================
const supplierSchema = new Schema({
  name: { type: String, required: true },
  contactPersonName: String,
  email: String,
  phone: String,
  website: String,
  address: String,
  taxId: String,
  note: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ==================== PRODUCT SCHEMA ====================
const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  unit: { type: String, required: true },
  currentStock: { type: Number, default: 0 },
  minimumStockLevel: Number,
  maximumStockLevel: Number,
  storageLocation: String,
  price: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ['available', 'out_of_stock', 'discontinued'],
    default: 'available'
  },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  category: String
}, { timestamps: true });

// ==================== SHELF SCHEMA ====================
const shelfSchema = new Schema({
  shelfNumber: { type: String, required: true },
  category: String,
  note: String,
  capacity: Number,
  isFull: { type: Boolean, default: false },
  warehouseId: Schema.Types.ObjectId
}, { timestamps: true });

// ==================== PRODUCT SHELVES (Junction Table) ====================
const productShelfSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  shelfId: { type: Schema.Types.ObjectId, ref: 'Shelf', required: true },
  quantity: { type: Number, default: 0 }
}, { timestamps: true });

// Unique constraint
productShelfSchema.index({ productId: 1, shelfId: 1 }, { unique: true });

// ==================== PROMOTION SCHEMA ====================
const promotionSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  promotionType: { 
    type: String, 
    required: true,
    enum: ['percentage', 'fixed', 'buy_x_get_y', 'bundle']
  },
  discountValue: Number,
  minimumPurchaseAmount: Number,
  promoCode: { type: String, unique: true, sparse: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  terms: String
}, { timestamps: true });

// ==================== PROMOTION PRODUCTS (Junction Table) ====================
const promotionProductSchema = new Schema({
  promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  discountOverride: Number
}, { timestamps: true });

promotionProductSchema.index({ promotionId: 1, productId: 1 }, { unique: true });

// ==================== CART SCHEMA ====================
const cartSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  status: { 
    type: String, 
    enum: ['active', 'checked_out', 'abandoned', 'expired'],
    default: 'active'
  },
  currency: { type: String, default: 'VND' },
  subtotal: { type: Number, default: 0 },
  discounts: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  appliedPromoId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
  reserved: { type: Boolean, default: false },
  reservedUntil: Date,
  notes: String,
  lastActivityAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ==================== CART ITEMS SCHEMA ====================
const cartItemSchema = new Schema({
  cartId: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: String,
  productName: String,
  quantity: { type: Number, required: true, default: 1 },
  unit: String,
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
  warehouseId: Schema.Types.ObjectId,
  shelfId: { type: Schema.Types.ObjectId, ref: 'Shelf' },
  reservedByStaffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
  backorder: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['active', 'saved_for_later', 'removed', 'purchased'],
    default: 'active'
  },
  notes: String,
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// ==================== ORDER SCHEMA ====================
const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  orderDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  deliveryDate: Date,
  totalAmount: { type: Number, default: 0 },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  notes: String
}, { timestamps: true });

// ==================== ORDER ITEMS SCHEMA ====================
const orderItemSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  warehouseIssuedByStaffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
  status: { 
    type: String, 
    enum: ['pending', 'picked', 'packed', 'shipped'],
    default: 'pending'
  }
}, { timestamps: true });

// ==================== DELIVERY ORDERS SCHEMA ====================
const deliveryOrderSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: Date,
  status: { 
    type: String, 
    enum: ['assigned', 'in_transit', 'delivered', 'failed'],
    default: 'assigned'
  },
  trackingNumber: String,
  notes: String
}, { timestamps: true });

// ==================== PAYMENT SCHEMA ====================
const paymentSchema = new Schema({
  paymentNumber: { type: String, required: true, unique: true },
  paymentDate: { type: Date, default: Date.now },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  items: String, // NEW: description of items
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['cash', 'card', 'bank_transfer', 'e_wallet']
  },
  status: { 
    type: String, 
    enum: ['completed', 'pending', 'failed', 'refunded'],
    default: 'completed'
  },
  reference: String
}, { timestamps: true });

// ==================== INVOICE SCHEMA ====================
const invoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  invoiceDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'paid', 'partial'],
    default: 'unpaid'
  },
  notes: String
}, { timestamps: true });

// ==================== INVOICE ITEMS SCHEMA ====================
const invoiceItemSchema = new Schema({
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  description: String,
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true }
}, { timestamps: true });

// ==================== PRODUCT STOCK SCHEMA ====================
const productStockSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: Schema.Types.ObjectId,
  shelfId: { type: Schema.Types.ObjectId, ref: 'Shelf' },
  section: String,
  slot: String,
  status: String,
  damagedQuantity: Number,
  reason: String,
  quantity: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

productStockSchema.index({ productId: 1, warehouseId: 1, shelfId: 1 }, { unique: true, sparse: true });

// ==================== DAMAGED PRODUCTS SCHEMA (NEW) ====================
const damagedProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String, // Snapshot
  damagedQuantity: { type: Number, default: 0 },
  unit: String, // Snapshot
  status: { 
    type: String, 
    enum: ['reported', 'expired', 'damaged', 'reviewed', 'removed', 'resolved'],
    default: 'reported'
  },
  description: String,
  imageUrls: [String], // Array of image URLs
  resolutionAction: { 
    type: String, 
    enum: ['discard', 'return_to_supplier', 'discount', 'destroy', null]
  },
  inventoryAdjusted: { type: Boolean, default: false },
  notes: String
}, { timestamps: true });

// ==================== REPORT SCHEMA ====================
const reportSchema = new Schema({
  title: { type: String, required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
  description: String,
  reportDate: { type: Date, default: Date.now },
  status: String,
  hoursWorked: Number,
  salesAmount: Number,
  tasks: String,
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

// ==================== INSTRUCTION SCHEMA ====================
const instructionSchema = new Schema({
  title: { type: String, required: true },
  detail: String,
  sentDate: { type: Date, default: Date.now },
  createdByStaffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

// ==================== CUSTOMER FEEDBACK SCHEMA ====================
const feedbackSchema = new Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['complaint', 'suggestion', 'praise', 'inquiry']
  },
  subject: { type: String, required: true },
  detail: String,
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedToStaffId: { type: Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

// ==================== INDEXES ====================
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderDate: -1 });


// ==================== EXPORT MODELS ====================
module.exports = {
  Account: mongoose.model('Account', accountSchema),
  Staff: mongoose.model('Staff', staffSchema),
  Manager: mongoose.model('Manager', managerSchema),
  Customer: mongoose.model('Customer', customerSchema),
  Supplier: mongoose.model('Supplier', supplierSchema),
  Product: mongoose.model('Product', productSchema),
  Shelf: mongoose.model('Shelf', shelfSchema),
  ProductShelf: mongoose.model('ProductShelf', productShelfSchema),
  Promotion: mongoose.model('Promotion', promotionSchema),
  PromotionProduct: mongoose.model('PromotionProduct', promotionProductSchema),
  Cart: mongoose.model('Cart', cartSchema),
  CartItem: mongoose.model('CartItem', cartItemSchema),
  Order: mongoose.model('Order', orderSchema),
  OrderItem: mongoose.model('OrderItem', orderItemSchema),
  DeliveryOrder: mongoose.model('DeliveryOrder', deliveryOrderSchema),
  Payment: mongoose.model('Payment', paymentSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  InvoiceItem: mongoose.model('InvoiceItem', invoiceItemSchema),
  ProductStock: mongoose.model('ProductStock', productStockSchema),
  DamagedProduct: mongoose.model('DamagedProduct', damagedProductSchema),
  Report: mongoose.model('Report', reportSchema),
  Instruction: mongoose.model('Instruction', instructionSchema),
  CustomerFeedback: mongoose.model('CustomerFeedback', feedbackSchema)
};