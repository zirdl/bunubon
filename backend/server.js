require('dotenv').config();

// Environment Validation
const requiredEnv = ['SESSION_SECRET'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  console.error(`CRITICAL ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Please check your .env file. Application shutting down.');
  process.exit(1);
}

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const app = express();
const port = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_session_secret_for_dev';

// Middleware
app.use(helmet()); // Sets various security headers
app.use(cors({
  origin: true, // In production, replace with specific frontend URL
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

app.use('/api/', generalLimiter);
app.use('/api/login', loginLimiter);

// Validation Middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// Session Configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: __dirname
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Authentication Middleware
const authenticateSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }
  req.user = req.session.user;
  next();
};

// Authorization Middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

// API Routes - Public
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT id, username, password, role FROM users WHERE username = ?`;

  db.get(sql, [username], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role.toUpperCase()
        };
        res.json({
          success: true,
          user: { id: user.id, username: user.username, role: user.role.toUpperCase() },
          message: 'Login successful'
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Failed to log out' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// API Routes - Protected (Authentication Required)
app.use('/api', authenticateSession);

// Get all municipalities
app.get('/api/municipalities', (req, res) => {
  const municipalitiesSql = `
    SELECT m.*,
           json_group_array(
             json_object(
               'id', mc.id,
               'label', mc.label,
               'completed', mc.completed
             )
           ) AS checkpoints
    FROM municipalities m
    LEFT JOIN municipality_checkpoints mc ON m.id = mc.municipality_id
    GROUP BY m.id
    ORDER BY m.name ASC
  `;

  db.all(municipalitiesSql, [], (err, municipalities) => {
    if (err) return res.status(500).json({ error: err.message });

    const processedMunicipalities = municipalities.map(muni => {
      let checkpoints = [];
      try {
        const parsed = JSON.parse(muni.checkpoints);
        if (Array.isArray(parsed)) checkpoints = parsed.filter(item => item.label);
      } catch (e) {}
      return { ...muni, checkpoints };
    });

    db.all(`SELECT municipality_id, titleType, status, COUNT(*) as count FROM titles GROUP BY municipality_id, titleType, status`, [], (err, titleStats) => {
      if (err) return res.status(500).json({ error: err.message });

      processedMunicipalities.forEach(muni => {
        muni.tctCloaTotal = 0; muni.tctCloaProcessed = 0; muni.tctEpTotal = 0; muni.tctEpProcessed = 0;
        const muniTitles = titleStats.filter(title => title.municipality_id === muni.id);
        muniTitles.forEach(title => {
          if (['SPLIT', 'TCT-CLOA', 'TCT-CLOA (Legacy)'].includes(title.titleType)) {
            muni.tctCloaTotal += title.count;
            if (['released', 'processing'].includes(title.status)) muni.tctCloaProcessed += title.count;
          } else if (['Regular', 'Mother CCLOA', 'TCT-EP', 'TCT-EP (Legacy)'].includes(title.titleType)) {
            muni.tctEpTotal += title.count;
            if (['released', 'processing'].includes(title.status)) muni.tctEpProcessed += title.count;
          }
        });
      });
      res.json(processedMunicipalities);
    });
  });
});

// Get single municipality
app.get('/api/municipalities/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT m.*,
           json_group_array(json_object('id', mc.id, 'label', mc.label, 'completed', mc.completed)) AS checkpoints
    FROM municipalities m
    LEFT JOIN municipality_checkpoints mc ON m.id = mc.municipality_id
    WHERE m.id = ?
    GROUP BY m.id
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Municipality not found' });

    let checkpoints = [];
    try {
      const parsed = JSON.parse(row.checkpoints);
      if (Array.isArray(parsed)) checkpoints = parsed.filter(item => item.label);
    } catch (e) {}

    const muni = { ...row, checkpoints };
    db.all(`SELECT titleType, status, COUNT(*) as count FROM titles WHERE municipality_id = ? GROUP BY titleType, status`, [id], (err, titleStats) => {
      if (err) return res.status(500).json({ error: err.message });
      muni.tctCloaTotal = 0; muni.tctCloaProcessed = 0; muni.tctEpTotal = 0; muni.tctEpProcessed = 0;
      titleStats.forEach(title => {
        if (['SPLIT', 'TCT-CLOA', 'TCT-CLOA (Legacy)'].includes(title.titleType)) {
          muni.tctCloaTotal += title.count;
          if (['released', 'processing'].includes(title.status)) muni.tctCloaProcessed += title.count;
        } else if (['Regular', 'Mother CCLOA', 'TCT-EP', 'TCT-EP (Legacy)'].includes(title.titleType)) {
          muni.tctEpTotal += title.count;
          if (['released', 'processing'].includes(title.status)) muni.tctEpProcessed += title.count;
        }
      });
      res.json(muni);
    });
  });
});

// Create municipality
app.post('/api/municipalities', checkRole(['ADMIN']), (req, res) => {
  const { id, name, status, notes, district, checkpoints } = req.body;
  const sql = `INSERT INTO municipalities (id, name, status, notes, district) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [id, name, status, notes, district], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (checkpoints && Array.isArray(checkpoints)) {
      const stmt = db.prepare('INSERT INTO municipality_checkpoints (id, municipality_id, label, completed) VALUES (?, ?, ?, ?)');
      checkpoints.forEach(cp => stmt.run([cp.id, id, cp.label, cp.completed ? 1 : 0]));
      stmt.finalize();
    }
    res.status(201).json({ id, message: 'Municipality created successfully' });
  });
});

// Update municipality
app.put('/api/municipalities/:id', checkRole(['ADMIN']), (req, res) => {
  const { id } = req.params;
  const { name, status, notes, district, checkpoints } = req.body;
  db.run(`UPDATE municipalities SET name = ?, status = ?, notes = ?, district = ? WHERE id = ?`, [name, status, notes, district, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (checkpoints && Array.isArray(checkpoints)) {
      db.run('DELETE FROM municipality_checkpoints WHERE municipality_id = ?', [id], () => {
        const stmt = db.prepare('INSERT INTO municipality_checkpoints (id, municipality_id, label, completed) VALUES (?, ?, ?, ?)');
        checkpoints.forEach(cp => stmt.run([cp.id, id, cp.label, cp.completed ? 1 : 0]));
        stmt.finalize();
      });
    }
    res.json({ id, message: 'Municipality updated successfully' });
  });
});

// Delete municipality
app.delete('/api/municipalities/:id', checkRole(['ADMIN']), (req, res) => {
  const { id } = req.params;
  if (parseInt(id) <= 20) return res.status(403).json({ error: 'Cannot delete predefined municipalities' });
  db.serialize(() => {
    db.run('DELETE FROM municipality_checkpoints WHERE municipality_id = ?', [id]);
    db.run('DELETE FROM titles WHERE municipality_id = ?', [id]);
    db.run('DELETE FROM municipalities WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Municipality deleted successfully' });
    });
  });
});

// Get all titles
app.get('/api/titles', (req, res) => {
  const { page = 1, limit = 50, search = '', status = 'all', type = 'all' } = req.query;
  const offset = (page - 1) * limit;
  let where = []; let params = [];
  if (search) { where.push("(serialNumber LIKE ? OR beneficiaryName LIKE ? OR m.name LIKE ?)"); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status !== 'all') { where.push("t.status = ?"); params.push(status); }
  if (type === 'SPLIT') where.push("t.titleType IN ('SPLIT', 'TCT-CLOA', 'TCT-CLOA (Legacy)')");
  else if (type === 'Regular') where.push("t.titleType IN ('Regular', 'Mother CCLOA', 'TCT-EP', 'TCT-EP (Legacy)')");
  else if (type !== 'all') { where.push("t.titleType = ?"); params.push(type); }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  db.get(`SELECT COUNT(*) as total FROM titles t LEFT JOIN municipalities m ON t.municipality_id = m.id ${whereClause}`, params, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(`SELECT t.*, m.name as municipalityName FROM titles t LEFT JOIN municipalities m ON t.municipality_id = m.id ${whereClause} ORDER BY t.serialNumber ASC LIMIT ? OFFSET ?`, [...params, limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ data: rows, pagination: { total: countRow.total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(countRow.total / limit) } });
    });
  });
});

// Export titles
app.get('/api/titles/export', (req, res) => {
  const { generateExcel } = require('./utils/excel');
  db.all(`SELECT t.*, m.name as municipalityName FROM titles t LEFT JOIN municipalities m ON t.municipality_id = m.id ORDER BY m.name ASC, t.serialNumber ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const data = rows.map(r => ({ 'Serial Number': r.serialNumber, 'Municipality': r.municipalityName, 'Title Type': r.titleType, 'Subtype': r.subtype || '', 'Beneficiary Name': r.beneficiaryName, 'Lot Number': r.lotNumber, 'Area': r.area, 'Status': r.status, 'Notes': r.notes || '' }));
    try {
      const buffer = generateExcel(data, 'Land Titles');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=land_titles.xlsx');
      res.send(buffer);
    } catch (e) { res.status(500).json({ error: 'Failed to generate Excel' }); }
  });
});

// Get titles for municipality
app.get('/api/titles/:municipalityId', (req, res) => {
  const { municipalityId } = req.params;
  const { page = 1, limit = 50, search = '', status = 'all', type = 'all' } = req.query;
  const offset = (page - 1) * limit;
  let where = ["municipality_id = ?"]; let params = [municipalityId];
  if (search) { where.push("(serialNumber LIKE ? OR beneficiaryName LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
  if (status !== 'all') { where.push("status = ?"); params.push(status); }
  if (type === 'SPLIT') where.push("titleType IN ('SPLIT', 'TCT-CLOA', 'TCT-CLOA (Legacy)')");
  else if (type === 'Regular') where.push("titleType IN ('Regular', 'Mother CCLOA', 'TCT-EP', 'TCT-EP (Legacy)')");
  else if (type !== 'all') { where.push("titleType = ?"); params.push(type); }
  const whereClause = `WHERE ${where.join(' AND ')}`;

  db.get(`SELECT COUNT(*) as total FROM titles ${whereClause}`, params, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(`SELECT * FROM titles ${whereClause} ORDER BY serialNumber ASC LIMIT ? OFFSET ?`, [...params, limit, offset], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ data: rows, pagination: { total: countRow.total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(countRow.total / limit) } });
    });
  });
});

// Create title
const titleValidation = [
  body('serialNumber').trim().notEmpty().escape(),
  body('titleType').isIn(['SPLIT', 'Regular', 'TCT-CLOA', 'TCT-EP', 'Mother CCLOA', 'TCT-CLOA (Legacy)', 'TCT-EP (Legacy)']),
  body('beneficiaryName').trim().notEmpty().escape(),
  body('lotNumber').trim().notEmpty().escape(),
  body('barangayLocation').optional().trim().escape(),
  body('area').isNumeric(),
  body('status').isIn(['on-hand', 'processing', 'released', 'Pending', 'Processed', 'Released']),
  body('municipality_id').optional().escape()
];

app.post('/api/titles/batch', checkRole(['ADMIN', 'EDITOR']), async (req, res) => {
  const { titles } = req.body;
  if (!Array.isArray(titles)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of titles.' });
  }

  const crypto = require('crypto');
  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  // Get all municipalities to map names to IDs
  db.all('SELECT id, name FROM municipalities', [], (err, municipalities) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch municipalities' });

    const muniMap = {};
    municipalities.forEach(m => {
      muniMap[m.name.toLowerCase()] = m.id;
    });

    const stmt = db.prepare(`
      INSERT INTO titles (
        id, municipality_id, serialNumber, titleType, subtype, 
        beneficiaryName, lotNumber, barangayLocation, area, status, 
        dateIssued, dateRegistered, dateReceived, dateDistributed, 
        notes, mother_ccloa_no, title_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let processed = 0;
    if (titles.length === 0) {
      return res.json({ successCount: 0, failedCount: 0, errors: [] });
    }

    titles.forEach((title, index) => {
      const muniId = muniMap[title.municipality?.toLowerCase()?.trim()];
      
      if (!muniId) {
        failedCount++;
        errors.push(`Row ${index + 1}: Municipality "${title.municipality}" not found`);
        processed++;
        if (processed === titles.length) finalize();
        return;
      }

      const id = crypto.randomUUID();
      const params = [
        id,
        muniId,
        String(title.serialNumber || ''),
        title.titleType || 'Regular',
        title.subtype || '',
        title.beneficiaryName || '',
        title.lotNumber || '',
        title.barangayLocation || '',
        parseFloat(title.area) || 0,
        title.status || 'on-hand',
        title.dateIssued || null,
        title.dateRegistered || null,
        title.dateReceived || null,
        title.dateDistributed || null,
        title.notes || '',
        title.mother_ccloa_no || '',
        title.title_no || ''
      ];

      stmt.run(params, function(err) {
        if (err) {
          failedCount++;
          errors.push(`Row ${index + 1}: ${err.message}`);
        } else {
          successCount++;
        }
        processed++;
        if (processed === titles.length) finalize();
      });
    });

    function finalize() {
      stmt.finalize();
      res.json({
        successCount,
        failedCount,
        errors
      });
    }
  });
});

app.post('/api/titles/:municipalityId', checkRole(['ADMIN', 'EDITOR']), validate(titleValidation), (req, res) => {
  const { municipalityId } = req.params;
  const { id, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no } = req.body;
  const sql = `INSERT INTO titles (id, municipality_id, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [id, municipalityId, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id, message: 'Title created successfully' });
  });
});

// Update title
app.put('/api/titles/:municipalityId/:titleId', checkRole(['ADMIN', 'EDITOR']), validate(titleValidation), (req, res) => {
  const { municipalityId, titleId } = req.params;
  const { serialNumber, titleType, subtype, beneficiaryName, lotNumber, barangayLocation, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no } = req.body;
  const sql = `UPDATE titles SET serialNumber = ?, titleType = ?, subtype = ?, beneficiaryName = ?, lotNumber = ?, barangayLocation = ?, area = ?, status = ?, dateIssued = ?, dateRegistered = ?, dateReceived = ?, dateDistributed = ?, notes = ?, mother_ccloa_no = ?, title_no = ? WHERE id = ? AND municipality_id = ?`;
  db.run(sql, [serialNumber, titleType, subtype, beneficiaryName, lotNumber, barangayLocation, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no, titleId, municipalityId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: titleId, message: 'Title updated successfully' });
  });
});

// Delete title
app.delete('/api/titles/:municipalityId/:titleId', checkRole(['ADMIN']), (req, res) => {
  const { municipalityId, titleId } = req.params;
  db.run(`DELETE FROM titles WHERE id = ? AND municipality_id = ?`, [titleId, municipalityId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Title deleted successfully' });
  });
});

// User routes
app.get('/api/profile', (req, res) => {
  const { id } = req.user;
  db.get(`SELECT id, username, role, fullName, email, status FROM users WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});

app.get('/api/users', checkRole(['ADMIN']), (req, res) => {
  db.all(`SELECT id, username, role, fullName, email, status FROM users ORDER BY username`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const userValidation = [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }),
  body('role').isIn(['ADMIN', 'EDITOR', 'VIEWER']),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('fullName').optional().trim().escape()
];

app.post('/api/users', checkRole(['ADMIN']), validate([
  ...userValidation,
  body('password').isLength({ min: 6 }) // Password required for new users
]), async (req, res) => {
  const { username, password, role, fullName, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const crypto = require('crypto');
  db.run(`INSERT INTO users (id, username, password, role, fullName, email, status) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`, [crypto.randomUUID(), username, hashedPassword, role, fullName, email], function(err) {
    if (err) return res.status(400).json({ error: err.message.includes('UNIQUE') ? 'Username exists' : err.message });
    res.status(201).json({ message: 'User created' });
  });
});

app.put('/api/users/:id', checkRole(['ADMIN']), validate(userValidation), async (req, res) => {
  const { id } = req.params;
  const { username, role, fullName, email, status, password } = req.body;
  let sql = `UPDATE users SET username = ?, role = ?, fullName = ?, email = ?, status = ?`;
  let params = [username, role, fullName, email, status];
  if (password) { sql += `, password = ?`; params.push(await bcrypt.hash(password, 10)); }
  sql += ` WHERE id = ?`; params.push(id);
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated' });
  });
});

app.delete('/api/users/:id', checkRole(['ADMIN']), (req, res) => {
  const { id } = req.params;
  db.get(`SELECT username FROM users WHERE id = ?`, [id], (err, row) => {
    if (row && row.username === 'admin') return res.status(400).json({ error: 'Cannot delete admin' });
    db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User deleted' });
    });
  });
});

app.put('/api/users/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  // Allow users to change their own password, or Admins to change any password
  if (req.user.id !== id && !['ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  db.get(`SELECT password FROM users WHERE id = ?`, [id], async (err, user) => {
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(401).json({ error: 'Invalid current password' });
    db.run(`UPDATE users SET password = ? WHERE id = ?`, [await bcrypt.hash(newPassword, 10), id], () => res.json({ message: 'Password updated' }));
  });
});

// Google Sheets Sync
const { fetchSheetRows } = require('./utils/googleSheets');
const { mapRowsToTitles, syncTitles } = require('./utils/sync');

app.post('/api/sync/google-sheets/preview', async (req, res) => {
  const { sheetId, range, mapping } = req.body;
  try {
    const rows = await fetchSheetRows(sheetId, range);
    res.json({ data: mapRowsToTitles(rows, mapping) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sync/google-sheets/confirm', async (req, res) => {
  try {
    res.json(await syncTitles(db, req.body.titles));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => console.log(`Server running at http://localhost:${port}`));
}

module.exports = app;
