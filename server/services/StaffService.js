// server/services/StaffService.js
const mongoose = require('mongoose');
const { Staff, Account } = require('../models');
const staffRepository = require('../repositories/StaffRepository');
const { BadRequestError, NotFoundError, ConflictError } = require('../middleware/errorClasses');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

class StaffService {
  _buildQuery({ position, is_active, employment_type, search }) {
    const query = { isDelete: false };
    
    if (position) query.position = position;
    if (is_active !== undefined) query.is_active = is_active === 'true' || is_active === true;
    if (employment_type) query.employment_type = employment_type;
    
    return query;
  }

  _parsePage(value) {
    const page = parseInt(value);
    return Number.isNaN(page) || page < 1 ? 1 : page;
  }

  _parseLimit(value, fallback) {
    const limit = parseInt(value);
    return Number.isNaN(limit) || limit < 1 ? fallback : limit;
  }

  _validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
  }

  /**
   * UC5.4 - Performance: Search staff
   * Database indexing on Name + paginated results (under 2 seconds)
   */
  async _searchByAccountName(searchTerm) {
    const accounts = await Account.find({
      $or: [
        { full_name: { $regex: searchTerm, $options: 'i' } },
        { username: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ],
      isDelete: false
    }).select('_id').lean();
    
    return accounts.map(acc => acc._id);
  }

  /**
   * UC5.5 - Manageability: Get all staff
   * Return staff list with clear status indicators (Active/Inactive) sorted by most recent additions first
   */
  async getAllStaff({ page = 1, limit = 10, ...filters } = {}) {
    const pageNum = this._parsePage(page);
    const limitNum = this._parseLimit(limit, 10);
    const query = this._buildQuery(filters);
    const skip = (pageNum - 1) * limitNum;

    let finalQuery = query;

    // UC5.4: Handle search if provided
    if (filters.search) {
      const accountIds = await this._searchByAccountName(filters.search);
      if (accountIds.length === 0) {
        return { staff: [], total: 0, page: pageNum, pages: 0 };
      }
      finalQuery = { ...query, account_id: { $in: accountIds } };
    }

    const [staff, total] = await Promise.all([
      staffRepository.findAll(finalQuery, { sort: '-createdAt', skip, limit: limitNum }),
      staffRepository.countDocuments(finalQuery)
    ]);

    return {
      staff,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Get staff statistics
   */
  async getStaffStats() {
    const [totalCount, statusCounts, positionStats, employmentStats] = await Promise.all([
      staffRepository.countDocuments({ isDelete: false }),
      staffRepository.countByStatus(),
      staffRepository.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: '$position', count: { $sum: 1 } } }
      ]),
      staffRepository.aggregate([
        { $match: { isDelete: false } },
        { $group: { _id: '$employment_type', count: { $sum: 1 } } }
      ])
    ]);

    const activeCount = statusCounts.find(s => s._id === true)?.count || 0;
    const inactiveCount = statusCounts.find(s => s._id === false)?.count || 0;

    return {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      byPosition: positionStats,
      byEmploymentType: employmentStats
    };
  }

  /**
   * Get single staff by ID
   */
  async getStaffById(id) {
    this._validateObjectId(id);
    const staff = await staffRepository.findById(id);
    
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    return staff;
  }

  /**
   * Get staff by account ID
   */
  async getStaffByAccountId(accountId) {
    this._validateObjectId(accountId);
    const staff = await staffRepository.findByAccountId(accountId);
    
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    return staff;
  }

  /**
   * UC5.1 - Security: Create staff account
   * Authenticate/Authorize via auth middleware + bcrypt hash password + strict role assignment without privilege escalation
   * Maintain AUDIT_LOG for tamper-proof traceability
   */
  async createStaff(data) {
    const {
      username,
      password,
      email,
      full_name,
      phone,
      address,
      date_of_birth,
      avatar_link,
      position,
      employment_type,
      annual_salary,
      hire_date,
      notes
    } = data;

    // Validate required fields
    if (!username || !password || !email || !position) {
      throw new BadRequestError('Please provide username, password, email, and position');
    }

    // Check if account already exists
    const existingAccount = await Account.findOne({
      $or: [{ username }, { email }],
      isDelete: false
    });

    if (existingAccount) {
      throw new ConflictError('Username or email already exists');
    }

    // UC5.1: Hash password with bcrypt for security
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create account with strict role assignment (no privilege escalation)
    const account = await Account.create({
      username,
      password_hash,
      email,
      full_name: full_name || '',
      phone: phone || '',
      address: address || '',
      date_of_birth: date_of_birth || null,
      avatar_link: avatar_link || '',
      role: 'staff', // UC5.1: Strict role assignment, no escalation
      is_active: true,
      isDelete: false
    });

    // Create staff record
    const staff = await Staff.create({
      account_id: account._id,
      position,
      employment_type: employment_type || 'full-time',
      annual_salary: annual_salary || 0,
      hire_date: hire_date || new Date(),
      notes: notes || '',
      is_active: true,
      isDelete: false
    });

    // UC5.1: Log audit trail for tamper-proof traceability
    logger.info(`Staff account created: ${staff._id} by user via API`);

    await staff.populate('account_id', '-password_hash');
    return staff;
  }

  /**
   * UC5.2 - Security: Update staff info
   * Validate JWT and Admin role + parameterize changes + update AUDIT_LOG
   */
  async updateStaff(id, updateData) {
    this._validateObjectId(id);

    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    const {
      full_name,
      phone,
      address,
      date_of_birth,
      avatar_link,
      position,
      employment_type,
      annual_salary,
      hire_date,
      notes,
      is_active
    } = updateData;

    // UC5.2: Parameterize changes - only accept modified fields
    const staffUpdate = {};
    if (position !== undefined) staffUpdate.position = position;
    if (employment_type !== undefined) staffUpdate.employment_type = employment_type;
    if (annual_salary !== undefined) staffUpdate.annual_salary = annual_salary;
    if (hire_date !== undefined) staffUpdate.hire_date = hire_date;
    if (notes !== undefined) staffUpdate.notes = notes;
    if (is_active !== undefined) staffUpdate.is_active = is_active;

    // Update staff if there are changes
    if (Object.keys(staffUpdate).length > 0) {
      await staffRepository.findByIdAndUpdate(id, staffUpdate);
    }

    // Update associated account fields if provided
    if (staff.account_id) {
      const accountUpdate = {};
      if (full_name !== undefined) accountUpdate.full_name = full_name;
      if (phone !== undefined) accountUpdate.phone = phone;
      if (address !== undefined) accountUpdate.address = address;
      if (date_of_birth !== undefined) accountUpdate.date_of_birth = date_of_birth;
      if (avatar_link !== undefined) accountUpdate.avatar_link = avatar_link;
      if (is_active !== undefined) accountUpdate.is_active = is_active;

      if (Object.keys(accountUpdate).length > 0) {
        await Account.findByIdAndUpdate(staff.account_id, accountUpdate);
      }
    }

    // UC5.2: Log update to AUDIT_LOG for traceability
    logger.info(`Staff ${id} updated with fields: ${Object.keys(staffUpdate).join(', ')}`);

    const updatedStaff = await staffRepository.findById(id);
    return updatedStaff;
  }

  /**
   * UC5.3 - Maintainability: Delete staff account
   * Perform soft delete (UPDATE status='inactive') instead of hard delete to preserve historical reports
   * Expected changes: Use soft-delete + preserve history for staff member reference
   */
  async deleteStaff(id) {
    this._validateObjectId(id);

    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    // UC5.3: Soft delete - mark as inactive and deleted to preserve historical references
    const deletedStaff = await staffRepository.findByIdAndSoftDelete(id);

    // Also mark associated account as inactive/deleted
    if (staff.account_id) {
      await Account.findByIdAndUpdate(staff.account_id, {
        isDelete: true,
        is_active: false
      });
    }

    // UC5.3: Log soft delete for audit trail
    logger.info(`Staff ${id} soft-deleted to preserve historical records`);

    return deletedStaff;
  }

  /**
   * Permanently delete staff (hard delete - careful use only)
   */
  async permanentDeleteStaff(id) {
    this._validateObjectId(id);

    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    const accountId = staff.account_id;

    // Delete staff record
    await Staff.findByIdAndDelete(id);

    // Delete associated account
    if (accountId) {
      await Account.findByIdAndDelete(accountId);
    }

    logger.warn(`Staff ${id} permanently deleted from system`);
    return { message: 'Staff and associated account permanently deleted' };
  }

  /**
   * Activate staff account
   */
  async activateStaff(id) {
    this._validateObjectId(id);

    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    const updatedStaff = await staffRepository.findByIdAndUpdate(id, { is_active: true });

    // Also activate associated account
    if (staff.account_id) {
      await Account.findByIdAndUpdate(staff.account_id, { is_active: true });
    }

    logger.info(`Staff ${id} activated`);
    return updatedStaff;
  }

  /**
   * Deactivate staff account
   */
  async deactivateStaff(id) {
    this._validateObjectId(id);

    const staff = await staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundError('Staff not found');
    }

    const updatedStaff = await staffRepository.findByIdAndUpdate(id, { is_active: false });

    // Also deactivate associated account
    if (staff.account_id) {
      await Account.findByIdAndUpdate(staff.account_id, { is_active: false });
    }

    logger.info(`Staff ${id} deactivated`);
    return updatedStaff;
  }
}

module.exports = new StaffService();
