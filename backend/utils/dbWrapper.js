/**
 * Database Wrapper for better-sqlite3
 * Supports both callback and Promise/async-await API
 */

class DatabaseWrapper {
  constructor(db) {
    this.db = db;
  }

  // Support both callback and promise styles
  get(sql, params, callback) {
    if (callback) {
      // Callback style
      try {
        const stmt = this.db.prepare(sql);
        const row = stmt.get(...params);
        callback(null, row);
      } catch (err) {
        callback(err, null);
      }
    } else {
      // Promise style
      return new Promise((resolve, reject) => {
        try {
          const stmt = this.db.prepare(sql);
          const row = stmt.get(...params);
          resolve(row);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  // Support both callback and promise styles
  all(sql, params, callback) {
    if (callback) {
      // Callback style
      try {
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        callback(null, rows);
      } catch (err) {
        callback(err, null);
      }
    } else {
      // Promise style
      return new Promise((resolve, reject) => {
        try {
          const stmt = this.db.prepare(sql);
          const rows = stmt.all(...params);
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  // Support both callback and promise styles
  run(sql, params, callback) {
    if (callback) {
      // Callback style
      try {
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...params);
        callback(null, {
          lastID: result.lastInsertRowid,
          changes: result.changes
        });
      } catch (err) {
        callback(err, null);
      }
    } else {
      // Promise style
      return new Promise((resolve, reject) => {
        try {
          const stmt = this.db.prepare(sql);
          const result = stmt.run(...params);
          resolve({
            lastID: result.lastInsertRowid,
            changes: result.changes
          });
        } catch (err) {
          reject(err);
        }
      });
    }
  }

  // Direct access to better-sqlite3 methods
  prepare(sql) {
    return this.db.prepare(sql);
  }

  pragma(sql) {
    return this.db.pragma(sql);
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseWrapper;
