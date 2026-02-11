const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { ensureAdmin } = require('./utils/authUtils');

const dbPath = path.join(__dirname, 'database.db');

describe('Authentication Integrity', () => {
  let db;

  beforeAll((done) => {
    db = new sqlite3.Database(dbPath, done);
  });

  afterAll((done) => {
    db.close(done);
  });

  it('should ensure admin has a valid Bcrypt hash of admin123', async () => {
    await ensureAdmin(db);

    const user = await new Promise((resolve, reject) => {
      db.get("SELECT password FROM users WHERE username = 'admin'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(user).toBeDefined();
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // Standard Bcrypt regex
    expect(bcrypt.compareSync('admin123', user.password)).toBe(true);
  });

  it('should maintain admin password after repeated ensureAdmin calls', async () => {
    const initialUser = await new Promise((resolve, reject) => {
      db.get("SELECT password FROM users WHERE username = 'admin'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    await ensureAdmin(db);
    await ensureAdmin(db);

    const finalUser = await new Promise((resolve, reject) => {
      db.get("SELECT password FROM users WHERE username = 'admin'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Hash might change if re-generated, but should still match admin123
    // In our implementation, we don't re-generate if it's already Bcrypt and matches admin123
    // Actually our ensureAdmin currently doesn't check IF it matches admin123, just IF it's Bcrypt.
    // If we want it to BE admin123, we'd need to check bcrypt.compareSync
    expect(bcrypt.compareSync('admin123', finalUser.password)).toBe(true);
  });
});
