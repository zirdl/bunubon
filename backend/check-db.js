const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

console.log('=== Database User Check ===\n');

try {
  // Check if users table exists
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (!tableCheck) {
    console.log('❌ Users table does not exist!');
    process.exit(1);
  }
  console.log('✓ Users table exists');

  // Get all users
  const users = db.prepare('SELECT id, username, role, status, substr(password, 1, 20) as password_preview FROM users').all();
  console.log(`\n✓ Found ${users.length} user(s):\n`);
  
  users.forEach(user => {
    console.log(`  - ${user.username} (${user.role}, ${user.status}) - Password: ${user.password_preview}...`);
  });

  // Check admin specifically
  const admin = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  if (admin) {
    console.log('\n=== Admin User Details ===');
    console.log(`ID: ${admin.id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Status: ${admin.status}`);
    console.log(`Password Hash: ${admin.password.substring(0, 30)}...`);
    console.log(`Full Name: ${admin.fullName || '(empty)'}`);
    console.log(`Email: ${admin.email || '(empty)'}`);
    
    // Test password
    const testPassword = bcrypt.compareSync('admin123', admin.password);
    console.log(`\nPassword 'admin123' matches: ${testPassword ? '✅ YES' : '❌ NO'}`);
    
    if (!testPassword) {
      console.log('\n⚠️  Password does not match! Resetting to admin123...');
      const newHash = bcrypt.hashSync('admin123', 10);
      db.prepare("UPDATE users SET password = ? WHERE username = 'admin'").run(newHash);
      console.log('✅ Password reset to admin123');
      
      // Verify
      const updated = db.prepare("SELECT password FROM users WHERE username = 'admin'").get();
      const verify = bcrypt.compareSync('admin123', updated.password);
      console.log(`Verification: ${verify ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
  } else {
    console.log('\n❌ Admin user does not exist! Creating...');
    const crypto = require('crypto');
    const adminId = crypto.randomUUID();
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO users (id, username, password, role, fullName, email, status, mustChangePassword)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin', hashedPassword, 'ADMIN', 'Administrator', 'admin@dar.gov.ph', 'ACTIVE', 0);
    
    console.log('✅ Admin user created');
  }

  console.log('\n=== Session Store Check ===');
  const sessionTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'").get();
  if (sessionTable) {
    const count = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
    console.log(`Sessions table exists with ${count.count} session(s)`);
    if (count.count > 0) {
      console.log('Clearing old sessions...');
      db.prepare('DELETE FROM sessions').run();
      console.log('✅ Sessions cleared');
    }
  } else {
    console.log('Sessions table will be created on first login');
  }

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
} finally {
  db.close();
}

console.log('\n✅ Database check complete!');
console.log('\nLogin credentials:');
console.log('  Username: admin');
console.log('  Password: admin123');
