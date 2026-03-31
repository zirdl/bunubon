const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Check if db is better-sqlite3 native (has prepare method) or wrapper (has get method returning promise)
 */
const isNativeDb = (db) => {
  return typeof db.prepare === 'function' && typeof db.get !== 'function';
};

/**
 * Ensures a default admin user exists in the database with correct credentials and roles.
 * Works with both better-sqlite3 native and wrapped async API.
 * @param {Object} db - The SQLite database instance.
 * @returns {Promise<void>}
 */
const ensureAdmin = (db) => {
  return new Promise((resolve, reject) => {
    try {
      if (isNativeDb(db)) {
        // Native better-sqlite3
        ensureAdminSync(db);
        resolve();
      } else {
        // Wrapped async API
        const defaultPassword = 'admin123';
        const username = 'admin';

        db.get("SELECT id, password FROM users WHERE username = ?", [username])
          .then(row => {
            const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
            const adminId = crypto.randomUUID();

            if (!row) {
              console.log(`[${new Date().toISOString()}] Creating default admin user...`);
              return db.run(
                "INSERT INTO users (id, username, password, role, fullName, email, status, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [adminId, username, hashedPassword, 'ADMIN', 'Administrator', 'admin@dar.gov.ph', 'ACTIVE', 0]
              );
            } else {
              const isSha256 = /^[a-f0-9]{64}$/i.test(row.password);
              const isDefault = bcrypt.compareSync(defaultPassword, row.password);

              if (isSha256) {
                console.log(`[${new Date().toISOString()}] Outdated SHA-256 hash detected for admin. Upgrading to Bcrypt...`);
                return db.run(
                  "UPDATE users SET password = ?, role = 'ADMIN', status = 'ACTIVE' WHERE username = ?",
                  [hashedPassword, username]
                );
              } else {
                return db.run(
                  "UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE username = ?",
                  [username]
                );
              }
            }
          })
          .then(() => {
            console.log(`[${new Date().toISOString()}] Admin check complete.`);
            resolve();
          })
          .catch(err => reject(err));
      }
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Synchronous version of ensureAdmin for better-sqlite3 native API.
 * @param {Object} db - The better-sqlite3 database instance.
 * @returns {void}
 */
const ensureAdminSync = (db) => {
  const defaultPassword = 'admin123';
  const username = 'admin';

  const selectStmt = db.prepare("SELECT id, password FROM users WHERE username = ?");
  const row = selectStmt.get(username);

  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
  const adminId = crypto.randomUUID();

  if (!row) {
    console.log(`[${new Date().toISOString()}] Creating default admin user...`);
    const insertStmt = db.prepare(
      "INSERT INTO users (id, username, password, role, fullName, email, status, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    insertStmt.run(adminId, username, hashedPassword, 'ADMIN', 'Administrator', 'admin@dar.gov.ph', 'ACTIVE', 0);
    console.log(`[${new Date().toISOString()}] Successfully created default admin user.`);
  } else {
    const isSha256 = /^[a-f0-9]{64}$/i.test(row.password);
    const isDefault = bcrypt.compareSync(defaultPassword, row.password);

    if (isSha256) {
      console.log(`[${new Date().toISOString()}] Outdated SHA-256 hash detected for admin. Upgrading to Bcrypt...`);
      const updateStmt = db.prepare(
        "UPDATE users SET password = ?, role = 'ADMIN', status = 'ACTIVE' WHERE username = ?"
      );
      updateStmt.run(hashedPassword, username);
      console.log(`[${new Date().toISOString()}] Successfully upgraded admin password to Bcrypt.`);
    } else {
      const updateStmt = db.prepare(
        "UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE username = ?"
      );
      updateStmt.run(username);
    }
  }
};

module.exports = { ensureAdmin, ensureAdminSync };
