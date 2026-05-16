/**
 * Unit Tests - FeedbackService
 * Tests customer feedback business logic in isolation
 */
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const mongoose = require('mongoose');

jest.mock('../repositories/FeedbackRepository');
jest.mock('../repositories/CustomerRepository');

const feedbackRepository = require('../repositories/FeedbackRepository');
const customerRepository = require('../repositories/CustomerRepository');
const feedbackService = require('../services/FeedbackService');

describe('FeedbackService - Unit Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  // ───────────────── createFeedback ─────────────────
  describe('createFeedback', () => {
    it('TC01: should throw BadRequestError if required fields are missing', async () => {
      await expect(feedbackService.createFeedback({})).rejects.toThrow(BadRequestError);
    });

    it('TC02: should throw NotFoundError if customer does not exist', async () => {
      const customerId = new mongoose.Types.ObjectId().toString();
      customerRepository.findById.mockResolvedValue(null);

      await expect(feedbackService.createFeedback({
        customer_id: customerId,
        category: 'complaint',
        subject: 'Wrong item delivered',
        detail: 'I received a different product'
      })).rejects.toThrow(NotFoundError);
    });

    it('TC03: should create feedback successfully when all data is valid', async () => {
      const customerId = new mongoose.Types.ObjectId().toString();
      const mockCustomer = { _id: customerId };
      const mockFeedback = { _id: 'fb-1', category: 'praise', subject: 'Great service', status: 'open' };

      customerRepository.findById.mockResolvedValue(mockCustomer);
      feedbackRepository.create.mockResolvedValue(mockFeedback);
      feedbackRepository.findById.mockResolvedValue(mockFeedback);

      const result = await feedbackService.createFeedback({
        customer_id: customerId,
        category: 'praise',
        subject: 'Great service',
        detail: 'Fast delivery!'
      });
      expect(result.feedback.category).toBe('praise');
      expect(result.feedback.status).toBe('open');
      expect(result.bonusPoints).toBe(0);
    });
  });

  // ───────────────── getFeedbackById ─────────────────
  describe('getFeedbackById', () => {
    it('TC04: should throw BadRequestError for invalid ObjectId', async () => {
      await expect(feedbackService.getFeedbackById('bad-id')).rejects.toThrow(BadRequestError);
    });

    it('TC05: should throw NotFoundError if feedback not found', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      feedbackRepository.findById.mockResolvedValue(null);

      await expect(feedbackService.getFeedbackById(validId)).rejects.toThrow(NotFoundError);
    });

    it('TC06: should return feedback when found', async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const mockFeedback = { _id: validId, subject: 'My feedback', status: 'open' };
      feedbackRepository.findById.mockResolvedValue(mockFeedback);

      const result = await feedbackService.getFeedbackById(validId);
      expect(result.subject).toBe('My feedback');
    });
  });
});
