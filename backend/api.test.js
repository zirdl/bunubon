const request = require('supertest');
const app = require('./server');

describe('API Endpoints', () => {
  describe('GET /api/titles/export', () => {
    it('should return an Excel file', async () => {
      const response = await request(app).get('/api/titles/export');
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.header['content-disposition']).toContain('attachment; filename=land_titles.xlsx');
    });
  });
});
