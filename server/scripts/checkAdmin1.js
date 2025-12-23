// Test register staff với password cụ thể
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Account } = require('../models');

mongoose.connect('mongodb://localhost:27017/mini_supermarket')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Tìm account admin1
    const account = await Account.findOne({ username: 'admin1' });
    
    if (account) {
      console.log('Found account admin1:');
      console.log('- Username:', account.username);
      console.log('- Email:', account.email);
      console.log('- Password Hash:', account.password_hash);
      console.log('- Full Name:', account.full_name);
      console.log('');
      
      // Test các passwords khác nhau
      const testPasswords = ['12345678', 'password123', 'admin123', '123456'];
      
      console.log('Testing passwords:');
      for (const pwd of testPasswords) {
        const isValid = await bcrypt.compare(pwd, account.password_hash);
        console.log(`  "${pwd}": ${isValid ? '✅ MATCH' : '❌ NO'}`);
      }
      
    } else {
      console.log('Account admin1 not found!');
    }
    
    await mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
