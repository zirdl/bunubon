const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('--- Database Reset ---');

db.serialize(() => {
  // 1. Drop Tables to start fresh (except users and municipalities, we'll clear them specifically)
  console.log('Clearing titles and checkpoints...');
  db.run(`DELETE FROM titles`);
  db.run(`DELETE FROM municipality_checkpoints`);
  
  // 2. Clear municipalities but re-provision them
  console.log('Resetting municipalities...');
  db.run(`DELETE FROM municipalities`);
  
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

  // 3. Clear non-admin users
  console.log('Clearing non-admin users...');
  db.run(`DELETE FROM users WHERE username != 'admin'`);

  // 4. Ensure admin exists
  db.get("SELECT id FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      console.log('Creating default admin user...');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO users (id, username, password, role, fullName, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [crypto.randomUUID(), 'admin', hashedPassword, 'Admin', 'Administrator', 'admin@dar.gov.ph', 'Active']);
    }
  });
});

db.close(() => {
  console.log('--- Database Reset Complete ---');
});
