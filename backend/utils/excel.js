const XLSX = require('xlsx');

/**
 * Generates an Excel buffer from JSON data.
 * @param {Array} data - Array of objects to be converted to Excel.
 * @param {string} sheetName - Name of the worksheet.
 * @returns {Buffer} - Excel file buffer.
 */
function generateExcel(data, sheetName = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Return the workbook as a buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

module.exports = {
  generateExcel,
};
