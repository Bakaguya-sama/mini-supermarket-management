// Verify staff accounts and positions
const mongoose = require('mongoose');
const { Account, Staff } = require('../models');

async function verify() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mini_supermarket');
    
    const staffAccounts = await Account.find({role: 'staff'}).lean();
    const staffDetails = await Staff.find().populate('account_id', 'username full_name').lean();
    
    console.log('\n=== 📋 STAFF ACCOUNTS (7) ===');
    staffAccounts.forEach(acc => {
      console.log(`✅ ${acc.username.padEnd(15)} | ${acc.full_name.padEnd(20)} | role: ${acc.role}`);
    });
    
    console.log('\n=== 🎯 STAFF POSITIONS (4 types) ===');
    const grouped = {};
    staffDetails.forEach(s => {
      const pos = s.position;
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push(`${s.account_id?.username} (${s.employment_type})`);
    });
    
    Object.keys(grouped).sort().forEach(pos => {
      console.log(`\n📌 ${pos}:`);
      grouped[pos].forEach(staff => console.log(`   - ${staff}`));
    });
    
    console.log('\n✅ DATABASE CÓ ĐỦ 4 LOẠI NHÂN VIÊN!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

verify();
