// scripts/testAuth.js - Quick Authentication Test Script
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

let customerToken = '';
let adminToken = '';

// Test 1: Demo Admin Login
async function testAdminLogin() {
  try {
    log.info('Test 1: Demo Admin Login');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (response.data.success && response.data.data.token) {
      adminToken = response.data.data.token;
      log.success('Admin login thành công');
      log.info(`  Username: ${response.data.data.user.username}`);
      log.info(`  Role: ${response.data.data.user.role}`);
      log.info(`  Token: ${adminToken.substring(0, 30)}...`);
      return true;
    }
  } catch (error) {
    log.error(`Admin login thất bại: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 2: Register Customer
async function testRegisterCustomer() {
  try {
    log.info('Test 2: Register Customer');
    const timestamp = Date.now();
    const response = await axios.post(`${API_BASE}/auth/register/customer`, {
      username: `testcustomer${timestamp}`,
      password: 'test123456',
      email: `testcustomer${timestamp}@example.com`,
      full_name: 'Test Customer',
      phone: '0901234567',
      membership_type: 'silver'
    });

    if (response.data.success && response.data.data.token) {
      customerToken = response.data.data.token;
      log.success('Đăng ký customer thành công');
      log.info(`  Username: ${response.data.data.user.username}`);
      log.info(`  Email: ${response.data.data.user.email}`);
      log.info(`  Customer ID: ${response.data.data.user.customer_id}`);
      log.info(`  Token: ${customerToken.substring(0, 30)}...`);
      return true;
    }
  } catch (error) {
    log.error(`Register customer thất bại: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Get Customer Profile
async function testGetProfile() {
  try {
    log.info('Test 3: Get Customer Profile');
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    if (response.data.success) {
      log.success('Get profile thành công');
      log.info(`  Full Name: ${response.data.data.user.full_name}`);
      log.info(`  Email: ${response.data.data.user.email}`);
      log.info(`  Membership: ${response.data.data.user.membership_type}`);
      log.info(`  Points: ${response.data.data.user.points_balance}`);
      return true;
    }
  } catch (error) {
    log.error(`Get profile thất bại: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Update Profile
async function testUpdateProfile() {
  try {
    log.info('Test 4: Update Customer Profile');
    const response = await axios.put(`${API_BASE}/auth/update-profile`, {
      full_name: 'Test Customer Updated',
      phone: '0909999999'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    if (response.data.success) {
      log.success('Update profile thành công');
      log.info(`  New Full Name: ${response.data.data.user.full_name}`);
      log.info(`  New Phone: ${response.data.data.user.phone}`);
      return true;
    }
  } catch (error) {
    log.error(`Update profile thất bại: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Register Staff (Admin only)
async function testRegisterStaff() {
  try {
    log.info('Test 5: Register Staff (Admin only)');
    const timestamp = Date.now();
    const response = await axios.post(`${API_BASE}/auth/register/staff`, {
      username: `teststaff${timestamp}`,
      password: 'staff123456',
      email: `teststaff${timestamp}@supermarket.com`,
      full_name: 'Test Staff',
      phone: '0912345678',
      position: 'Cashier',
      employment_type: 'full-time',
      annual_salary: 120000000
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success) {
      log.success('Đăng ký staff thành công');
      log.info(`  Username: ${response.data.data.user.username}`);
      log.info(`  Email: ${response.data.data.user.email}`);
      log.info(`  Position: ${response.data.data.user.position}`);
      log.info(`  Staff ID: ${response.data.data.user.staff_id}`);
      return true;
    }
  } catch (error) {
    log.error(`Register staff thất bại: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Verify Token
async function testVerifyToken() {
  try {
    log.info('Test 6: Verify Token');
    const response = await axios.post(`${API_BASE}/auth/verify-token`, {
      token: customerToken
    });

    if (response.data.success) {
      log.success('Token hợp lệ');
      log.info(`  User ID: ${response.data.data.user.id}`);
      log.info(`  Role: ${response.data.data.user.role}`);
      return true;
    }
  } catch (error) {
    log.error(`Verify token thất bại: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Change Password
async function testChangePassword() {
  try {
    log.info('Test 7: Change Password');
    const response = await axios.put(`${API_BASE}/auth/change-password`, {
      current_password: 'test123456',
      new_password: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    if (response.data.success) {
      log.success('Đổi mật khẩu thành công');
      return true;
    }
  } catch (error) {
    log.error(`Change password thất bại: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 8: Error Cases
async function testErrorCases() {
  log.info('Test 8: Error Cases');
  
  // Test 8.1: Login với sai password
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'wrongpassword'
    });
    log.error('Expected error but got success');
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('8.1: Login sai password - Lỗi đúng như mong đợi (401)');
    }
  }

  // Test 8.2: Access protected route without token
  try {
    await axios.get(`${API_BASE}/auth/me`);
    log.error('Expected error but got success');
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('8.2: Access protected route không có token - Lỗi đúng (401)');
    }
  }

  // Test 8.3: Register với email không hợp lệ
  try {
    await axios.post(`${API_BASE}/auth/register/customer`, {
      username: 'testuser',
      password: 'test123',
      email: 'invalid-email'
    });
    log.error('Expected error but got success');
  } catch (error) {
    if (error.response?.status === 400) {
      log.success('8.3: Register với email không hợp lệ - Lỗi đúng (400)');
    }
  }

  // Test 8.4: Register với password quá ngắn
  try {
    await axios.post(`${API_BASE}/auth/register/customer`, {
      username: 'testuser2',
      password: '123',
      email: 'test@example.com'
    });
    log.error('Expected error but got success');
  } catch (error) {
    if (error.response?.status === 400) {
      log.success('8.4: Register với password quá ngắn - Lỗi đúng (400)');
    }
  }

  return true;
}

// Run all tests
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AUTHENTICATION SYSTEM TEST');
  console.log('='.repeat(60) + '\n');

  const results = {
    passed: 0,
    failed: 0
  };

  // Run tests sequentially
  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Register Customer', fn: testRegisterCustomer },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Register Staff', fn: testRegisterStaff },
    { name: 'Verify Token', fn: testVerifyToken },
    { name: 'Change Password', fn: testChangePassword },
    { name: 'Error Cases', fn: testErrorCases }
  ];

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    console.log(''); // Empty line between tests
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  log.success(`Passed: ${results.passed}/${tests.length}`);
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed}/${tests.length}`);
  }
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0) {
    log.success('🎉 TẤT CẢ TESTS ĐỀU PASS!');
  } else {
    log.warning('⚠️  MỘT SỐ TESTS BỊ FAIL, VUI LÒNG KIỂM TRA LẠI!');
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/api/health');
    return true;
  } catch (error) {
    log.error('Server không chạy hoặc không thể kết nối!');
    log.info('Vui lòng chạy: npm run dev');
    return false;
  }
}

// Main
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
  process.exit(0);
})();
