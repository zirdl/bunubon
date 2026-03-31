/**
 * Custom Session Store for better-sqlite3
 * Compatible with express-session
 */

const EventEmitter = require('events');

class BetterSQLiteSessionStore extends EventEmitter {
  constructor(options = {}) {
    super();
    this.db = options.db;
    this.table = options.table || 'sessions';
    
    // Create sessions table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        sid TEXT PRIMARY KEY,
        json TEXT NOT NULL,
        expiredAt DATETIME NOT NULL
      )
    `);
    
    // Create index for cleanup
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_expired ON ${this.table}(expiredAt)
    `);
    
    // Cleanup expired sessions every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.clearExpiredSessions();
    }, 60000);
    
    // Don't prevent Node from exiting
    this.cleanupInterval.unref();
  }
  
  // Get session by SID
  get(sid, callback) {
    try {
      const stmt = this.db.prepare(`SELECT json FROM ${this.table} WHERE sid = ? AND expiredAt > ?`);
      const row = stmt.get(sid, Date.now());
      
      if (!row) {
        return callback(null, null);
      }
      
      callback(null, JSON.parse(row.json));
    } catch (err) {
      callback(err);
    }
  }
  
  // Set/Update session
  set(sid, session, callback) {
    try {
      const expiredAt = new Date(Date.now() + (session.cookie?.maxAge || 86400000)).toISOString();
      const json = JSON.stringify(session);
      
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ${this.table} (sid, json, expiredAt)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(sid, json, expiredAt);
      
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }
  
  // Touch session (update expiry)
  touch(sid, session, callback) {
    try {
      const expiredAt = new Date(Date.now() + (session.cookie?.maxAge || 86400000)).toISOString();
      
      const stmt = this.db.prepare(`
        UPDATE ${this.table} SET expiredAt = ? WHERE sid = ?
      `);
      
      stmt.run(expiredAt, sid);
      
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }
  
  // Destroy session
  destroy(sid, callback) {
    try {
      const stmt = this.db.prepare(`DELETE FROM ${this.table} WHERE sid = ?`);
      stmt.run(sid);
      
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }
  
  // Clear all sessions
  clear(callback) {
    try {
      const stmt = this.db.prepare(`DELETE FROM ${this.table}`);
      stmt.run();
      
      callback?.(null);
    } catch (err) {
      callback?.(err);
    }
  }
  
  // Get session count
  length(callback) {
    try {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.table} WHERE expiredAt > ?`);
      const row = stmt.get(Date.now());
      
      callback(null, row.count);
    } catch (err) {
      callback(err);
    }
  }
  
  // Get all sessions
  all(callback) {
    try {
      const stmt = this.db.prepare(`SELECT json FROM ${this.table} WHERE expiredAt > ?`);
      const rows = stmt.all(Date.now());
      
      const sessions = rows.map(row => JSON.parse(row.json));
      callback(null, sessions);
    } catch (err) {
      callback(err);
    }
  }
  
  // Clear expired sessions
  clearExpiredSessions() {
    try {
      const stmt = this.db.prepare(`DELETE FROM ${this.table} WHERE expiredAt <= ?`);
      stmt.run(Date.now());
    } catch (err) {
      this.emit('error', err);
    }
  }
  
  // Cleanup on close
  close() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

module.exports = function(session) {
  const Store = session.Store || session.SessionStore;
  
  class BetterSQLiteStore extends Store {
    constructor(options = {}) {
      super();
      this.store = new BetterSQLiteSessionStore(options);
      
      // Proxy methods to internal store
      this.get = this.store.get.bind(this.store);
      this.set = this.store.set.bind(this.store);
      this.touch = this.store.touch.bind(this.store);
      this.destroy = this.store.destroy.bind(this.store);
      this.clear = this.store.clear.bind(this.store);
      this.length = this.store.length.bind(this.store);
      this.all = this.store.all.bind(this.store);
    }
  }
  
  return BetterSQLiteStore;
};
