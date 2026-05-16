const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const mongoose = require('mongoose');

// Mock repositories and models
jest.mock('../repositories/OrderRepository');
jest.mock('../repositories/CustomerRepository');
jest.mock('../models', () => ({
  Order: {},
  OrderItem: {},
  Customer: {},
  Product: {},
  Cart: {},
  CartItem: {},
  DeliveryOrder: {},
  Staff: {},
  Invoice: {},
  InvoiceItem: {}
}));

const orderRepository = require('../repositories/OrderRepository');
const customerRepository = require('../repositories/CustomerRepository');
const orderService = require('../services/OrderService');

describe('OrderService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('TC01: should throw BadRequestError if order ID is invalid format', async () => {
      await expect(orderService.getOrderById('invalid-id'))
        .rejects.toThrow(BadRequestError);
    });

    it('TC02: should throw NotFoundError if order not found in database', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      orderRepository.findById.mockResolvedValue(null);
      
      await expect(orderService.getOrderById(validId))
        .rejects.toThrow(NotFoundError);
      expect(orderRepository.findById).toHaveBeenCalledWith(validId);
    });

    it('TC03: should return order successfully if found', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockOrder = { _id: validId, order_number: 'ORD-123', total_amount: 50000 };
      orderRepository.findById.mockResolvedValue(mockOrder);
      
      const result = await orderService.getOrderById(validId);
      expect(result).toEqual(mockOrder);
      expect(orderRepository.findById).toHaveBeenCalledWith(validId);
    });
  });

  describe('cancelOrder', () => {
    it('TC04: should throw NotFoundError if trying to cancel non-existent order', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      orderRepository.findById.mockResolvedValue(null);
      
      await expect(orderService.cancelOrder(validId))
        .rejects.toThrow(NotFoundError);
    });

    it('TC05: should throw ConflictError if order is already shipped', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockOrder = { _id: validId, status: 'shipped' };
      orderRepository.findById.mockResolvedValue(mockOrder);
      
      await expect(orderService.cancelOrder(validId))
        .rejects.toThrow(ConflictError);
    });

    it('TC06: should change status to cancelled and save if order is pending', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockOrder = { 
        _id: validId, 
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      orderRepository.findById.mockResolvedValue(mockOrder);
      
      const result = await orderService.cancelOrder(validId);
      expect(result.status).toBe('cancelled');
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });
});
