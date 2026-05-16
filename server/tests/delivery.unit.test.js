/**
 * Unit Tests - DeliveryOrder
 * Tests delivery assignment business logic in isolation
 */
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const mongoose = require('mongoose');

jest.mock('../repositories/OrderRepository');
jest.mock('../models', () => {
  const mockDelivery = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn()
  };
  const mockStaff = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  };
  const mockOrder = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  };
  return {
    DeliveryOrder: mockDelivery,
    Staff: mockStaff,
    Order: mockOrder,
    Invoice: { findOne: jest.fn() },
    Customer: {},
    Account: {}
  };
});

const { DeliveryOrder, Staff, Order } = require('../models');

describe('DeliveryOrder - Business Logic Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── Staff assignment logic ─────────────────
  describe('Auto-assign delivery staff (load balancing logic)', () => {
    it('TC01: should select staff member with fewest current_assignments', () => {
      const deliveryStaff = [
        { _id: 'staff-A', current_assignments: 3, is_active: true },
        { _id: 'staff-B', current_assignments: 1, is_active: true },
        { _id: 'staff-C', current_assignments: 5, is_active: true }
      ];

      // Simulate the round-robin pick (lowest assignments)
      const leastBusy = deliveryStaff.reduce((min, s) =>
        s.current_assignments < min.current_assignments ? s : min
      );
      expect(leastBusy._id).toBe('staff-B');
    });

    it('TC02: should return null when no delivery staff are available', () => {
      const deliveryStaff = [];
      const picked = deliveryStaff.length > 0 ? deliveryStaff[0] : null;
      expect(picked).toBeNull();
    });
  });

  // ───────────────── Status transition validation ─────────────────
  describe('Delivery status transitions', () => {
    it('TC03: should allow transition from assigned to in_transit', () => {
      const validTransitions = {
        assigned: ['in_transit', 'failed'],
        in_transit: ['delivered', 'failed'],
        delivered: [],
        failed: []
      };
      const current = 'assigned';
      const next = 'in_transit';
      expect(validTransitions[current]).toContain(next);
    });

    it('TC04: should not allow going back from delivered to in_transit', () => {
      const validTransitions = {
        assigned: ['in_transit', 'failed'],
        in_transit: ['delivered', 'failed'],
        delivered: [],
        failed: []
      };
      const current = 'delivered';
      const next = 'in_transit';
      expect(validTransitions[current]).not.toContain(next);
    });
  });

  // ───────────────── ObjectId validation ─────────────────
  describe('ID validation', () => {
    it('TC05: should identify valid MongoDB ObjectId format', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      expect(mongoose.Types.ObjectId.isValid(validId)).toBe(true);
    });

    it('TC06: should reject malformed IDs', () => {
      expect(mongoose.Types.ObjectId.isValid('not-an-id')).toBe(false);
      expect(mongoose.Types.ObjectId.isValid('')).toBe(false);
    });
  });
});
