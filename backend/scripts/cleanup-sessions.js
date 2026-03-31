/**
 * Session Cleanup Utility
 * 
 * Run this periodically to clean up expired sessions from the database
 * Usage: node scripts/cleanup-sessions.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const sessionsDbPath = path.join(__dirname, '..', 'sessions', 'sessions.db');
const db = new sqlite3.Database(sessionsDbPath);

console.log(`--- Session Cleanup [${new Date().toISOString()}] ---`);
console.log(`Database: ${sessionsDbPath}`);

// Clean up sessions older than 24 hours
const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);

db.run('DELETE FROM sessions WHERE ? > expiredAt', [twentyFourHoursAgo], function(err) {
  if (err) {
    console.error('Error cleaning up sessions:', err.message);
  } else {
    console.log(`Cleaned up ${this.changes} expired session(s)`);
  }
  
  // Vacuum the database to reclaim space
  db.run('VACUUM', (vacuumErr) => {
    if (vacuumErr) {
      console.error('Error vacuuming database:', vacuumErr.message);
    } else {
      console.log('Database vacuumed successfully');
    }
    
    db.close((closeErr) => {
      if (closeErr) {
        console.error('Error closing database:', closeErr.message);
      } else {
        console.log('Cleanup complete!');
      }
    });
  });
});
