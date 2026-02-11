const { google } = require('googleapis');
const path = require('path');

// Cache the sheets client
let sheetsClient = null;

/**
 * Initializes and returns a Google Sheets client.
 * Uses service account authentication.
 */
async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '..', 'credentials.json'),
      // Scopes for Google Sheets API
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const authClient = await auth.getClient();
    sheetsClient = google.sheets({ version: 'v4', auth: authClient });
    return sheetsClient;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

/**
 * Fetches rows from a specific Google Sheet and range.
 * @param {string} spreadsheetId - The ID of the Google Sheet.
 * @param {string} range - The A1 notation range (e.g., 'Sheet1!A1:Z100').
 * @returns {Array} - 2D array of row data.
 */
async function fetchSheetRows(spreadsheetId, range) {
  const client = await getSheetsClient();
  
  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found in the specified range.');
      return [];
    }

    return rows;
  } catch (error) {
    console.error('Error fetching sheet rows:', error.message);
    throw new Error(`Failed to fetch sheet rows: ${error.message}`);
  }
}

module.exports = {
  getSheetsClient,
  fetchSheetRows,
};
