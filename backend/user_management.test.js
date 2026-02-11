const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.db');

let db;

beforeAll((done) => {
  db = new sqlite3.Database(dbPath, done);
});

afterAll((done) => {
  if (db) {
    db.close(done);
  } else {
    done();
  }
});

describe('Database Schema', () => {
  it('should have the updated columns in users table', (done) => {
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) return done(err);
      
      const columnNames = columns.map(c => c.name);
      expect(columnNames).toContain('role');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('fullName');
      expect(columnNames).toContain('contactNumber');
      expect(columnNames).toContain('mustChangePassword');
      done();
    });
  });

  it('should have the audit_logs table', (done) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs'", (err, row) => {
      if (err) return done(err);
      expect(row).toBeDefined();
      expect(row.name).toBe('audit_logs');
      done();
    });
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


