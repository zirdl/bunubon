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

describe('Audit Logger', () => {
  const { logAudit } = require('./utils/auditLogger');
  
  it('should log an action to the audit_logs table', (done) => {
    const userId = 'test-user-id';
    const action = 'TEST_ACTION';
    const details = { key: 'value' };
    
    logAudit(db, userId, action, details);
    
    // Give it a small delay since db.run is async and not promisified in the utility yet
    setTimeout(() => {
      db.get("SELECT * FROM audit_logs WHERE action = 'TEST_ACTION'", (err, row) => {
        if (err) return done(err);
        try {
          expect(row).toBeDefined();
          expect(row.userId).toBe(userId);
          expect(row.action).toBe(action);
          expect(JSON.parse(row.details)).toEqual(details);
          done();
        } catch (e) {
          done(e);
        }
      });
    }, 100);
  });
});