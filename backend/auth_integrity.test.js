const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const { ensureAdmin } = require('./utils/authUtils');

const dbPath = path.join(__dirname, 'database.db');

describe('Authentication Integrity', () => {
  let db;

  beforeAll(() => {
    db = new Database(dbPath);
  });

  afterAll(() => {
    db.close();
  });

  it('should ensure admin has a valid Bcrypt hash of admin123', async () => {
    await ensureAdmin(db);

    const stmt = db.prepare("SELECT password FROM users WHERE username = 'admin'");
    const user = stmt.get();

    expect(user).toBeDefined();
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // Standard Bcrypt regex
    expect(bcrypt.compareSync('admin123', user.password)).toBe(true);
  });

  it('should maintain admin password after repeated ensureAdmin calls', async () => {
    const stmt = db.prepare("SELECT password FROM users WHERE username = 'admin'");
    const initialUser = stmt.get();

    await ensureAdmin(db);
    await ensureAdmin(db);

    const finalUser = stmt.get();

    expect(bcrypt.compareSync('admin123', finalUser.password)).toBe(true);
  });
});
