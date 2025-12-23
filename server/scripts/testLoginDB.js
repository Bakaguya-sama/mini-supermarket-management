const axios = require('axios');

const API = 'http://localhost:5000/api';

async function testLogin() {
  console.log('\n=== TEST LOGIN VỚI ACCOUNTS TỪ DATABASE ===\n');
  
  const tests = [
    { username: 'admin', password: 'password123', label: 'Admin (DB)' },
    { username: 'customer1', password: 'password123', label: 'Customer 1' },
    { username: 'customer2', password: 'password123', label: 'Customer 2' },
    { username: 'staff1', password: 'password123', label: 'Staff 1' },
    { username: 'staff2', password: 'password123', label: 'Staff 2' },
    { username: 'admin', password: 'admin123', label: 'Demo Admin (Hardcoded)' }
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.label} (${test.username}/${test.password})...`);
      
      const res = await axios.post(`${API}/auth/login`, {
        username: test.username,
        password: test.password
      });
      
      if (res.data.success) {
        const user = res.data.data.user;
        console.log(`✅ SUCCESS`);
        console.log(`   - Username: ${user.username}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Full Name: ${user.full_name}`);
        if (user.is_demo) console.log(`   - IS DEMO: true`);
        console.log(`   - Token: ${res.data.data.token.substring(0, 40)}...`);
      } else {
        console.log(`❌ FAILED: ${res.data.message}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('');
  }
}

testLogin();
