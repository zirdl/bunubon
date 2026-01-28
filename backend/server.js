const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create tables if they don't exist
    db.serialize(() => {
      // Municipalities table
      db.run(`CREATE TABLE IF NOT EXISTS municipalities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tctCloaTotal INTEGER DEFAULT 0,
        tctCloaProcessed INTEGER DEFAULT 0,
        tctEpTotal INTEGER DEFAULT 0,
        tctEpProcessed INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        notes TEXT,
        district INTEGER DEFAULT 1
      )`);

      // Municipalities checkpoints table
      db.run(`CREATE TABLE IF NOT EXISTS municipality_checkpoints (
        id TEXT PRIMARY KEY,
        municipality_id TEXT,
        label TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
      )`);

      // Titles table
      db.run(`CREATE TABLE IF NOT EXISTS titles (
        id TEXT PRIMARY KEY,
        municipality_id TEXT,
        serialNumber TEXT NOT NULL,
        titleType TEXT NOT NULL,
        subtype TEXT,
        beneficiaryName TEXT NOT NULL,
        lotNumber TEXT NOT NULL,
        barangayLocation TEXT,
        area REAL DEFAULT 0,
        status TEXT DEFAULT 'on-hand',
        dateIssued TEXT,
        dateRegistered TEXT,
        dateReceived TEXT,
        dateDistributed TEXT,
        notes TEXT,
        FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
      )`);

      // Create indexes for faster searching and filtering
      db.run(`CREATE INDEX IF NOT EXISTS idx_titles_municipality ON titles(municipality_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_titles_serial ON titles(serialNumber)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_titles_beneficiary ON titles(beneficiaryName)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_titles_status ON titles(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_titles_type ON titles(titleType)`);

      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )`);

      // Add new columns if they don't exist - using a method compatible with older SQLite versions
      // First check if each column exists using PRAGMA table_info
      db.serialize(() => {
        // Check for titles table new columns
        db.all("PRAGMA table_info(titles)", [], (err, rows) => {
           if (err) {
             console.log("Error checking titles table structure:", err.message);
             return;
           }
           const columnNames = rows.map(row => row.name);
           
           if (!columnNames.includes('subtype')) {
             db.run("ALTER TABLE titles ADD COLUMN subtype TEXT", (err) => {
               if (!err) console.log("Added subtype column to titles table");
             });
           }
           if (!columnNames.includes('barangayLocation')) {
             db.run("ALTER TABLE titles ADD COLUMN barangayLocation TEXT", (err) => {
               if (!err) console.log("Added barangayLocation column to titles table");
             });
           }
           if (!columnNames.includes('dateRegistered')) {
             db.run("ALTER TABLE titles ADD COLUMN dateRegistered TEXT", (err) => {
               if (!err) console.log("Added dateRegistered column to titles table");
             });
           }
           if (!columnNames.includes('dateReceived')) {
             db.run("ALTER TABLE titles ADD COLUMN dateReceived TEXT", (err) => {
               if (!err) console.log("Added dateReceived column to titles table");
             });
           }
           if (!columnNames.includes('dateDistributed')) {
             db.run("ALTER TABLE titles ADD COLUMN dateDistributed TEXT", (err) => {
               if (!err) console.log("Added dateDistributed column to titles table");
             });
           }
           if (!columnNames.includes('mother_ccloa_no')) {
             db.run("ALTER TABLE titles ADD COLUMN mother_ccloa_no TEXT", (err) => {
               if (!err) console.log("Added mother_ccloa_no column to titles table");
             });
           }
           if (!columnNames.includes('title_no')) {
             db.run("ALTER TABLE titles ADD COLUMN title_no TEXT", (err) => {
               if (!err) console.log("Added title_no column to titles table");
             });
           }
        });

        // Check for fullName column
        db.all("PRAGMA table_info(users)", [], (err, rows) => {
          if (err) {
            console.log("Error checking table structure:", err.message);
            return;
          }

          const columnNames = rows.map(row => row.name);

          // Add fullName column if it doesn't exist
          if (!columnNames.includes('fullName')) {
            db.run("ALTER TABLE users ADD COLUMN fullName TEXT DEFAULT ''", (err) => {
              if (err) {
                console.log("Error adding fullName column:", err.message);
              } else {
                console.log("Added fullName column to users table");
              }
            });
          }

          // Add email column if it doesn't exist
          if (!columnNames.includes('email')) {
            db.run("ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''", (err) => {
              if (err) {
                console.log("Error adding email column:", err.message);
              } else {
                console.log("Added email column to users table");
              }
            });
          }

          // Add status column if it doesn't exist
          if (!columnNames.includes('status')) {
            db.run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'Active'", (err) => {
              if (err) {
                console.log("Error adding status column:", err.message);
              } else {
                console.log("Added status column to users table");
              }
            });
          }
        });
      });

      // Insert default user if table is empty
      db.get("SELECT id FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
          const crypto = require('crypto');
          const defaultPassword = 'admin123'; // Default password, should be changed in production
          const hashedPassword = crypto.createHash('sha256').update(defaultPassword).digest('hex');

          db.run("INSERT INTO users (id, username, password, role, fullName, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [crypto.randomUUID(), 'admin', hashedPassword, 'Admin', 'Administrator', 'admin@dar.gov.ph', 'Active'], (err) => {
              if (err) {
                console.error('Error creating default user:', err);
              } else {
                console.log('Created default admin user');
              }
            });
        }
      });

      // Insert predefined municipalities if table is empty
      db.get("SELECT id FROM municipalities LIMIT 1", (err, row) => {
        if (!row) {
          // The 20 municipalities of La Union (with zero values since DAR operates arbitrarily)
          // District 1: Bacnotan, Balaoan, Bangar, Luna, San Gabriel, San Juan, Santol, Sudipen, and the City of San Fernando
          // District 2: Agoo, Aringay, Bagulin, Bauang, Burgos, Caba, Naguilian, Pugo, Rosario, Santo Tomas, Tubao
          const predefinedMunicipalities = [
            { id: '1', name: 'Agoo', district: 2, notes: '' },
            { id: '2', name: 'Aringay', district: 2, notes: '' },
            { id: '3', name: 'Bacnotan', district: 1, notes: '' },
            { id: '4', name: 'Bagulin', district: 2, notes: '' },
            { id: '5', name: 'Balaoan', district: 1, notes: '' },
            { id: '6', name: 'Bangar', district: 1, notes: '' },
            { id: '7', name: 'Bauang', district: 2, notes: '' },
            { id: '8', name: 'Burgos', district: 2, notes: '' },
            { id: '9', name: 'Caba', district: 2, notes: '' },
            { id: '10', name: 'Luna', district: 1, notes: '' },
            { id: '11', name: 'Naguilian', district: 2, notes: '' },
            { id: '12', name: 'Pugo', district: 2, notes: '' },
            { id: '13', name: 'Rosario', district: 2, notes: '' },
            { id: '14', name: 'San Gabriel', district: 1, notes: '' },
            { id: '15', name: 'San Juan', district: 1, notes: '' },
            { id: '16', name: 'Santol', district: 1, notes: '' },
            { id: '17', name: 'Santo Tomas', district: 2, notes: '' },
            { id: '18', name: 'Sudipen', district: 1, notes: '' },
            { id: '19', name: 'Tubao', district: 2, notes: '' },
            { id: '20', name: 'San Fernando', district: 1, notes: '' },
          ];

          const insertMuniStmt = db.prepare(`
            INSERT INTO municipalities (id, name, tctCloaTotal, tctCloaProcessed, tctEpTotal, tctEpProcessed, status, notes, district)
            VALUES (?, ?, 0, 0, 0, 0, 'active', ?, ?)
          `);

          predefinedMunicipalities.forEach(muni => {
            insertMuniStmt.run([muni.id, muni.name, muni.notes, muni.district]);
          });

          insertMuniStmt.finalize();

          // Add default checkpoints for each municipality
          const insertCheckpointStmt = db.prepare(`
            INSERT INTO municipality_checkpoints (id, municipality_id, label, completed)
            VALUES (?, ?, ?, ?)
          `);

          predefinedMunicipalities.forEach(muni => {
            insertCheckpointStmt.run([`${muni.id}-1`, muni.id, 'Initial Documentation Completed', 0]);
            insertCheckpointStmt.run([`${muni.id}-2`, muni.id, 'Final Processing & Release', 0]);
          });

          insertCheckpointStmt.finalize();

          console.log('Inserted 20 predefined municipalities of La Union with zero initial values');
        }
      });
    });
  }
});

// API Routes

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
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // For each municipality, get the title counts from the titles table
    const processedMunicipalities = municipalities.map(muni => {
      // Initialize with current values
      let updatedMuni = { ...muni };

      // Set initial title counts to 0, they will be updated after querying titles
      updatedMuni.tctCloaTotal = 0;
      updatedMuni.tctCloaProcessed = 0;
      updatedMuni.tctEpTotal = 0;
      updatedMuni.tctEpProcessed = 0;

      let checkpoints = [];
      try {
        // Parse the JSON string from SQLite
        const parsed = JSON.parse(muni.checkpoints);
        if (Array.isArray(parsed)) {
          checkpoints = parsed.filter(item => item.label);
        }
      } catch (e) {
        console.log('Error parsing checkpoints:', e);
      }

      return {
        ...updatedMuni,
        checkpoints: checkpoints || []
      };
    });

    // Query to get title counts for each municipality
    const titlesSql = `SELECT municipality_id, titleType, status, COUNT(*) as count
                      FROM titles
                      GROUP BY municipality_id, titleType, status`;

    db.all(titlesSql, [], (err, titleStats) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Update each municipality with the calculated counts
      processedMunicipalities.forEach(muni => {
        // Calculate title counts for this specific municipality
        const muniTitles = titleStats.filter(title => title.municipality_id === muni.id);

        muniTitles.forEach(title => {
          // Map SPLIT and TCT-CLOA to the CLOA bucket (SPLIT Group)
          if (title.titleType === 'SPLIT' || title.titleType === 'TCT-CLOA') {
            muni.tctCloaTotal += title.count;
            if (title.status === 'released' || title.status === 'processing') {
              muni.tctCloaProcessed += title.count;
            }
          } 
          // Map Regular, Mother CCLOA and TCT-EP to the EP bucket (Regular Group)
          else if (title.titleType === 'Regular' || title.titleType === 'Mother CCLOA' || title.titleType === 'TCT-EP') {
            muni.tctEpTotal += title.count;
            if (title.status === 'released' || title.status === 'processing') {
              muni.tctEpProcessed += title.count;
            }
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
  const municipalitySql = `
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
    WHERE m.id = ?
    GROUP BY m.id
  `;

  db.get(municipalitySql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      return res.status(404).json({ error: 'Municipality not found' });
    }

    let checkpoints = [];
    try {
      // Parse the JSON string from SQLite
      const parsed = JSON.parse(row.checkpoints);
      if (Array.isArray(parsed)) {
        checkpoints = parsed.filter(item => item.label);
      }
    } catch (e) {
      console.log('Error parsing checkpoints:', e);
    }

    const muni = {
      ...row,
      checkpoints: checkpoints || []
    };

    // Initialize counts to 0
    muni.tctCloaTotal = 0;
    muni.tctCloaProcessed = 0;
    muni.tctEpTotal = 0;
    muni.tctEpProcessed = 0;

    // Query to get title counts for this specific municipality
    const titlesSql = `SELECT titleType, status, COUNT(*) as count
                      FROM titles
                      WHERE municipality_id = ?
                      GROUP BY titleType, status`;

    db.all(titlesSql, [id], (err, titleStats) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Calculate title counts
      titleStats.forEach(title => {
        // Map SPLIT and TCT-CLOA to the CLOA bucket (SPLIT Group)
        if (title.titleType === 'SPLIT' || title.titleType === 'TCT-CLOA') {
          muni.tctCloaTotal += title.count;
          if (title.status === 'released' || title.status === 'processing') {
            muni.tctCloaProcessed += title.count;
          }
        } 
        // Map Regular, Mother CCLOA and TCT-EP to the EP bucket (Regular Group)
        else if (title.titleType === 'Regular' || title.titleType === 'Mother CCLOA' || title.titleType === 'TCT-EP') {
          muni.tctEpTotal += title.count;
          if (title.status === 'released' || title.status === 'processing') {
            muni.tctEpProcessed += title.count;
          }
        }
      });

      res.json(muni);
    });
  });
});

// Create municipality
app.post('/api/municipalities', (req, res) => {
  const { id, name, tctCloaTotal, tctCloaProcessed, tctEpTotal, tctEpProcessed, status, notes, district, checkpoints } = req.body;
  
  const sql = `INSERT INTO municipalities (id, name, tctCloaTotal, tctCloaProcessed, tctEpTotal, tctEpProcessed, status, notes, district)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [id, name, tctCloaTotal, tctCloaProcessed, tctEpTotal, tctEpProcessed, status, notes, district], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Insert checkpoints if provided
    if (checkpoints && Array.isArray(checkpoints)) {
      const insertCheckpointStmt = db.prepare('INSERT INTO municipality_checkpoints (id, municipality_id, label, completed) VALUES (?, ?, ?, ?)');
      checkpoints.forEach(cp => {
        insertCheckpointStmt.run([cp.id, id, cp.label, cp.completed ? 1 : 0]);
      });
      insertCheckpointStmt.finalize();
    }
    
    res.status(201).json({ id, message: 'Municipality created successfully' });
  });
});

// Update municipality
app.put('/api/municipalities/:id', (req, res) => {
  const { id } = req.params;
  const { name, status, notes, district, checkpoints } = req.body; // Removed title counts as they are calculated

  const sql = `UPDATE municipalities
               SET name = ?, status = ?, notes = ?, district = ?
               WHERE id = ?`;

  db.run(sql, [name, status, notes, district, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Update or insert checkpoints
    if (checkpoints && Array.isArray(checkpoints)) {
      // First delete existing checkpoints for this municipality
      db.run('DELETE FROM municipality_checkpoints WHERE municipality_id = ?', [id], (err) => {
        if (err) {
          console.error('Error deleting checkpoints:', err.message);
        }

        // Then insert the new ones
        const insertCheckpointStmt = db.prepare('INSERT INTO municipality_checkpoints (id, municipality_id, label, completed) VALUES (?, ?, ?, ?)');
        checkpoints.forEach(cp => {
          insertCheckpointStmt.run([cp.id, id, cp.label, cp.completed ? 1 : 0]);
        });
        insertCheckpointStmt.finalize();
      });
    }

    res.json({ id, message: 'Municipality updated successfully' });
  });
});

// Delete municipality
app.delete('/api/municipalities/:id', (req, res) => {
  const { id } = req.params;

  // Check if this is a predefined municipality (by checking if it's one of the first 20)
  if (parseInt(id) <= 20) {
    return res.status(403).json({ error: 'Cannot delete predefined municipalities' });
  }

  // Delete municipality and its related data
  db.serialize(() => {
    db.run('DELETE FROM municipality_checkpoints WHERE municipality_id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting checkpoints:', err.message);
      }
    });

    db.run('DELETE FROM titles WHERE municipality_id = ?', [id], (err) => {
      if (err) {
        console.error('Error deleting titles:', err.message);
      }
    });

    db.run('DELETE FROM municipalities WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Municipality deleted successfully' });
    });
  });
});

// Get all titles with pagination and filters (Global Search)
app.get('/api/titles', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const status = req.query.status || 'all';
  const type = req.query.type || 'all';

  let whereConditions = [];
  let params = [];

  if (search) {
    whereConditions.push("(serialNumber LIKE ? OR beneficiaryName LIKE ? OR m.name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status !== 'all') {
    whereConditions.push("t.status = ?");
    params.push(status);
  }

  if (type === 'SPLIT') {
    whereConditions.push("t.titleType IN ('SPLIT', 'TCT-CLOA', 'TCT-CLOA (Legacy)')");
  } else if (type === 'Regular') {
    whereConditions.push("t.titleType IN ('Regular', 'Mother CCLOA', 'TCT-EP', 'TCT-EP (Legacy)')");
  } else if (type !== 'all') {
    whereConditions.push("t.titleType = ?");
    params.push(type);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total 
    FROM titles t
    LEFT JOIN municipalities m ON t.municipality_id = m.id
    ${whereClause}
  `;

  const dataSql = `
    SELECT t.*, m.name as municipalityName 
    FROM titles t
    LEFT JOIN municipalities m ON t.municipality_id = m.id
    ${whereClause}
    ORDER BY t.serialNumber ASC
    LIMIT ? OFFSET ?
  `;

  db.get(countSql, params, (err, countRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.all(dataSql, [...params, limit, offset], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({
        data: rows,
        pagination: {
          total: countRow.total,
          page,
          limit,
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
});

// Export titles to Excel
const { generateExcel } = require('./utils/excel');

app.get('/api/titles/export', (req, res) => {
  const sql = `
    SELECT t.*, m.name as municipalityName 
    FROM titles t
    LEFT JOIN municipalities m ON t.municipality_id = m.id
    ORDER BY m.name ASC, t.serialNumber ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Prepare data for Excel - renaming keys for better readability in the spreadsheet
    const excelData = rows.map(row => ({
      'Serial Number': row.serialNumber,
      'Municipality': row.municipalityName,
      'Title Type': row.titleType,
      'Subtype': row.subtype || '',
      'Beneficiary Name': row.beneficiaryName,
      'Lot Number': row.lotNumber,
      'Area (sqm)': row.area,
      'Status': row.status,
      'Date Issued': row.dateIssued || '',
      'Date Registered': row.dateRegistered || '',
      'Date Received': row.dateReceived || '',
      'Date Distributed': row.dateDistributed || '',
      'Notes': row.notes || '',
      'Mother CCLOA No.': row.mother_ccloa_no || '',
      'Title No.': row.title_no || ''
    }));

    try {
      const buffer = generateExcel(excelData, 'Land Titles');
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=land_titles.xlsx');
      res.send(buffer);
    } catch (excelErr) {
      res.status(500).json({ error: 'Failed to generate Excel file' });
    }
  });
});

// Get titles for a municipality with pagination and filters
app.get('/api/titles/:municipalityId', (req, res) => {
  const { municipalityId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const status = req.query.status || 'all';
  const type = req.query.type || 'all';

  let whereConditions = ["municipality_id = ?"];
  let params = [municipalityId];

  if (search) {
    whereConditions.push("(serialNumber LIKE ? OR beneficiaryName LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status !== 'all') {
    whereConditions.push("status = ?");
    params.push(status);
  }

  if (type === 'SPLIT') {
    whereConditions.push("titleType IN ('SPLIT', 'TCT-CLOA', 'TCT-CLOA (Legacy)')");
  } else if (type === 'Regular') {
    whereConditions.push("titleType IN ('Regular', 'Mother CCLOA', 'TCT-EP', 'TCT-EP (Legacy)')");
  } else if (type !== 'all') {
    whereConditions.push("titleType = ?");
    params.push(type);
  }

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

  const countSql = `SELECT COUNT(*) as total FROM titles ${whereClause}`;
  const dataSql = `SELECT * FROM titles ${whereClause} ORDER BY serialNumber ASC LIMIT ? OFFSET ?`;
  
  db.get(countSql, params, (err, countRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.all(dataSql, [...params, limit, offset], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({
        data: rows,
        pagination: {
          total: countRow.total,
          page,
          limit,
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
});

// Get single title
app.get('/api/titles/:municipalityId/:titleId', (req, res) => {
  const { municipalityId, titleId } = req.params;
  const sql = `SELECT * FROM titles WHERE municipality_id = ? AND id = ?`;
  
  db.get(sql, [municipalityId, titleId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Title not found' });
    }
  });
});

// Create title
app.post('/api/titles/:municipalityId', (req, res) => {
  const { municipalityId } = req.params;
  const { id, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no } = req.body;
  
  const sql = `INSERT INTO titles (id, municipality_id, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [id, municipalityId, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id, message: 'Title created successfully' });
  });
});

// Bulk Import Titles
app.post('/api/titles/batch', (req, res) => {
  const { titles } = req.body;
  
  if (!titles || !Array.isArray(titles)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of titles.' });
  }

  let successCount = 0;
  let failedCount = 0;
  let errors = [];

  // Get all municipalities first for lookup
  db.all('SELECT id, name FROM municipalities', [], async (err, municipalities) => {
    if (err) {
      return res.status(500).json({ error: 'Database error fetching municipalities' });
    }

    const processTitle = (title) => {
      return new Promise((resolve) => {
        // Find municipality ID
        const muniName = title.municipality ? title.municipality.trim() : '';
        const muni = municipalities.find(m => m.name.toLowerCase() === muniName.toLowerCase());
        
        if (!muni) {
          failedCount++;
          errors.push(`Row with Serial ${title.serialNumber}: Municipality '${muniName}' not found`);
          return resolve();
        }

        const crypto = require('crypto');
        const id = crypto.randomUUID();
        
        // Parse dates if present (assuming YYYY-MM-DD or similar standard format)
        // If empty, set to null or empty string
        
        const sql = `INSERT INTO titles (id, municipality_id, serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const params = [
          id, 
          muni.id, 
          title.serialNumber, 
          title.titleType, 
          title.subtype || '', 
          title.beneficiaryName, 
          title.lotNumber, 
          parseFloat(title.area) || 0, 
          title.status, 
          title.dateIssued || '', 
          title.dateRegistered || '', 
          title.dateReceived || '', 
          title.dateDistributed || '', 
          title.notes || '',
          title.mother_ccloa_no || '',
          title.title_no || ''
        ];

        db.run(sql, params, function(err) {
          if (err) {
            failedCount++;
            errors.push(`Row with Serial ${title.serialNumber}: ${err.message}`);
          } else {
            successCount++;
          }
          resolve();
        });
      });
    };

    // Process all titles sequentially to avoid SQLite locking issues with massive parallel writes
    for (const title of titles) {
      await processTitle(title);
    }

    res.json({
      message: 'Batch import completed',
      successCount,
      failedCount,
      errors
    });
  });
});

// Update title
app.put('/api/titles/:municipalityId/:titleId', (req, res) => {
  const { municipalityId, titleId } = req.params;
  const { serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no } = req.body;
  
  const sql = `UPDATE titles 
               SET serialNumber = ?, titleType = ?, subtype = ?, beneficiaryName = ?, lotNumber = ?, 
                   area = ?, status = ?, dateIssued = ?, dateRegistered = ?, dateReceived = ?, dateDistributed = ?, notes = ?, mother_ccloa_no = ?, title_no = ?
               WHERE id = ? AND municipality_id = ?`;
  
  db.run(sql, [serialNumber, titleType, subtype, beneficiaryName, lotNumber, area, status, dateIssued, dateRegistered, dateReceived, dateDistributed, notes, mother_ccloa_no, title_no, titleId, municipalityId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: titleId, message: 'Title updated successfully' });
  });
});

// Delete title
app.delete('/api/titles/:municipalityId/:titleId', (req, res) => {
  const { municipalityId, titleId } = req.params;
  
  const sql = `DELETE FROM titles WHERE id = ? AND municipality_id = ?`;
  
  db.run(sql, [titleId, municipalityId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Title deleted successfully' });
  });
});

// Change user password
app.put('/api/users/:id/change-password', (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  const crypto = require('crypto');
  const hashedCurrentPassword = crypto.createHash('sha256').update(currentPassword).digest('hex');
  const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

  // First, verify the current password
  const verifySql = `SELECT id, username FROM users WHERE id = ? AND password = ?`;

  db.get(verifySql, [id, hashedCurrentPassword], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update the password
    const updateSql = `UPDATE users SET password = ? WHERE id = ?`;

    db.run(updateSql, [hashedNewPassword, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  // Query with conditional selection for newer columns that might not exist in older databases
  const sql = `SELECT id, username, role,
               CASE WHEN fullName IS NOT NULL THEN fullName ELSE '' END as fullName,
               CASE WHEN email IS NOT NULL THEN email ELSE '' END as email,
               CASE WHEN status IS NOT NULL THEN status ELSE 'Active' END as status
               FROM users ORDER BY username`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single user
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  // Query with conditional selection for newer columns that might not exist in older databases
  const sql = `SELECT id, username, role,
               CASE WHEN fullName IS NOT NULL THEN fullName ELSE '' END as fullName,
               CASE WHEN email IS NOT NULL THEN email ELSE '' END as email,
               CASE WHEN status IS NOT NULL THEN status ELSE 'Active' END as status
               FROM users WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(row);
  });
});

// Create user
app.post('/api/users', (req, res) => {
  const { username, password, role, fullName, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const crypto = require('crypto');
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const userId = crypto.randomUUID();

  // Use INSERT OR IGNORE to handle cases where columns might not exist yet
  const sql = `INSERT INTO users (id, username, password, role, fullName, email, status) VALUES (?, ?, ?, ?, ?, ?, 'Active')`;

  db.run(sql, [userId, username, hashedPassword, role || 'user', fullName || '', email || ''], function(err) {
    if (err) {
      // Check if it's a duplicate username error
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      } else if (err.message.includes('no such column')) {
        // If columns don't exist, try inserting without them
        const fallbackSql = `INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)`;
        db.run(fallbackSql, [userId, username, hashedPassword, role || 'user'], function(fallbackErr) {
          if (fallbackErr) {
            res.status(500).json({ error: fallbackErr.message });
            return;
          }
          res.status(201).json({ id: userId, message: 'User created successfully' });
        });
        return;
      }
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: userId, message: 'User created successfully' });
  });
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, role, fullName, email, status, password } = req.body;

  let sql;
  let params;

  if (password) {
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    sql = `UPDATE users SET username = ?, role = ?, fullName = ?, email = ?, status = ?, password = ? WHERE id = ?`;
    params = [username, role, fullName, email, status, hashedPassword, id];
  } else {
    sql = `UPDATE users SET username = ?, role = ?, fullName = ?, email = ?, status = ? WHERE id = ?`;
    params = [username, role, fullName, email, status, id];
  }

  db.run(sql, params, function(err) {
    if (err) {
      // Check if it's a duplicate username error
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      } else if (err.message.includes('no such column')) {
        // Fallback logic if some columns don't exist
        const fallbackSql = `UPDATE users SET username = ?, role = ? WHERE id = ?`;
        db.run(fallbackSql, [username, role, id], function(fallbackErr) {
          if (fallbackErr) {
            res.status(500).json({ error: fallbackErr.message });
            return;
          }
          res.json({ id, message: 'User updated successfully (basic fields only)' });
        });
        return;
      }
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id, message: 'User updated successfully' });
  });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  // Prevent deletion of the default admin user
  db.get('SELECT username FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deletion of admin user
    if (row.username === 'admin') {
      return res.status(400).json({ error: 'Cannot delete the default admin user' });
    }

    const sql = `DELETE FROM users WHERE id = ?`;

    db.run(sql, [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    });
  });
});

// User authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const crypto = require('crypto');
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // Only select columns that are guaranteed to exist
  const sql = `SELECT id, username, role FROM users WHERE username = ? AND password = ?`;

  db.get(sql, [username, hashedPassword], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({
        success: true,
        user: {
          id: row.id,
          username: row.username,
          role: row.role,
          // Provide default values for optional fields that may not exist in older databases
          fullName: '',
          email: '',
          status: 'Active'
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Google Sheets Sync Endpoints
const { fetchSheetRows } = require('./utils/googleSheets');
const { mapRowsToTitles, syncTitles } = require('./utils/sync');

app.post('/api/sync/google-sheets/preview', async (req, res) => {
  const { sheetId, range, mapping } = req.body;

  if (!sheetId || !range || !mapping) {
    return res.status(400).json({ error: 'Missing required parameters: sheetId, range, or mapping' });
  }

  try {
    const rows = await fetchSheetRows(sheetId, range);
    const titles = mapRowsToTitles(rows, mapping);
    res.json({ data: titles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync/google-sheets/confirm', async (req, res) => {
  const { titles } = req.body;

  if (!titles || !Array.isArray(titles)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of titles.' });
  }

  try {
    const results = await syncTitles(db, titles);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app;