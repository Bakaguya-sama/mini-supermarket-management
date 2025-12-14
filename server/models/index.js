// models/index.js - ĐÃ FIX DUPLICATE INDEX WARNINGS
const mongoose = require('mongoose');

// ==================== 1. ACCOUNTS ====================
const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password_hash: { type: String, default: '' }, // Optional for customers without login
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  full_name: { type: String },
  phone: { type: String },
  address: { type: String },
  date_of_birth: { type: String },
  avatar_link: { type: String },
  is_active: { type: Boolean, default: true },
  role: { type: String, required: true, enum: ['customer', 'staff', 'admin'] },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

// ==================== 2. STAFF ====================
const staffSchema = new mongoose.Schema({
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', unique: true },
  position: { type: String, required: true },
  employment_type: { type: String },
  annual_salary: { type: Number },
  hire_date: { type: Date },
  notes: { type: String },
  is_active: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

// ==================== 3. MANAGERS ====================
const managerSchema = new mongoose.Schema({
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true, unique: true },
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  access_level: { type: String, enum: ['super', 'admin', 'manager'] },
  is_superuser: { type: Boolean, default: false },
  permissions: { type: mongoose.Schema.Types.Mixed },
  scope: { type: String },
  assigned_since: { type: Date },
  bio: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

// ==================== 4. CUSTOMERS ====================
const customerSchema = new mongoose.Schema({
  account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
  membership_type: { type: String },
  notes: { type: String },
  points_balance: { type: Number, default: 0 },
  total_spent: { type: Number, default: 0 },
  registered_at: { type: Date, default: Date.now },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

// ==================== 2. SUPPLIERS ====================
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_person_name: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  address: { type: String },
  tax_id: { type: String },
  note: { type: String },
  is_active: { type: Boolean, default: true },
  image_link: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

supplierSchema.index({ name: 1 });

// ==================== 6. PRODUCTS ====================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  unit: { type: String, required: true },
  current_stock: { type: Number, default: 0 },
  minimum_stock_level: { type: Number },
  maximum_stock_level: { type: Number },
  storage_location: { type: String },
  price: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'discontinued'] },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  category: { type: String },
  image_link: { type: String },
  sku: { type: String },
  barcode: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

productSchema.index({ name: 1, category: 1, supplier_id: 1 });

// ==================== 7. SHELVES ====================
const shelfSchema = new mongoose.Schema({
  shelf_number: { type: String, required: true, unique: true }, // A1, A2, A3, A4, B1, B2...
  shelf_name: { type: String, required: true }, // A, B, C, D, E, F
  section_number: { type: Number, required: true, min: 1, max: 4 }, // 1, 2, 3, 4
  description: { type: String },
  capacity: { type: Number, default: 50 }, // Each section can hold 50 products
  current_quantity: { type: Number, default: 0 },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

shelfSchema.index({ shelf_number: 1 });

// ==================== 8. PRODUCT SHELVES ====================
// Business Rule: One product can only be on ONE shelf at a time
const productShelfSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true }, // UNIQUE: 1 product = 1 shelf
  shelf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelf', required: true },
  quantity: { type: Number, default: 0, required: true },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

productShelfSchema.index({ product_id: 1 }, { unique: true }); // Enforce one product per shelf
productShelfSchema.index({ shelf_id: 1 });

// ==================== 9. PROMOTIONS ====================
const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  promotion_type: { type: String, required: true },
  discount_value: { type: Number },
  minimum_purchase_amount: { type: Number },
  promo_code: { type: String, unique: true, sparse: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'expired'] },
  terms: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

promotionSchema.index({ start_date: 1, end_date: 1 });

// ==================== 10. PROMOTION PRODUCTS ====================
const promotionProductSchema = new mongoose.Schema({
  promotion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  discount_override: { type: Number },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

promotionProductSchema.index({ promotion_id: 1, product_id: 1 }, { unique: true });

// ==================== 11. ORDERS ====================
const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  orderItems: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }
  ],
  order_date: { type: Date, default: Date.now },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
  tracking_number: { type: String },
  delivery_date: { type: Date },
  total_amount: { type: Number, default: 0 },
  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  notes: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.index({ customer_id: 1, status: 1 });

// Virtual populate alternative (optional)
orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order_id'
});

orderSchema.set('toJSON', { virtuals: true });

// ==================== 12. ORDER ITEMS ====================
const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  warehouse_issued_by_staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  status: { type: String, default: 'pending', enum: ['pending', 'picked', 'packed', 'shipped'] },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

orderItemSchema.index({ order_id: 1, product_id: 1 });

// ==================== 13. DELIVERY ORDERS ====================
const deliveryOrderSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  order_date: { type: Date, default: Date.now },
  delivery_date: { type: Date },
  status: { type: String, default: 'assigned', enum: ['assigned', 'in_transit', 'delivered', 'failed'] },
  tracking_number: { type: String },
  notes: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

deliveryOrderSchema.index({ order_id: 1, staff_id: 1 });

// ==================== 14. INVOICES ====================
const invoiceSchema = new mongoose.Schema({
  invoice_number: { type: String, required: true, unique: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  invoice_date: { type: Date, default: Date.now },
  total_amount: { type: Number, default: 0 },
  payment_status: { type: String, default: 'unpaid', enum: ['unpaid', 'paid', 'partial'] },
  notes: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

invoiceSchema.index({ customer_id: 1 });

// ==================== 15. INVOICE ITEMS ====================
const invoiceItemSchema = new mongoose.Schema({
  invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  description: { type: String },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  line_total: { type: Number, required: true },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

invoiceItemSchema.index({ invoice_id: 1 });

// ==================== 16. PAYMENTS ====================
const paymentSchema = new mongoose.Schema({
  payment_number: { type: String, required: true, unique: true },
  payment_date: { type: Date, default: Date.now },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  invoice_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  items: { type: String },
  payment_method: { type: String, required: true, enum: ['Cash', 'Card', 'Bank Transfer'] },
  status: { type: String, default: 'completed', enum: ['completed', 'pending', 'failed'] },
  reference: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

paymentSchema.index({ customer_id: 1 });

// ==================== 17. REPORTS ====================
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  description: { type: String },
  report_date: { type: Date, default: Date.now },
  status: { type: String },
  hours_worked: { type: Number },
  sales_amount: { type: Number },
  tasks: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

reportSchema.index({ staff_id: 1, report_date: 1 });

// ==================== 18. INSTRUCTIONS ====================
const instructionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  detail: { type: String },
  sent_date: { type: Date, default: Date.now },
  created_by_staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  status: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

instructionSchema.index({ created_by_staff_id: 1 });

// ==================== 19. CUSTOMER FEEDBACK ====================
const customerFeedbackSchema = new mongoose.Schema({
  category: { type: String, required: true, enum: ['complaint', 'suggestion', 'praise'] },
  subject: { type: String, required: true },
  detail: { type: String },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  status: { type: String, default: 'open', enum: ['open', 'in_progress', 'resolved', 'closed'] },
  assigned_to_staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

customerFeedbackSchema.index({ customer_id: 1, status: 1 });

// ==================== 20. PRODUCT STOCK ====================
const productStockSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId },
  shelf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelf' },
  section: { type: String },
  slot: { type: String },
  status: { type: String },
  damaged_quantity: { type: String },
  reason: { type: String },
  quantity: { type: Number, default: 0 },
  last_updated: { type: Date, default: Date.now },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

productStockSchema.index({ product_id: 1, warehouse_id: 1, shelf_id: 1 });

// ==================== 21. CARTS ====================
const cartSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  cartItems: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }
  ],
  last_activity_at: { type: Date, default: Date.now },
  status: { type: String, default: 'active', enum: ['active', 'checked_out', 'abandoned', 'expired'] },
  currency: { type: String, default: 'VND' },
  subtotal: { type: Number, default: 0 },
  discounts: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  applied_promo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
  reserved: { type: Boolean, default: false },
  reserved_until: { type: Date },
  notes: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

cartSchema.index({ customer_id: 1, status: 1 });

// Virtual populate alternative (optional, but good for flexibility)
cartSchema.virtual('cartItemsVirtual', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'cart_id'
});

cartSchema.set('toJSON', { virtuals: true });

// ==================== 22. CART ITEMS ====================
const cartItemSchema = new mongoose.Schema({
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String },
  product_name: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String },
  unit_price: { type: Number, required: true },
  line_total: { type: Number, required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId },
  shelf_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelf' },
  reserved_by_staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  backorder: { type: Boolean, default: false },
  status: { type: String, default: 'active', enum: ['active', 'saved_for_later', 'removed', 'purchased'] },
  added_at: { type: Date, default: Date.now },
  notes: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

cartItemSchema.index({ cart_id: 1, product_id: 1 });

// ==================== 23. DAMAGED PRODUCTS ====================
const damagedProductSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  product_name: { type: String },
  damaged_quantity: { type: Number, default: 0 },
  unit: { type: String },
  status: { type: String, default: 'reported', enum: ['reported', 'expired', 'damaged', 'reviewed', 'removed', 'resolved'] },
  description: { type: String },
  image_urls: [{ type: String }],
  resolution_action: { type: String, enum: ['discard', 'return_to_supplier', 'discount', 'destroy'] },
  inventory_adjusted: { type: Boolean, default: false },
  notes: { type: String },
  isDelete: { type: Boolean, default: false }
}, { timestamps: true });

damagedProductSchema.index({ product_id: 1, status: 1 });

// ==================== EXPORT TẤT CẢ 23 MODELS ====================
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
  Order: mongoose.model('Order', orderSchema),
  OrderItem: mongoose.model('OrderItem', orderItemSchema),
  DeliveryOrder: mongoose.model('DeliveryOrder', deliveryOrderSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  InvoiceItem: mongoose.model('InvoiceItem', invoiceItemSchema),
  Payment: mongoose.model('Payment', paymentSchema),
  Report: mongoose.model('Report', reportSchema),
  Instruction: mongoose.model('Instruction', instructionSchema),
  CustomerFeedback: mongoose.model('CustomerFeedback', customerFeedbackSchema),
  ProductStock: mongoose.model('ProductStock', productStockSchema),
  Cart: mongoose.model('Cart', cartSchema),
  CartItem: mongoose.model('CartItem', cartItemSchema),
  DamagedProduct: mongoose.model('DamagedProduct', damagedProductSchema)
};