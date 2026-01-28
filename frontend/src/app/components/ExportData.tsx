import { FileSpreadsheet, Download } from 'lucide-react';

const API_BASE_URL = '/api';

export function ExportData() {
  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/municipalities`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const municipalities = await response.json();
      
      // Create CSV content
      const headers = ['Municipality', 'TCT-CLOA Total', 'TCT-CLOA Processed', 'TCT-EP Total', 'TCT-EP Processed', 'Status', 'District', 'Notes'];
      const rows = municipalities.map((m: any) => [
        m.name,
        m.tctCloaTotal,
        m.tctCloaProcessed,
        m.tctEpTotal,
        m.tctEpProcessed,
        m.status,
        `District ${m.district}`,
        m.notes || ''
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `dar_municipalities_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/titles/export`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `land_titles_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel. Please try again.');
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-emerald-800">Export Data</h1>
          <p className="text-gray-600 mt-1">Export municipality and land title data</p>
        </div>

        <div className="space-y-6">
          {/* CSV Export */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Export to CSV</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download all municipality data in CSV format. Compatible with Excel and Google Sheets.
                </p>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-lg hover:from-emerald-800 hover:to-emerald-900 transition-colors shadow-md"
                >
                  <Download className="w-5 h-5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Excel Export */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Export to Excel</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download all data in Excel format with formatted sheets and charts.
                </p>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-900 mb-2">Export Information</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Exports include all municipality data and processing status</li>
              <li>Individual land title records are exported separately per municipality</li>
              <li>Date and time of export are included in the filename</li>
              <li>Exported files can be re-imported for backup purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
