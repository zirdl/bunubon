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
        beneficiaryName TEXT NOT NULL,
        lotNumber TEXT NOT NULL,
        area REAL DEFAULT 0,
        status TEXT DEFAULT 'Pending',
        dateIssued TEXT,
        notes TEXT,
        FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
      )`);

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
            [crypto.randomUUID(), 'admin', hashedPassword, 'admin', 'Administrator', 'admin@dar.gov.ph', 'Active'], (err) => {
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
          if (title.titleType === 'TCT-CLOA') {
            muni.tctCloaTotal += title.count;
            if (title.status === 'Released' || title.status === 'Processed') {
              muni.tctCloaProcessed += title.count;
            }
          } else if (title.titleType === 'TCT-EP') {
            muni.tctEpTotal += title.count;
            if (title.status === 'Released' || title.status === 'Processed') {
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
        if (title.titleType === 'TCT-CLOA') {
          muni.tctCloaTotal += title.count;
          if (title.status === 'Released' || title.status === 'Processed') {
            muni.tctCloaProcessed += title.count;
          }
        } else if (title.titleType === 'TCT-EP') {
          muni.tctEpTotal += title.count;
          if (title.status === 'Released' || title.status === 'Processed') {
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

// Get titles for a municipality
app.get('/api/titles/:municipalityId', (req, res) => {
  const { municipalityId } = req.params;
  const sql = `SELECT * FROM titles WHERE municipality_id = ?`;
  
  db.all(sql, [municipalityId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
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
  const { id, serialNumber, titleType, beneficiaryName, lotNumber, area, status, dateIssued, notes } = req.body;
  
  const sql = `INSERT INTO titles (id, municipality_id, serialNumber, titleType, beneficiaryName, lotNumber, area, status, dateIssued, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [id, municipalityId, serialNumber, titleType, beneficiaryName, lotNumber, area, status, dateIssued, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id, message: 'Title created successfully' });
  });
});

// Update title
app.put('/api/titles/:municipalityId/:titleId', (req, res) => {
  const { municipalityId, titleId } = req.params;
  const { serialNumber, titleType, beneficiaryName, lotNumber, area, status, dateIssued, notes } = req.body;
  
  const sql = `UPDATE titles 
               SET serialNumber = ?, titleType = ?, beneficiaryName = ?, lotNumber = ?, 
                   area = ?, status = ?, dateIssued = ?, notes = ?
               WHERE id = ? AND municipality_id = ?`;
  
  db.run(sql, [serialNumber, titleType, beneficiaryName, lotNumber, area, status, dateIssued, notes, titleId, municipalityId], function(err) {
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
  const { username, role, fullName, email, status } = req.body;

  // Try to update with all fields first
  const sql = `UPDATE users SET username = ?, role = ?, fullName = ?, email = ?, status = ? WHERE id = ?`;

  db.run(sql, [username, role, fullName, email, status, id], function(err) {
    if (err) {
      // Check if it's a duplicate username error
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      } else if (err.message.includes('no such column')) {
        // If columns don't exist, try updating with basic fields only
        const fallbackSql = `UPDATE users SET username = ?, role = ? WHERE id = ?`;
        db.run(fallbackSql, [username, role, id], function(fallbackErr) {
          if (fallbackErr) {
            res.status(500).json({ error: fallbackErr.message });
            return;
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
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

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});