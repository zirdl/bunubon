import { useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw, AlertCircle, Check, ArrowRight, X } from 'lucide-react';

const API_BASE_URL = '/api';

const SYSTEM_FIELDS = [
  { key: 'serialNumber', label: 'Serial Number' },
  { key: 'titleType', label: 'Title Type' },
  { key: 'subtype', label: 'Subtype' },
  { key: 'beneficiaryName', label: 'Beneficiary Name' },
  { key: 'lotNumber', label: 'Lot Number' },
  { key: 'area', label: 'Area (sqm)' },
  { key: 'status', label: 'Status' },
  { key: 'dateIssued', label: 'Date Issued' },
  { key: 'notes', label: 'Notes' },
  { key: 'municipalityName', label: 'Municipality' },
];

export function ExportData() {
  const [sheetId, setSheetId] = useState('');
  const [range, setRange] = useState('Sheet1!A1:Z100');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<{ inserted: number; updated: number; errors: string[] } | null>(null);

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

  const handlePreview = async () => {
    if (!sheetId) {
      alert('Please enter a Google Sheet ID');
      return;
    }

    setIsSyncing(true);
    try {
      // Create a default mapping based on labels
      const mapping: Record<string, string> = {};
      SYSTEM_FIELDS.forEach(field => {
        mapping[field.label] = field.key;
      });

      const response = await fetch(`${API_BASE_URL}/sync/google-sheets/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, range, mapping }),
      });

      if (!response.ok) throw new Error('Preview failed');
      const result = await response.json();
      setPreviewData(result.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Sync preview error:', error);
      alert('Failed to fetch preview. Ensure the sheet is shared with the service account.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sync/google-sheets/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles: previewData }),
      });

      if (!response.ok) throw new Error('Sync failed');
      const result = await response.json();
      setSyncResults(result);
      setShowPreview(false);
    } catch (error) {
      console.error('Sync confirmation error:', error);
      alert('Failed to synchronize data.');
    } finally {
      setIsSyncing(false);
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

          {/* Google Sheets Ingestion */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <RefreshCw className={`w-6 h-6 text-purple-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Sync from Google Sheets</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Pull live data from a collaborative Google Sheet directly into the system.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Google Sheet ID</label>
                    <input 
                      type="text"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      placeholder="e.g. 1AbC...928z"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Range</label>
                    <input 
                      type="text"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      placeholder="Sheet1!A1:Z100"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePreview}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors shadow-md disabled:opacity-50"
                  >
                    <span>Preview & Sync</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-gray-400 max-w-[200px]">
                    Note: Share your sheet with the service account email before syncing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Results Alert */}
          {syncResults && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="text-emerald-900 font-bold">Sync Successful</h4>
                <p className="text-sm text-emerald-800">
                  {syncResults.inserted} records inserted, {syncResults.updated} records updated.
                </p>
                {syncResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-red-600 uppercase">Errors encountered:</p>
                    <ul className="text-xs text-red-700 list-disc list-inside">
                      {syncResults.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                <button 
                  onClick={() => setSyncResults(null)}
                  className="mt-2 text-xs font-bold text-emerald-700 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

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

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  Sync Preview
                </h2>
                <p className="text-sm text-gray-500">Review {previewData.length} records found in Google Sheet</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3 text-sm text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p>
                  This is a preview of how the data will be mapped. Records with matching <strong>Serial Numbers</strong> will be updated, others will be inserted as new.
                </p>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {SYSTEM_FIELDS.map(f => (
                        <th key={f.key} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 whitespace-nowrap">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                        {SYSTEM_FIELDS.map(f => (
                          <td key={f.key} className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">
                            {row[f.key] || <span className="text-gray-300 italic">empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md font-bold disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Confirm Sync & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
