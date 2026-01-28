describe('Google Sheets API availability', () => {
  it('should be able to require googleapis', () => {
    const { google } = require('googleapis');
    expect(google).toBeDefined();
  });
});
