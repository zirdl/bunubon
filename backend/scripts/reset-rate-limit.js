/**
 * Reset Rate Limiter
 * 
 * This script clears the rate limiter cache
 * Run this if you're stuck with 429 errors
 * 
 * Usage: node scripts/reset-rate-limit.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== Rate Limiter Reset ===\n');

// The rate limiter stores state in memory, so restarting the server resets it
// But we can also clear any related files if they exist

const sessionsDir = path.join(__dirname, '..', 'sessions');
const rateLimitFiles = [
  path.join(sessionsDir, 'rate-limit.db'),
  path.join(sessionsDir, 'rate-limit.sqlite'),
  path.join(sessionsDir, 'rate-limit.json')
];

let found = false;
rateLimitFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`✓ Deleted: ${path.basename(file)}`);
      found = true;
    } catch (err) {
      console.log(`✗ Failed to delete: ${path.basename(file)}`);
      console.log(`  Error: ${err.message}`);
    }
  }
});

if (!found) {
  console.log('No rate limit files found.');
}

console.log('\n=== Instructions ===');
console.log('The rate limiter stores data in memory.');
console.log('To fully reset it, restart the backend server:');
console.log('  1. Stop the server (Ctrl+C)');
console.log('  2. Start it again: npm run dev');
console.log('\nAfter restart, you can login without 429 errors.\n');
