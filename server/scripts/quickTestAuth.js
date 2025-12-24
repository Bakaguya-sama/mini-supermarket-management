// Quick test authentication
const axios = require('axios');

const API = 'http://localhost:5000/api';

async function test() {
  console.log('\n=== TEST AUTHENTICATION ===\n');
  
  try {
    // Test 1: Register customer
    console.log('1. Đăng ký customer mới...');
    const registerRes = await axios.post(`${API}/auth/register/customer`, {
      username: 'testuser123',
      password: '123456',
      email: 'testuser123@test.com',
      full_name: 'Test User'
    });
    
    console.log('✅ Đăng ký thành công!');
    console.log('Username:', registerRes.data.data.user.username);
    console.log('Email:', registerRes.data.data.user.email);
    console.log('Token:', registerRes.data.data.token.substring(0, 30) + '...');
    
    // Test 2: Login with registered account
    console.log('\n2. Đăng nhập với tài khoản vừa tạo...');
    const loginRes = await axios.post(`${API}/auth/login`, {
      username: 'testuser123',
      password: '123456'
    });
    
    console.log('✅ Đăng nhập thành công!');
    console.log('Username:', loginRes.data.data.user.username);
    console.log('Role:', loginRes.data.data.user.role);
    console.log('Token:', loginRes.data.data.token.substring(0, 30) + '...');
    
    // Test 3: Get profile
    console.log('\n3. Lấy thông tin profile...');
    const profileRes = await axios.get(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${loginRes.data.data.token}` }
    });
    
    console.log('✅ Get profile thành công!');
    console.log('Full Name:', profileRes.data.data.user.full_name);
    console.log('Email:', profileRes.data.data.user.email);
    console.log('Customer ID:', profileRes.data.data.user.customer_id);
    
    console.log('\n✅ TẤT CẢ TESTS PASS!\n');
    
  } catch (error) {
    console.error('\n❌ LỖI:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Chi tiết:', error.response.data);
    }
  }
}

test();
