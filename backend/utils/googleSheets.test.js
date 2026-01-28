const { getSheetsClient, fetchSheetRows } = require('./googleSheets');
const { google } = require('googleapis');

jest.mock('googleapis', () => {
  const mockSheets = {
    spreadsheets: {
      values: {
        get: jest.fn(),
      },
    },
  };
  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({
          getClient: jest.fn().mockResolvedValue({}),
        })),
      },
      sheets: jest.fn(() => mockSheets),
    },
  };
});

describe('Google Sheets Utility', () => {
  it('should get a sheets client', async () => {
    const client = await getSheetsClient();
    expect(client).toBeDefined();
    expect(google.sheets).toHaveBeenCalled();
  });

  it('should fetch rows from a sheet', async () => {
    const mockRows = [['Serial', 'Name'], ['123', 'John Doe']];
    const client = await getSheetsClient();
    client.spreadsheets.values.get.mockResolvedValue({
      data: {
        values: mockRows,
      },
    });

    const rows = await fetchSheetRows('some-id', 'A1:B10');
    expect(rows).toEqual(mockRows);
    expect(client.spreadsheets.values.get).toHaveBeenCalledWith({
      spreadsheetId: 'some-id',
      range: 'A1:B10',
    });
  });
});