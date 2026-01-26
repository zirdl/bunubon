const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const municipalities = [
  { id: '1', name: 'Agoo', district: 2 },
  { id: '2', name: 'Aringay', district: 2 },
  { id: '3', name: 'Bacnotan', district: 1 },
  { id: '4', name: 'Bagulin', district: 2 },
  { id: '5', name: 'Balaoan', district: 1 },
  { id: '6', name: 'Bangar', district: 1 },
  { id: '7', name: 'Bauang', district: 2 },
  { id: '8', name: 'Burgos', district: 2 },
  { id: '9', name: 'Caba', district: 2 },
  { id: '10', name: 'Luna', district: 1 },
  { id: '11', name: 'Naguilian', district: 2 },
  { id: '12', name: 'Pugo', district: 2 },
  { id: '13', name: 'Rosario', district: 2 },
  { id: '14', name: 'San Gabriel', district: 1 },
  { id: '15', name: 'San Juan', district: 1 },
  { id: '16', name: 'Santol', district: 1 },
  { id: '17', name: 'Santo Tomas', district: 2 },
  { id: '18', name: 'Sudipen', district: 1 },
  { id: '19', name: 'Tubao', district: 2 },
  { id: '20', name: 'San Fernando', district: 1 },
];

const titleTypes = ['SPLIT', 'Mother CCLOA', 'TCT-CLOA', 'TCT-EP'];
const motherSubtypes = ['TCT', 'CLOA'];
const statuses = ['on-hand', 'processing', 'released'];
const firstNames = ['JUAN', 'MARIA', 'JOSE', 'ANA', 'PEDRO', 'ELENA', 'LUIS', 'CARMEN', 'ANTONIO', 'ROSA', 'REYNANTE', 'GREGORIO', 'FELICIDAD', 'TERESITA', 'RODRIGO'];
const lastNames = ['SANTOS', 'REYES', 'CRUZ', 'GARCIA', 'GONZALES', 'LOPEZ', 'BAUTISTA', 'HERNANDEZ', 'RAMOS', 'FLORES', 'MENDOZA', 'PASCUA', 'DE GUZMAN', 'VILLANUEVA'];

// Barangays for each municipality in La Union based on official data
const barangayMap = {
  'Agoo': ['Ambitacay', 'Balawarte', 'Capas', 'Consolacion', 'Macalva Central', 'Macalva Norte', 'Macalva Sur', 'Nazareno', 'Purok', 'San Agustin East', 'San Agustin Norte', 'San Agustin Sur', 'San Antonino', 'San Antonio', 'San Francisco', 'San Isidro', 'San Joaquin Norte', 'San Joaquin Sur', 'San Jose Norte', 'San Jose Sur', 'San Juan', 'San Julian Central', 'San Julian East', 'San Julian Norte', 'San Julian West', 'San Manuel Norte', 'San Manuel Sur', 'San Marcos', 'San Miguel', 'San Nicolas Central', 'San Nicolas East', 'San Nicolas Norte', 'San Nicolas Sur', 'San Nicolas West', 'San Pedro', 'San Roque East', 'San Roque West', 'San Vicente Norte', 'San Vicente Sur', 'Santa Ana', 'Santa Barbara', 'Santa Fe', 'Santa Maria', 'Santa Monica', 'Santa Rita', 'Santa Rita East', 'Santa Rita Norte', 'Santa Rita Sur', 'Santa Rita West'],
  'Aringay': ['Alaska', 'Basca', 'Dulao', 'Gallano', 'Macabato', 'Manga', 'Pangao-aoan East', 'Pangao-aoan West', 'Poblacion', 'Samara', 'San Antonio', 'San Benito Norte', 'San Benito Sur', 'San Eugenio', 'San Juan East', 'San Juan West', 'San Simon East', 'San Simon West', 'Santa Cecilia', 'Santa Lucia', 'Santa Rita East', 'Santa Rita West', 'Santo Rosario East', 'Santo Rosario West'],
  'Bacnotan': ['Agtipal', 'Arosip', 'Bacqui', 'Bacsil', 'Bagutot', 'Ballogo', 'Baroro', 'Bitalag', 'Bulala', 'Burayoc', 'Bussaoit', 'Cabaroan', 'Cabarsican', 'Cabugao', 'Calautit', 'Carcarmay', 'Casiaman', 'Galongen', 'Guinabang', 'Legleg', 'Lisqueb', 'Mabanengbeng 1st', 'Mabanengbeng 2nd', 'Maragayap', 'Nagatiran', 'Nagsaraboan', 'Nagsimbaanan', 'Nangalisan', 'Narra', 'Ortega', 'Oya-oy', 'Paagan', 'Pandan', 'Pang-pang', 'Poblacion', 'Quirino', 'Raois', 'Salincob', 'San Martin', 'Santa Cruz', 'Santa Rita', 'Sapilang', 'Sayoan', 'Sipulo', 'Tammocalao', 'Ubbog', 'Zaragosa'],
  'Bagulin': ['Alibangsay', 'Baay', 'Cambaly', 'Cardiz', 'Dagup', 'Libbo', 'Suyo', 'Tagudtud', 'Tio-angan', 'Wallayan'],
  'Balaoan': ['Almieda', 'Antonino', 'Apatut', 'Ar-arampang', 'Baracbac Este', 'Baracbac Oeste', 'Bet-ang', 'Bulbulala', 'Bungol', 'Butubut Este', 'Butubut Norte', 'Butubut Oeste', 'Butubut Sur', 'Cabuaan Oeste', 'Calliat', 'Calungbuyan', 'Camiling', 'Dr. Camilo Osias Poblacion', 'Guinaburan', 'Masupe', 'Nagsabaran Norte', 'Nagsabaran Sur', 'Nalasin', 'Napaset', 'Pa-o', 'Pagbennecan', 'Pagleddegan', 'Pantar Norte', 'Pantar Sur', 'Paraoir', 'Patpata', 'Sablut', 'San Pablo', 'Sinapangan Norte', 'Sinapangan Sur', 'Tallipugo'],
  'Bangar': ['Agdeppa', 'Alzate', 'Bangaoilan East', 'Bangaoilan West', 'Barraca', 'Cadapli', 'Caggao', 'Central East No. 1', 'Central East No. 2', 'Central West No. 1', 'Central West No. 2', 'Central West No. 3', 'Consuegra', 'General Prim East', 'General Prim West', 'General Terrero', 'Luzong Norte', 'Luzong Sur', 'Maria Cristina East', 'Maria Cristina West', 'Mindoro', 'Nagsabaran', 'Paratong No. 3', 'Paratong No. 4', 'Paratong Norte', 'Quintarong', 'Reyna Regente', 'Rissing', 'San Blas', 'San Cristobal', 'Sinapangan Norte', 'Sinapangan Sur', 'Ubbog'],
  'Bauang': ['Acao', 'Baccuit Norte', 'Baccuit Sur', 'Bagbag', 'Ballay', 'Bawanta', 'Boy-utan', 'Bucayab', 'Cabalayangan', 'Cabisilan', 'Calumbaya', 'Carmay', 'Casilagan', 'Central East', 'Central West', 'Dili', 'Disso-or', 'Guerrero', 'Lower San Agustin', 'Nagrebcan', 'Pagdalagan Sur', 'Palintucang', 'Palugsi-Limmansangan', 'Parian Este', 'Parian Oeste', 'Paringao', 'Payocpoc Norte Este', 'Payocpoc Norte Oeste', 'Payocpoc Sur', 'Pilar', 'Pottot', 'Pudoc', 'Pugo', 'Quinavite', 'Santa Monica', 'Santiago', 'Taberna', 'Upper San Agustin', 'Urayong'],
  'Burgos': ['Agpay', 'Bilis', 'Caoayan', 'Dalacdac', 'Delles', 'Imelda', 'Libtong', 'Linuan', 'Lower Tumapoc', 'New Poblacion', 'Old Poblacion', 'Upper Tumapoc'],
  'Caba': ['Bautista', 'Gana', 'Juan Cartas', 'Las-ud', 'Liquicia', 'Poblacion Norte', 'Poblacion Sur', 'San Carlos', 'San Cornelio', 'San Fermin', 'San Gregorio', 'San Jose', 'Santiago Norte', 'Santiago Sur', 'Sobredillo', 'Urayong', 'Wenceslao'],
  'Luna': ['Alcala', 'Ayaoan', 'Barangobong', 'Barrientos', 'Bungro', 'Buselbusel', 'Cabalitocan', 'Cantoria No. 1', 'Cantoria No. 2', 'Cantoria No. 3', 'Cantoria No. 4', 'Carisquis', 'Darigayos', 'Magallanes', 'Magsiping', 'Mamay', 'Nagrebcan', 'Nalvo Norte', 'Nalvo Sur', 'Napaset', 'Oaqui No. 1', 'Oaqui No. 2', 'Oaqui No. 3', 'Oaqui No. 4', 'Pila', 'Pitpitac', 'Rimos No. 1', 'Rimos No. 2', 'Rimos No. 3', 'Rimos No. 4', 'Rimos No. 5', 'Rissing', 'Salcedo', 'Santo Domingo Norte', 'Santo Domingo Sur', 'Sucoc Norte', 'Sucoc Sur', 'Suyo', 'Tallaoen', 'Victoria'],
  'Naguilian': ['Aguioas', 'Al-alinao Norte', 'Al-alinao Sur', 'Ambaracao Norte', 'Ambaracao Sur', 'Angin', 'Balecbec', 'Bancagan', 'Baraoas Norte', 'Baraoas Sur', 'Bariquir', 'Bato', 'Bimmotobot', 'Cabaritan Norte', 'Cabaritan Sur', 'Casilagan', 'Dal-lipaoen', 'Daramuangan', 'Guesset', 'Gusing Norte', 'Gusing Sur', 'Imelda', 'Lioac Norte', 'Lioac Sur', 'Magungunay', 'Mamat-ing Norte', 'Mamat-ing Sur', 'Nagsidorisan', 'Natividad', 'Ortiz', 'Ribsuan', 'San Antonio', 'San Isidro', 'Sili', 'Suguidan Norte', 'Suguidan Sur', 'Tuddingan'],
  'Pugo': ['Ambalite', 'Ambangonan', 'Cares', 'Cuenca', 'Duplas', 'Maoasoas Norte', 'Maoasoas Sur', 'Palina', 'Poblacion East', 'Poblacion West', 'San Luis', 'Saytan', 'Tavora East', 'Tavora Proper'],
  'Rosario': ['Alipang', 'Ambangonan', 'Amlang', 'Bacani', 'Bangar', 'Bani', 'Benteng-Sapilang', 'Cadumanian', 'Camp One', 'Carunuan East', 'Carunuan West', 'Casilagan', 'Cataguingtingan', 'Concepcion', 'Damortis', 'Gumot-Nagcolaran', 'Inabaan Norte', 'Inabaan Sur', 'Marcos', 'Nagtagaan', 'Nangcamotian', 'Parasapas', 'Poblacion East', 'Poblacion West', 'Puzon', 'Rabon', 'San Jose', 'Subusub', 'Tabtabungao', 'Tanglag', 'Tay-ac', 'Udiao', 'Vila'],
  'San Fernando': ['Abut', 'Apaleng', 'Bacsil', 'Bangbangolan', 'Bangcusay', 'Barangay I', 'Barangay II', 'Barangay III', 'Barangay IV', 'Baraoas', 'Bato', 'Biday', 'Birunget', 'Bungro', 'Cabaroan', 'Cabarsican', 'Cadaclan', 'Calabugao', 'Camansi', 'Canaoay', 'Carlatan', 'Catbangen', 'Dallangayan Este', 'Dallangayan Oeste', 'Dalumpinas Este', 'Dalumpinas Oeste', 'Ilocanos Norte', 'Ilocanos Sur', 'Langcuas', 'Lingsat', 'Madayegdeg', 'Mameltac', 'Masicong', 'Nagyubuyuban', 'Namtutan', 'Narra Este', 'Narra Oeste', 'Pacpaco', 'Pagdalagan', 'Pagdaraoan', 'Pagudpud', 'Pao Norte', 'Pao Sur', 'Parian', 'Pias', 'Poro', 'Puspus', 'Sacyud', 'Sagayad', 'San Agustin', 'San Francisco', 'San Vicente', 'Santiago Norte', 'Santiago Sur', 'Saoay', 'Sevilla', 'Siboan-Otong', 'Tanqui', 'Tanquigan'],
  'San Gabriel': ['Amontoc', 'Apayao', 'Balbalayang', 'Bayabas', 'Bucao', 'Bumbuneg', 'Daking', 'Lacong', 'Lipay Este', 'Lipay Norte', 'Lipay Proper', 'Lipay Sur', 'Lon-oy', 'Poblacion', 'Polipol'],
  'San Juan': ['Allangigan', 'Aludaid', 'Bacsayan', 'Balballosa', 'Bambanay', 'Bugbugcao', 'Caarusipan', 'Cabaroan', 'Cabugnayan', 'Cacapian', 'Caculangan', 'Calincamasan', 'Casilagan', 'Catdongan', 'Dangdangla', 'Dasay', 'Dinanum', 'Duplas', 'Guinguinabang', 'Ili Norte', 'Ili Sur', 'Legleg', 'Lubing', 'Nadsaag', 'Nagsabaran', 'Naguirangan', 'Naguituban', 'Nagyubuyuban', 'Oaquing', 'Pacpacac', 'Pagdildilan', 'Panicsican', 'Quidem', 'San Felipe', 'Santa Rosa', 'Santo Rosario', 'Saracat', 'Sinapangan', 'Taboc', 'Talogtog', 'Urbiztondo'],
  'Santo Tomas': ['Ambitacay', 'Bail', 'Balaoc', 'Balsaan', 'Baybay', 'Cabaruan', 'Casantaan', 'Casilagan', 'Cupang', 'Damortis', 'Fernando', 'Linong', 'Lomboy', 'Malabago', 'Namonitan', 'Narvacan', 'Patac', 'Poblacion', 'Pongpong', 'Raois', 'Tococ', 'Tubod', 'Ubagan'],
  'Santol': ['Corrooy', 'Lettac Norte', 'Lettac Sur', 'Mangaan', 'Paagan', 'Poblacion', 'Puguil', 'Ramot', 'Sapdaan', 'Sasaba', 'Tubaday'],
  'Sudipen': ['Bigbiga', 'Bulalaan', 'Castro', 'Duplas', 'Ilocano', 'Ipet', 'Maliclico', 'Namaltugan', 'Old Central', 'Poblacion', 'Porporiket', 'San Francisco Norte', 'San Francisco Sur', 'San Jose', 'Sengngat', 'Turod', 'Up-uplas'],
  'Tubao': ['Amallapay', 'Anduyan', 'Caoigue', 'Francia Sur', 'Francia West', 'Garcia', 'Gonzales', 'Halog East', 'Halog West', 'Leones East', 'Leones West', 'Linapew', 'Lloren', 'Magsaysay', 'Pideg', 'Poblacion', 'Rizal', 'Santa Teresa']
};

// Get all barangays for a specific municipality
function getBarangaysForMunicipality(muniName) {
  return barangayMap[muniName] || ['Poblacion']; // Default to Poblacion if municipality not found
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

const titlesToInsert = [];
const numTitles = 1200;

// Date range: Last 12 months
const endDate = new Date('2026-01-06');
const startDate = new Date('2025-01-01');

for (let i = 0; i < numTitles; i++) {
  const muni = getRandomElement(municipalities);
  const type = getRandomElement(titleTypes);
  const status = getRandomElement(statuses);
  
  let dateIssued = null;
  let dateRegistered = null;
  let dateReceived = null;
  let dateDistributed = null;

  const baseDate = getRandomDate(startDate, endDate);
  
  if (status === 'released') {
    dateIssued = formatDate(baseDate);
    dateDistributed = formatDate(new Date(baseDate.getTime() + 86400000 * Math.floor(Math.random() * 30)));
    dateRegistered = formatDate(new Date(baseDate.getTime() - 86400000 * Math.floor(Math.random() * 60)));
    dateReceived = formatDate(new Date(baseDate.getTime() - 86400000 * Math.floor(Math.random() * 10)));
  } else if (status === 'processing') {
    dateReceived = formatDate(baseDate);
    dateRegistered = formatDate(new Date(baseDate.getTime() + 86400000 * Math.floor(Math.random() * 15)));
  } else {
    dateReceived = formatDate(baseDate);
  }

  let subtype = '';
  if (type === 'Mother CCLOA') {
    subtype = getRandomElement(motherSubtypes);
  } else if (type === 'TCT-CLOA') {
    subtype = 'CLOA';
  } else if (type === 'TCT-EP') {
    subtype = 'EP';
  }

  titlesToInsert.push({
    id: crypto.randomUUID(),
    municipality_id: muni.id,
    serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
    titleType: type,
    subtype: subtype,
    beneficiaryName: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
    lotNumber: `${Math.floor(1 + Math.random() * 500)}-${getRandomElement(['A', 'B', 'C', 'D'])}`,
    barangayLocation: getRandomElement(getBarangaysForMunicipality(muni.name)),
    area: parseFloat((1000 + Math.random() * 30000).toFixed(2)),
    status: status,
    dateIssued: dateIssued,
    dateRegistered: dateRegistered,
    dateReceived: dateReceived,
    dateDistributed: dateDistributed,
    notes: 'Regenerated dummy data'
  });
}

db.serialize(() => {
  console.log("Clearing database...");
  db.run("DELETE FROM titles");
  db.run("DELETE FROM municipalities");
  db.run("DELETE FROM municipality_checkpoints");
  db.run("DELETE FROM users");
  
  console.log("Re-inserting default admin...");
  const hashedPassword = crypto.createHash('sha256').update('admin123').digest('hex');
  db.run("INSERT INTO users (id, username, password, role, fullName, email, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [crypto.randomUUID(), 'admin', hashedPassword, 'Admin', 'Administrator', 'admin@dar.gov.ph', 'Active']);

  console.log("Re-inserting municipalities...");
  const insertMuniStmt = db.prepare(`
    INSERT INTO municipalities (id, name, tctCloaTotal, tctCloaProcessed, tctEpTotal, tctEpProcessed, status, notes, district)
    VALUES (?, ?, 0, 0, 0, 0, 'active', '', ?)
  `);

  const insertCheckpointStmt = db.prepare(`
    INSERT INTO municipality_checkpoints (id, municipality_id, label, completed)
    VALUES (?, ?, ?, ?)
  `);

  municipalities.forEach(muni => {
    insertMuniStmt.run([muni.id, muni.name, muni.district]);
    insertCheckpointStmt.run([`${muni.id}-1`, muni.id, 'Initial Documentation Completed', 0]);
    insertCheckpointStmt.run([`${muni.id}-2`, muni.id, 'Final Processing & Release', 0]);
  });

  insertMuniStmt.finalize();
  insertCheckpointStmt.finalize();

  console.log("Inserting titles...");
  const stmt = db.prepare(`INSERT INTO titles (
    id, municipality_id, serialNumber, titleType, subtype, beneficiaryName, 
    lotNumber, barangayLocation, area, status, dateIssued, dateRegistered, dateReceived, 
    dateDistributed, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  db.run("BEGIN TRANSACTION");
  titlesToInsert.forEach(t => {
    stmt.run([
      t.id, t.municipality_id, t.serialNumber, t.titleType, t.subtype, t.beneficiaryName,
      t.lotNumber, t.barangayLocation, t.area, t.status, t.dateIssued, t.dateRegistered,
      t.dateReceived, t.dateDistributed, t.notes
    ]);
  });
  
  db.run("COMMIT", (err) => {
    if (err) {
      console.error("Error committing transaction:", err);
    } else {
      console.log(`Successfully regenerated ${titlesToInsert.length} titles with updated types and subtypes.`);
    }
    db.close();
  });
});
