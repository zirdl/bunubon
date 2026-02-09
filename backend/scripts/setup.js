const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('--- System Initialization ---');

db.serialize(() => {
  // 1. Create Tables
  console.log('Verifying tables...');
  
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

  db.run(`CREATE TABLE IF NOT EXISTS municipality_checkpoints (
    id TEXT PRIMARY KEY,
    municipality_id TEXT,
    label TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
  )`);

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
    mother_ccloa_no TEXT,
    title_no TEXT,
    FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'VIEWER',
    fullName TEXT DEFAULT '',
    email TEXT DEFAULT '',
    contactNumber TEXT DEFAULT '',
    status TEXT DEFAULT 'ACTIVE',
    mustChangePassword BOOLEAN DEFAULT 0
  )`);

  // Migration for existing users table
  const columnsToAdd = [
    { name: 'contactNumber', type: 'TEXT DEFAULT \'\'' },
    { name: 'mustChangePassword', type: 'BOOLEAN DEFAULT 0' }
  ];

  columnsToAdd.forEach(col => {
    db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, (err) => {
      if (err) {
        if (!err.message.includes('duplicate column name')) {
          console.error(`Error adding column ${col.name}:`, err.message);
        }
      } else {
        console.log(`Added column ${col.name} to users table.`);
      }
    });
  });

  db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

  // 2. Create Indexes
  console.log('Verifying indexes...');
  db.run(`CREATE INDEX IF NOT EXISTS idx_titles_municipality ON titles(municipality_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_titles_serial ON titles(serialNumber)`);

  // 3. Handle Admin User & Hash Upgrade
  db.get("SELECT id, password FROM users WHERE username = 'admin'", (err, row) => {
    const defaultPassword = 'admin123';
    
    if (!row) {
      console.log('Default admin user not found. Creating...');
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
      db.run("INSERT INTO users (id, username, password, role, fullName, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [crypto.randomUUID(), 'admin', hashedPassword, 'ADMIN', 'Administrator', 'admin@dar.gov.ph', 'ACTIVE'], (err) => {
          if (err) console.error('Failed to create admin:', err.message);
          else console.log('Successfully created default admin user.');
        });
    } else {
      // Check if password is SHA-256 (64 hex chars)
      const isSha256 = /^[a-f0-9]{64}$/i.test(row.password);
      if (isSha256) {
        console.log('Outdated SHA-256 hash detected for admin. Upgrading to Bcrypt...');
        const newHash = bcrypt.hashSync(defaultPassword, 10);
        db.run("UPDATE users SET password = ?, role = 'ADMIN', status = 'ACTIVE' WHERE username = 'admin'", [newHash], (err) => {
          if (err) console.error('Failed to upgrade hash:', err.message);
          else console.log('Successfully upgraded admin password to Bcrypt.');
        });
      } else {
        console.log('Admin user exists with secure hash.');
        // Ensure role is ADMIN uppercase
        db.run("UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE username = 'admin' AND (role = 'Admin' OR status = 'Active')");
      }
    }
  });

  // 4. Predefined Municipalities
  db.get("SELECT id FROM municipalities LIMIT 1", (err, row) => {
    if (!row) {
      console.log('Provisioning predefined municipalities...');
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
        INSERT INTO municipalities (id, name, status, notes, district)
        VALUES (?, ?, 'active', ?, ?)
      `);

      predefinedMunicipalities.forEach(muni => {
        insertMuniStmt.run([muni.id, muni.name, muni.notes, muni.district]);
      });

      insertMuniStmt.finalize();
      console.log('Successfully provisioned 20 municipalities.');
    }
  });
});

// Removed explicit db.close() to avoid SQLITE_MISUSE when callbacks are still pending.
// The process will exit naturally when all scheduled operations are complete.
console.log('--- Initialization Process Started ---');
