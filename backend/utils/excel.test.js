const { generateExcel } = require('./excel');

describe('Excel Utility', () => {
  it('should generate an Excel buffer from JSON data', () => {
    const data = [
      { id: 1, name: 'Title 1', municipality: 'San Fernando' },
      { id: 2, name: 'Title 2', municipality: 'Agoo' },
    ];
    const buffer = generateExcel(data, 'Land Titles');
    expect(buffer).toBeDefined();
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });
});
