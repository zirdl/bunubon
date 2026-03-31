const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`--- System Initialization [PID: ${process.pid}] [Time: ${new Date().toISOString()}] ---`);

try {
  // 1. Create Tables
  console.log('Verifying tables...');

  db.exec(`CREATE TABLE IF NOT EXISTS municipalities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tctCloaTotal INTEGER DEFAULT 0,
    tctCloaProcessed INTEGER DEFAULT 0,
    tctEpTotal INTEGER DEFAULT 0,
    tctEpProcessed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    notes TEXT,
    district INTEGER DEFAULT 1
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS municipality_checkpoints (
    id TEXT PRIMARY KEY,
    municipality_id TEXT,
    label TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS titles (
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

  db.exec(`CREATE TABLE IF NOT EXISTS users (
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

  db.exec(`CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

  // 2. Create Indexes
  console.log('Verifying indexes...');
  db.exec(`CREATE INDEX IF NOT EXISTS idx_titles_municipality ON titles(municipality_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_titles_serial ON titles(serialNumber)`);

  // 3. Handle Admin User
  console.log('Checking admin user...');
  const { ensureAdminSync } = require('../utils/authUtils');
  ensureAdminSync(db);

  // 4. Predefined Municipalities
  const checkStmt = db.prepare("SELECT id FROM municipalities LIMIT 1");
  const row = checkStmt.get();
  
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
      { id: '10', name: 'Cervantes', district: 3, notes: '' },
      { id: '11', name: 'Gabu', district: 3, notes: '' },
      { id: '12', name: 'La Trinidad', district: 3, notes: '' },
      { id: '13', name: 'Luna', district: 1, notes: '' },
      { id: '14', name: 'Naguilian', district: 1, notes: '' },
      { id: '15', name: 'Pugo', district: 2, notes: '' },
      { id: '16', name: 'San Gabriel', district: 3, notes: '' },
      { id: '17', name: 'San Juan', district: 1, notes: '' },
      { id: '18', name: 'Santol', district: 3, notes: '' },
      { id: '19', name: 'Sudipen', district: 3, notes: '' },
      { id: '20', name: 'Tubao', district: 2, notes: '' }
    ];

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO municipalities (id, name, district, notes)
      VALUES (@id, @name, @district, @notes)
    `);

    const insertMany = db.transaction((munis) => {
      for (const muni of munis) {
        insertStmt.run(muni);
      }
    });

    insertMany(predefinedMunicipalities);
    console.log(`Inserted ${predefinedMunicipalities.length} municipalities.`);
  }

  console.log('Database setup complete.');
  db.close();
  process.exit(0);

} catch (err) {
  console.error('Setup error:', err.message);
  db.close();
  process.exit(1);
}
