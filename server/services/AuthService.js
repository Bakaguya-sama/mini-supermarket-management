// server/services/AuthService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const accountRepository = require('../repositories/AccountRepository');
const customerRepository = require('../repositories/CustomerRepository');
const staffRepository = require('../repositories/StaffRepository');
const managerRepository = require('../repositories/ManagerRepository');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../middleware/errorClasses');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  generateToken(userId, role, email) {
    return jwt.sign(
      { id: userId, role, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async registerCustomer(data) {
    const { username, email, password } = data;

    // Check existing
    const existingUsername = await accountRepository.findByUsername(username);
    if (existingUsername) throw new BadRequestError('Username already exists');

    const existingEmail = await accountRepository.findByEmail(email);
    if (existingEmail) throw new BadRequestError('Email already exists');

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Create Account
    const account = await accountRepository.create({
      ...data,
      username: username.toLowerCase(),
      password_hash,
      email: email.toLowerCase(),
      role: 'customer',
      is_active: true
    });

    // Create Customer profile
    const customer = await customerRepository.create({
      account_id: account._id,
      membership_type: data.membership_type || 'basic',
      registered_at: new Date()
    });

    const token = this.generateToken(account._id, account.role, account.email);

    return { token, account, customer };
  }

  async registerStaff(data) {
    const { username, password, email, position } = data;

    // Validate required fields (Controller already does basic check, but good to have here too)
    if (!username || !password || !email || !position) {
      throw new BadRequestError('Username, password, email and position are required');
    }

    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    // Check existing
    const existingUsername = await accountRepository.findByUsername(username);
    if (existingUsername) throw new BadRequestError('Username already exists');

    const existingEmail = await accountRepository.findByEmail(email);
    if (existingEmail) throw new BadRequestError('Email already exists');

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Create Account
    const account = await accountRepository.create({
      ...data,
      username: username.toLowerCase(),
      password_hash,
      email: email.toLowerCase(),
      role: 'staff',
      is_active: true
    });

    // Create Staff profile
    const staff = await staffRepository.create({
      account_id: account._id,
      position,
      employment_type: data.employment_type || 'full-time',
      annual_salary: data.annual_salary || 0,
      hire_date: data.hire_date || new Date(),
      notes: data.notes || '',
      is_active: true
    });

    return { account, staff };
  }

  async login(username, password) {
    // Handle demo account
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      const token = this.generateToken('demo-admin-id', 'admin', 'admin@supermarket.com');
      return {
        token,
        account: {
          _id: 'demo-admin-id',
          username: 'admin',
          role: 'admin',
          email: 'admin@supermarket.com',
          full_name: 'Demo Manager'
        },
        profile: null
      };
    }

    const account = await accountRepository.findByUsername(username);
    if (!account || !account.password_hash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await this.comparePassword(password, account.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.generateToken(account._id, account.role, account.email);
    
    // Get profile based on role
    let profile = null;
    if (account.role === 'customer') {
      profile = await customerRepository.findByAccountId(account._id);
    } else if (account.role === 'staff' || account.role === 'admin') {
      profile = await staffRepository.findByAccountId(account._id);
    }

    return { token, account, profile };
  }

  async getProfile(userId) {
    // Handle demo admin account
    if (userId === 'demo-admin-id') {
      return {
        id: 'demo-admin-id',
        username: 'admin',
        email: 'admin@supermarket.com',
        full_name: 'Demo Manager',
        role: 'admin',
        is_demo: true
      };
    }

    const account = await accountRepository.findById(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    let userData = {
      id: account._id,
      username: account.username,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      address: account.address,
      date_of_birth: account.date_of_birth,
      avatar_link: account.avatar_link,
      role: account.role
    };

    if (account.role === 'customer') {
      const customer = await customerRepository.findByAccountId(account._id);
      if (customer) {
        userData.customer_id = customer._id;
        userData.membership_type = customer.membership_type;
        userData.points_balance = customer.points_balance;
        userData.total_spent = customer.total_spent;
      }
    } else if (account.role === 'staff' || account.role === 'admin') {
      const staff = await staffRepository.findByAccountId(account._id);
      if (staff) {
        userData.staff_id = staff._id;
        userData.position = staff.position;
        userData.employment_type = staff.employment_type;
        userData.annual_salary = staff.annual_salary;
        userData.hire_date = staff.hire_date;

        const manager = await managerRepository.findByAccountId(account._id);
        if (manager) {
          userData.is_manager = true;
          userData.manager_id = manager._id;
          userData.access_level = manager.access_level;
          userData.is_superuser = manager.is_superuser;
        }
      }
    }

    return userData;
  }

  async updateProfile(userId, updateData) {
    if (userId === 'demo-admin-id') {
      throw new BadRequestError('Cannot update demo account');
    }

    const account = await accountRepository.findById(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    const { full_name, phone, address, date_of_birth, avatar_link } = updateData;

    // Update fields if provided
    if (full_name !== undefined) account.full_name = full_name;
    if (phone !== undefined) account.phone = phone;
    if (address !== undefined) account.address = address;
    if (date_of_birth !== undefined) account.date_of_birth = date_of_birth;
    if (avatar_link !== undefined) account.avatar_link = avatar_link;

    await accountRepository.save(account);

    return {
      id: account._id,
      username: account.username,
      email: account.email,
      full_name: account.full_name,
      phone: account.phone,
      address: account.address,
      date_of_birth: account.date_of_birth,
      avatar_link: account.avatar_link,
      role: account.role
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (userId === 'demo-admin-id') {
      throw new BadRequestError('Cannot change password for demo account');
    }

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current and new passwords are required');
    }

    if (newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters');
    }

    const account = await accountRepository.findById(userId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    const isMatch = await this.comparePassword(currentPassword, account.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    account.password_hash = await this.hashPassword(newPassword);
    await accountRepository.save(account);

    return true;
  }

  verifyToken(token) {
    if (!token) {
      throw new BadRequestError('Token is required');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();

