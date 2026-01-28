const request = require('supertest');
const app = require('./server');
const { fetchSheetRows } = require('./utils/googleSheets');
const { mapRowsToTitles, syncTitles } = require('./utils/sync');

jest.mock('./utils/googleSheets');
jest.mock('./utils/sync');

describe('API Endpoints', () => {
  describe('GET /api/titles/export', () => {
    it('should return an Excel file', async () => {
      const response = await request(app).get('/api/titles/export');
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.header['content-disposition']).toContain('attachment; filename=land_titles.xlsx');
    });
  });

  describe('Google Sheets Sync Endpoints', () => {
    it('POST /api/sync/google-sheets/preview should return mapped titles', async () => {
      fetchSheetRows.mockResolvedValue([
        ['Serial', 'Owner', 'Muni', 'Type', 'Status'],
        ['SN001', 'Juan', 'Agoo', 'SPLIT', 'on-hand']
      ]);
      mapRowsToTitles.mockReturnValue([{ serialNumber: 'SN001' }]);

      const response = await request(app)
        .post('/api/sync/google-sheets/preview')
        .send({ 
          sheetId: 'test-id', 
          range: 'Sheet1!A1:E10',
          mapping: {
            'Serial': 'serialNumber',
            'Owner': 'beneficiaryName',
            'Muni': 'municipalityName',
            'Type': 'titleType',
            'Status': 'status'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].serialNumber).toBe('SN001');
    });

    it('POST /api/sync/google-sheets/confirm should perform sync', async () => {
      syncTitles.mockResolvedValue({ inserted: 1, updated: 0, errors: [] });

      const response = await request(app)
        .post('/api/sync/google-sheets/confirm')
        .send({ 
          titles: [{ serialNumber: 'SN001' }]
        });

      expect(response.status).toBe(200);
      expect(response.body.inserted).toBe(1);
    });
  });
});