const axios = require('axios');

async function testLogin() {
  console.log('\n=== TEST LOGIN ADMIN1 ===\n');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin1',
      password: '12345678'
    });
    
    console.log('✅ LOGIN THÀNH CÔNG!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ LOGIN THẤT BẠI!');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
  }
}

testLogin();
