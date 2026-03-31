/**
 * Session Test Script
 * 
 * This script tests if the session middleware is properly configured
 * Run: node scripts/test-session.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== Session Configuration Test ===\n');

// 1. Check sessions directory
const sessionsDir = path.join(__dirname, '..', 'sessions');
console.log('1. Checking sessions directory...');
console.log(`   Path: ${sessionsDir}`);

if (fs.existsSync(sessionsDir)) {
  console.log('   ✓ Directory exists');
  
  try {
    fs.accessSync(sessionsDir, fs.constants.W_OK);
    console.log('   ✓ Directory is writable');
  } catch (err) {
    console.log('   ✗ Directory is NOT writable');
    console.log('   Fix: chmod 755', sessionsDir);
  }
  
  const files = fs.readdirSync(sessionsDir);
  console.log(`   Contents: ${files.length} file(s)`);
  files.forEach(f => console.log(`      - ${f}`));
} else {
  console.log('   ✗ Directory does NOT exist');
  console.log('   Fix: mkdir -p', sessionsDir);
}

// 2. Check .env file
console.log('\n2. Checking .env file...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✓ .env exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('SESSION_SECRET')) {
    console.log('   ✓ SESSION_SECRET is set');
    const secretMatch = envContent.match(/SESSION_SECRET=(.+)/);
    if (secretMatch && secretMatch[1].length >= 32) {
      console.log('   ✓ SESSION_SECRET is long enough');
    } else {
      console.log('   ⚠ SESSION_SECRET might be too short (min 32 chars recommended)');
    }
  } else {
    console.log('   ✗ SESSION_SECRET is NOT set');
  }
  
  if (envContent.includes('HTTPS_ENABLED')) {
    console.log('   ✓ HTTPS_ENABLED is configured');
  } else {
    console.log('   ℹ HTTPS_ENABLED not set (defaults to false)');
  }
} else {
  console.log('   ✗ .env does NOT exist');
  console.log('   Fix: Copy .env.example to .env and configure');
}

// 3. Check session database
console.log('\n3. Checking session database...');
const sessionDbPath = path.join(sessionsDir, 'sessions.db');
if (fs.existsSync(sessionDbPath)) {
  console.log('   ✓ Session database exists');
  const stats = fs.statSync(sessionDbPath);
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
  console.log('   ℹ Session database does not exist yet (will be created on first login)');
}

// 4. Check required packages
console.log('\n4. Checking required packages...');
const packages = ['express-session', 'connect-sqlite3', 'bcryptjs'];
packages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`   ✓ ${pkg} is installed`);
  } catch (err) {
    console.log(`   ✗ ${pkg} is NOT installed`);
    console.log(`   Fix: npm install ${pkg}`);
  }
});

console.log('\n=== Test Complete ===\n');
console.log('If all checks passed, restart the server and try logging in.');
console.log('If any checks failed, fix the issues above before restarting.\n');
