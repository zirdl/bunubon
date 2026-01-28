const { mapRowsToTitles, syncTitles } = require('./sync');

describe('Sync Logic', () => {
  const mockRows = [
    ['Serial', 'Owner', 'Muni', 'Type', 'Status'],
    ['SN001', 'Juan Dela Cruz', 'Agoo', 'SPLIT', 'released'],
    ['SN002', 'Maria Clara', 'Agoo', 'Regular', 'on-hand'],
  ];

  const headerMapping = {
    'Serial': 'serialNumber',
    'Owner': 'beneficiaryName',
    'Muni': 'municipalityName',
    'Type': 'titleType',
    'Status': 'status',
  };

  it('should map rows to title objects', () => {
    const titles = mapRowsToTitles(mockRows, headerMapping);
    expect(titles).toHaveLength(2);
    expect(titles[0].serialNumber).toBe('SN001');
    expect(titles[0].status).toBe('released');
    expect(titles[1].beneficiaryName).toBe('Maria Clara');
  });

  it('should sync titles with the database (Upsert)', async () => {
    const mockDb = {
      all: jest.fn((sql, params, cb) => cb(null, [{ id: '1', name: 'Agoo' }])),
      get: jest.fn((sql, params, cb) => {
        if (params[0] === 'SN001') cb(null, { id: 'uuid-1' }); // Exists
        else cb(null, null); // New
      }),
      run: jest.fn((sql, params, cb) => cb(null)),
    };

    const titles = mapRowsToTitles(mockRows, headerMapping);
    const results = await syncTitles(mockDb, titles);

    expect(results.inserted).toBe(1);
    expect(results.updated).toBe(1);
    expect(results.errors).toHaveLength(0);
    expect(mockDb.run).toHaveBeenCalledTimes(2);
  });
});