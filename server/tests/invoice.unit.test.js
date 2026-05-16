/**
 * Unit Tests - InvoiceService
 * Tests invoice business logic in isolation
 */
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const mongoose = require('mongoose');

jest.mock('../repositories/InvoiceRepository');
jest.mock('../repositories/CustomerRepository');
jest.mock('../models', () => ({
  Invoice: { create: jest.fn(), findOne: jest.fn() },
  InvoiceItem: { insertMany: jest.fn() },
  Order: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
  Customer: {},
  Product: {},
  ProductStock: {}
}));

const invoiceRepository = require('../repositories/InvoiceRepository');
const customerRepository = require('../repositories/CustomerRepository');
const invoiceService = require('../services/InvoiceService');

describe('InvoiceService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── _generateInvoiceNumber ─────────────────
  describe('_generateInvoiceNumber', () => {
    it('TC01: should generate unique invoice numbers on successive calls', () => {
      const num1 = invoiceService._generateInvoiceNumber();
      const num2 = invoiceService._generateInvoiceNumber();

      expect(num1).toMatch(/^INV-\d+-[A-Z0-9]+$/);
      expect(num1).not.toBe(num2);
    });
  });

  // ───────────────── _validateObjectId ─────────────────
  describe('_validateObjectId', () => {
    it('TC02: should throw BadRequestError for invalid ObjectId', () => {
      expect(() => invoiceService._validateObjectId('bad-id')).toThrow(BadRequestError);
    });

    it('TC03: should not throw for a valid ObjectId', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      expect(() => invoiceService._validateObjectId(validId)).not.toThrow();
    });
  });

  // ───────────────── createInvoice ─────────────────
  describe('createInvoice', () => {
    it('TC04: should throw BadRequestError if customer_id or items are missing', async () => {
      await expect(invoiceService.createInvoice({ customer_id: null, items: [] }))
        .rejects.toThrow(BadRequestError);
    });

    it('TC05: should throw NotFoundError if customer does not exist', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      customerRepository.findById.mockResolvedValue(null);

      await expect(invoiceService.createInvoice({
        customer_id: validId,
        items: [{ product_id: 'prod-1', quantity: 1, unit_price: 5000 }]
      })).rejects.toThrow(NotFoundError);
    });
  });

  // ───────────────── getInvoiceById ─────────────────
  describe('getInvoiceById', () => {
    it('TC06: should throw NotFoundError for valid but non-existent invoice', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      invoiceRepository.findById.mockResolvedValue(null);

      await expect(invoiceService.getInvoiceById(validId)).rejects.toThrow(NotFoundError);
    });
  });
});
