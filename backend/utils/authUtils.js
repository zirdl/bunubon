const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Ensures a default admin user exists in the database with correct credentials and roles.
 * @param {Object} db - The SQLite database instance.
 * @returns {Promise<void>}
 */
const ensureAdmin = (db) => {
  return new Promise((resolve, reject) => {
    const defaultPassword = 'admin123';
    const username = 'admin';

    db.get("SELECT id, password FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);

      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
      const adminId = crypto.randomUUID();

      if (!row) {
        console.log(`[${new Date().toISOString()}] Creating default admin user...`);
        db.run(
          "INSERT INTO users (id, username, password, role, fullName, email, status, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [adminId, username, hashedPassword, 'ADMIN', 'Administrator', 'admin@dar.gov.ph', 'ACTIVE', 0],
          (err) => {
            if (err) reject(err);
            else {
              console.log(`[${new Date().toISOString()}] Successfully created default admin user.`);
              resolve();
            }
          }
        );
      } else {
        // Check if password matches admin123 OR is outdated SHA-256
        const isSha256 = /^[a-f0-9]{64}$/i.test(row.password);
        const isDefault = bcrypt.compareSync(defaultPassword, row.password);

        if (isSha256) {
          console.log(`[${new Date().toISOString()}] Outdated SHA-256 hash detected for admin. Upgrading to Bcrypt...`);
          db.run(
            "UPDATE users SET password = ?, role = 'ADMIN', status = 'ACTIVE' WHERE username = ?",
            [hashedPassword, username],
            (err) => {
              if (err) reject(err);
              else {
                console.log(`[${new Date().toISOString()}] Successfully upgraded admin password to Bcrypt.`);
                resolve();
              }
            }
          );
        } else {
          // Just ensure role and status are correct
          db.run(
            "UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE username = ?",
            [username],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        }
      }
    });
  });
};

module.exports = { ensureAdmin };
