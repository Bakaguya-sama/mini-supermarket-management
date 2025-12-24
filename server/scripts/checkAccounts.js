// Check database accounts
const mongoose = require('mongoose');
const { Account, Customer, Staff } = require('../models');

mongoose.connect('mongodb://localhost:27017/mini_supermarket')
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Check accounts
    const accounts = await Account.find({ isDelete: false }).limit(5);
    console.log(`=== ACCOUNTS (${accounts.length}) ===`);
    accounts.forEach(acc => {
      console.log(`- ${acc.username} | ${acc.email} | ${acc.role} | hasPassword: ${!!acc.password_hash}`);
    });
    
    // Check customers
    const customers = await Customer.find({ isDelete: false }).limit(5);
    console.log(`\n=== CUSTOMERS (${customers.length}) ===`);
    for (const cust of customers) {
      const acc = await Account.findById(cust.account_id);
      if (acc) {
        console.log(`- ${acc.username} | ${acc.email} | membership: ${cust.membership_type}`);
      }
    }
    
    // Check staff
    const staffs = await Staff.find({ isDelete: false }).limit(5);
    console.log(`\n=== STAFF (${staffs.length}) ===`);
    for (const staff of staffs) {
      const acc = await Account.findById(staff.account_id);
      if (acc) {
        console.log(`- ${acc.username} | ${acc.email} | position: ${staff.position}`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
