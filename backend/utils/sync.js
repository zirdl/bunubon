/**
 * Maps 2D array of rows from Google Sheets to an array of title objects.
 * @param {Array} rows - 2D array of rows (first row is header).
 * @param {Object} mapping - Object mapping spreadsheet headers to database fields.
 * @returns {Array} - Array of mapped title objects.
 */
function mapRowsToTitles(rows, mapping) {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows.map(row => {
    const title = {};
    headers.forEach((header, index) => {
      const field = mapping[header];
      if (field) {
        title[field] = row[index];
      }
    });
    return title;
  });
}

/**
 * Synchronizes titles with the database (Upsert logic).
 * @param {Object} db - The SQLite database instance.
 * @param {Array} titles - Array of title objects to sync.
 * @returns {Promise<Object>} - Results of the sync operation.
 */
async function syncTitles(db, titles) {
  let inserted = 0;
  let updated = 0;
  let errors = [];

  // Get all municipalities for lookup
  const municipalities = await new Promise((resolve, reject) => {
    db.all('SELECT id, name FROM municipalities', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const crypto = require('crypto');

  for (const title of titles) {
    try {
      // Find municipality ID
      const muniName = title.municipalityName ? title.municipalityName.trim() : '';
      const muni = municipalities.find(m => m.name.toLowerCase() === muniName.toLowerCase());

      if (!muni) {
        errors.push(`Serial ${title.serialNumber}: Municipality '${muniName}' not found`);
        continue;
      }

      const municipalityId = muni.id;

      // Check if title exists
      const existingTitle = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM titles WHERE serialNumber = ?', [title.serialNumber], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingTitle) {
        // Update
        const sql = `UPDATE titles 
                     SET municipality_id = ?, titleType = ?, subtype = ?, beneficiaryName = ?, 
                         lotNumber = ?, area = ?, status = ?, dateIssued = ?, notes = ?
                     WHERE id = ?`;
        const params = [
          municipalityId,
          title.titleType,
          title.subtype || '',
          title.beneficiaryName,
          title.lotNumber,
          parseFloat(title.area) || 0,
          title.status,
          title.dateIssued || '',
          title.notes || '',
          existingTitle.id
        ];

        await new Promise((resolve, reject) => {
          db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        updated++;
      } else {
        // Insert
        const id = crypto.randomUUID();
        const sql = `INSERT INTO titles (id, municipality_id, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
          id,
          municipalityId,
          title.serialNumber,
          title.titleType,
          title.subtype || '',
          title.beneficiaryName,
          title.lotNumber,
          parseFloat(title.area) || 0,
          title.status,
          title.dateIssued || '',
          title.notes || ''
        ];

        await new Promise((resolve, reject) => {
          db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        inserted++;
      }
    } catch (err) {
      errors.push(`Serial ${title.serialNumber}: ${err.message}`);
    }
  }

  return { inserted, updated, errors };
}

module.exports = {
  mapRowsToTitles,
  syncTitles,
};
