/**
 * Unit Tests - CartController
 * Tests cart business logic by calling controller functions directly with mocked req/res.
 * Uses jest.mock to prevent real DB or Redis connections.
 */

// ─── Mock ioredis (already handled by jestSetup.js, but explicit here for clarity)
jest.mock('../config/redis', () => ({
  get:    jest.fn().mockResolvedValue(null),
  set:    jest.fn().mockResolvedValue('OK'),
  setex:  jest.fn().mockResolvedValue('OK'),
  del:    jest.fn().mockResolvedValue(1),
  keys:   jest.fn().mockResolvedValue([]),
  on:     jest.fn(),
}));

// ─── Mock Mongoose models
const mockCartItem = {
  _id: 'item-123',
  cart_id: 'cart-123',
  status: 'active',
  save: jest.fn().mockResolvedValue(true),
};

const mockCart = {
  _id: 'cart-123',
  cartItems: ['item-123'],
  customer_id: 'cust-123',
  save: jest.fn().mockResolvedValue(true),
};

jest.mock('../models', () => ({
  Cart: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
  CartItem: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),   // controller uses findById, not findByIdAndDelete
    create: jest.fn(),
  },
  Product: {
    findById: jest.fn(),
  },
}));

const { Cart, CartItem, Product } = require('../models');
const redisClient = require('../config/redis');
const cartController = require('../controllers/cartController');

// ─── Helpers
function makeRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res); // allow chaining: res.status(200).json(...)
  return res;
}

describe('Cart Controller Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── getCartByCustomer ────────────────────────────────────────────
  describe('getCartByCustomer', () => {
    it('TC01: should return cached cart when Redis has data', async () => {
      redisClient.get.mockResolvedValue(JSON.stringify({ _id: 'cart-123', cartItems: [] }));

      const req = { params: { customerId: 'cust-123' } };
      const res = makeRes();

      await cartController.getCartByCustomer(req, res);

      expect(redisClient.get).toHaveBeenCalledWith('cart:session:customer:cust-123');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('TC02: should query DB when Redis returns null', async () => {
      redisClient.get.mockResolvedValue(null);
      const populatedCart = { ...mockCart, cartItems: [] };
      Cart.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedCart),
        }),
      });

      const req = { params: { customerId: 'cust-123' } };
      const res = makeRes();

      await cartController.getCartByCustomer(req, res);

      expect(Cart.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ─── addItemToCart ────────────────────────────────────────────────
  describe('addItemToCart', () => {
    it('TC03: should add item and respond 200', async () => {
      const mockProduct = { _id: 'prod-123', price: 15000, current_stock: 10, name: 'Apple', unit: 'pcs', sku: 'SKU1' };
      const cartWithItem = { ...mockCart, cartItems: [mockCartItem._id] };

      Cart.findById
        .mockResolvedValueOnce({ ...mockCart })             // first call: fetch cart for validation
        .mockReturnValueOnce({                               // second call: after save, populated
          populate: jest.fn().mockResolvedValue(cartWithItem),
        });
      Product.findById.mockResolvedValue(mockProduct);
      CartItem.findOne.mockResolvedValue(null);              // item not yet in cart
      CartItem.create.mockResolvedValue({ ...mockCartItem, line_total: 30000 });

      const req = { params: { cartId: 'cart-123' }, body: { product_id: 'prod-123', quantity: 2 } };
      const res = makeRes();

      await cartController.addItemToCart(req, res);

      expect(Product.findById).toHaveBeenCalledWith('prod-123');
      expect(CartItem.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('TC04: should respond 404 when product does not exist', async () => {
      Cart.findById.mockResolvedValue({ ...mockCart });
      Product.findById.mockResolvedValue(null);

      const req = { params: { cartId: 'cart-123' }, body: { product_id: 'prod-999', quantity: 1 } };
      const res = makeRes();

      await cartController.addItemToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Product not found' }));
    });
  });

  // ─── removeItemFromCart ───────────────────────────────────────────
  describe('removeItemFromCart', () => {
    it('TC05: should mark item as removed and respond 200', async () => {
      // Controller calls CartItem.findById → then item.save() → Cart.findByIdAndUpdate → Cart.findById
      CartItem.findById.mockResolvedValue({
        ...mockCartItem,
        save: jest.fn().mockResolvedValue(true),
      });
      Cart.findByIdAndUpdate.mockResolvedValue({});
      Cart.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ ...mockCart, cartItems: [] }),
      });

      const req = { params: { itemId: 'item-123' } };
      const res = makeRes();

      await cartController.removeItemFromCart(req, res);

      expect(CartItem.findById).toHaveBeenCalledWith('item-123');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
