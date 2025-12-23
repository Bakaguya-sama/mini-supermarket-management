// Test verify password
const bcrypt = require('bcryptjs');

const testPassword = '12345678';
const hashedFromDB = '$2b$10$t2SCiAwUEQHtia.ywgL.WuNmzmj1r3Em6Mz0pkwollSsT3clzPvm';

async function test() {
  console.log('Testing password verification...\n');
  
  // Test 1: Verify với password từ DB
  const isValid = await bcrypt.compare(testPassword, hashedFromDB);
  console.log(`Password "${testPassword}" với hash từ DB:`);
  console.log(`Result: ${isValid ? '✅ MATCH' : '❌ NOT MATCH'}\n`);
  
  // Test 2: Tạo hash mới và verify
  const newHash = await bcrypt.hash(testPassword, 10);
  console.log(`Hash mới từ "${testPassword}":`);
  console.log(newHash);
  
  const isValid2 = await bcrypt.compare(testPassword, newHash);
  console.log(`Verify: ${isValid2 ? '✅ MATCH' : '❌ NOT MATCH'}\n`);
}

test();
