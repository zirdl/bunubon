const crypto = require('crypto');

/**
 * Logs an administrative action to the audit_logs table.
 * @param {Object} db - The SQLite database instance.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} action - The action being performed (e.g., 'USER_CREATED', 'ROLE_UPDATED').
 * @param {object} details - Additional details about the action.
 */
const logAudit = (db, userId, action, details) => {
  const id = crypto.randomUUID();
  const detailsStr = details ? JSON.stringify(details) : null;
  const sql = `INSERT INTO audit_logs (id, userId, action, details) VALUES (?, ?, ?, ?)`;

  db.run(sql, [id, userId, action, detailsStr], (err) => {
    if (err) {
      console.error('Failed to log audit:', err.message);
    }
  });
};

module.exports = { logAudit };