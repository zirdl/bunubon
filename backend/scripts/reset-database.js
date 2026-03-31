#!/usr/bin/env node
/**
 * Database Reset Script for Development
 * Truncates all tables and reseeds with dummy data
 */

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, '..', 'database.db');
console.log(`Database path: ${dbPath}\n`);

try {
  // Open database
  const db = new Database(dbPath);
  db.pragma('foreign_keys = OFF');
  db.pragma('journal_mode = WAL');

  // Disable foreign key checks temporarily
  db.exec('PRAGMA foreign_keys = OFF');

  // Get all tables (excluding system tables)
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();

  // Delete all data from each table (but keep schema)
  console.log('📋 Clearing table data...');
  const tablesToClear = ['titles', 'municipality_checkpoints', 'audit_logs', 'users', 'sessions', 'municipalities'];
  tablesToClear.forEach(tableName => {
    try {
      db.exec(`DELETE FROM ${tableName}`);
      console.log(`   ✓ Cleared: ${tableName}`);
    } catch (err) {
      console.log(`   ⚠ Skipped: ${tableName} (${err.message})`);
    }
  });

  // Reset auto-increment counters (if exists)
  console.log('\n🔄 Resetting sequences...');
  try {
    db.exec("DELETE FROM sqlite_sequence WHERE name NOT LIKE 'sqlite_%'");
    console.log('   ✓ Sequences reset');
  } catch (err) {
    console.log('   ℹ No sequences to reset (this is normal)');
  }

  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create admin user
  console.log('\n👤 Creating admin user...');
  const adminId = crypto.randomUUID();
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  db.prepare(`
    INSERT INTO users (id, username, password, role, fullName, email, status, mustChangePassword)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, 'admin', hashedPassword, 'ADMIN', 'Administrator', 'admin@dar.gov.ph', 'ACTIVE', 0);
  
  console.log('   ✓ Admin user created');
  console.log('     Username: admin');
  console.log('     Password: admin123');

  // Create demo editor user
  console.log('\n👤 Creating demo editor user...');
  const editorId = crypto.randomUUID();
  const editorHash = bcrypt.hashSync('editor123', 10);
  
  db.prepare(`
    INSERT INTO users (id, username, password, role, fullName, email, status, mustChangePassword)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(editorId, 'editor', editorHash, 'EDITOR', 'Demo Editor', 'editor@dar.gov.ph', 'ACTIVE', 0);
  
  console.log('   ✓ Editor user created');
  console.log('     Username: editor');
  console.log('     Password: editor123');

  // Create demo viewer user
  const viewerId = crypto.randomUUID();
  const viewerHash = bcrypt.hashSync('viewer123', 10);
  
  db.prepare(`
    INSERT INTO users (id, username, password, role, fullName, email, status, mustChangePassword)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(viewerId, 'viewer', viewerHash, 'VIEWER', 'Demo Viewer', 'viewer@dar.gov.ph', 'ACTIVE', 0);
  
  console.log('   ✓ Viewer user created');
  console.log('     Username: viewer');
  console.log('     Password: viewer123');

  // Create municipalities
  console.log('\n📍 Creating municipalities...');
  const municipalities = [
    { id: '1', name: 'Agoo', district: 2 },
    { id: '2', name: 'Aringay', district: 2 },
    { id: '3', name: 'Bacnotan', district: 1 },
    { id: '4', name: 'Bagulin', district: 3 },
    { id: '5', name: 'Balaoan', district: 1 },
    { id: '6', name: 'Bangar', district: 1 },
    { id: '7', name: 'Bauang', district: 2 },
    { id: '8', name: 'Burgos', district: 2 },
    { id: '9', name: 'Caba', district: 2 },
    { id: '10', name: 'Cervantes', district: 3 },
    { id: '11', name: 'Gabu', district: 3 },
    { id: '12', name: 'La Trinidad', district: 3 },
    { id: '13', name: 'Luna', district: 1 },
    { id: '14', name: 'Naguilian', district: 1 },
    { id: '15', name: 'Pugo', district: 2 },
    { id: '16', name: 'San Gabriel', district: 3 },
    { id: '17', name: 'San Juan', district: 1 },
    { id: '18', name: 'Santol', district: 3 },
    { id: '19', name: 'Sudipen', district: 3 },
    { id: '20', name: 'Tubao', district: 2 }
  ];

  const insertMuni = db.prepare(`
    INSERT INTO municipalities (id, name, district, status, notes)
    VALUES (?, ?, ?, 'ACTIVE', '')
  `);

  const insertMany = db.transaction((munis) => {
    for (const muni of munis) {
      insertMuni.run(muni.id, muni.name, muni.district);
    }
  });

  insertMany(municipalities);
  console.log(`   ✓ Created ${municipalities.length} municipalities`);

  // Create sample titles
  console.log('\n📄 Creating sample titles...');
  const titleTypes = ['TCT-CLOA', 'TCT-EP', 'Regular', 'Mother CCLOA'];
  const statuses = ['released', 'processing', 'on-hand', 'for-review'];
  const barangays = ['Poblacion', 'San Pedro', 'Santa Maria', 'San Jose', 'San Antonio'];
  
  const insertTitle = db.prepare(`
    INSERT INTO titles (
      id, municipality_id, serialNumber, titleType, subtype, 
      beneficiaryName, lotNumber, barangayLocation, area, status,
      dateIssued, dateRegistered, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let titleCount = 0;
  municipalities.forEach(muni => {
    // Create 5-10 titles per municipality
    const numTitles = Math.floor(Math.random() * 6) + 5;
    for (let i = 0; i < numTitles; i++) {
      const titleId = crypto.randomUUID();
      const titleType = titleTypes[Math.floor(Math.random() * titleTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const serialNum = `${muni.id}-${String(i + 1).padStart(4, '0')}`;
      
      insertTitle.run(
        titleId,
        muni.id,
        serialNum,
        titleType,
        titleType === 'Regular' ? 'Patent' : null,
        `Beneficiary ${titleCount + 1}`,
        `Lot ${String(i + 1).padStart(3, '0')}`,
        barangays[Math.floor(Math.random() * barangays.length)],
        (Math.random() * 10 + 1).toFixed(2),
        status,
        new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        status === 'released' ? 'Distributed to beneficiary' : ''
      );
      titleCount++;
    }
  });

  console.log(`   ✓ Created ${titleCount} sample titles`);

  // Create audit log entry
  console.log('\n📝 Creating audit log...');
  const auditId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO audit_logs (id, userId, action, details, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(auditId, adminId, 'DATABASE_RESET', 'Database was reset for development', new Date().toISOString());
  console.log('   ✓ Audit log created');

  // Optimize database
  console.log('\n✨ Optimizing database...');
  db.exec('VACUUM');
  db.exec('ANALYZE');
  console.log('   ✓ Database optimized');

  // Close database
  db.close();

  console.log('\n✅ Database reset complete!\n');
  console.log('═══════════════════════════════════════');
  console.log('📋 Login Credentials:');
  console.log('═══════════════════════════════════════');
  console.log('Admin:   admin / admin123');
  console.log('Editor:  editor / editor123');
  console.log('Viewer:  viewer / viewer123');
  console.log('═══════════════════════════════════════\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
}
