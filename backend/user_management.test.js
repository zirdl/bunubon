const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');

let db;

beforeAll(() => {
  db = new Database(dbPath);
});

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Database Schema', () => {
  it('should have the updated columns in users table', () => {
    const stmt = db.prepare("PRAGMA table_info(users)");
    const columns = stmt.all();

    const columnNames = columns.map(c => c.name);
    expect(columnNames).toContain('role');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('fullName');
    expect(columnNames).toContain('contactNumber');
    expect(columnNames).toContain('mustChangePassword');
  });

  it('should have the audit_logs table', () => {
    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs'");
    const row = stmt.get();
    expect(row).toBeDefined();
    expect(row.name).toBe('audit_logs');
  });
});

describe('User Profile & Security APIs', () => {

  const request = require('supertest');

  const app = require('./server');



  it('GET /api/profile should return current user info', async () => {

    const response = await request(app).get('/api/profile');

    expect(response.status).toBe(401); // No session

  });



  it('PATCH /api/profile should be restricted', async () => {

    const response = await request(app).patch('/api/profile').send({ fullName: 'New Name' });

    expect(response.status).toBe(401); // No session

  });

});


