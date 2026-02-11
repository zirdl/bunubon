import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, ArrowRight, Check, AlertCircle, X, ChevronDown, Database } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface ImportDataProps {
  onCancel: () => void;
  onImportComplete: () => void;
  municipalities: { id: string; name: string }[];
}

const SYSTEM_FIELDS = [
  { key: 'serialNumber', label: 'Serial Number', required: true },
  { key: 'titleType', label: 'Title Type', required: true },
  { key: 'subtype', label: 'Subtype', required: false },
  { key: 'beneficiaryName', label: 'Beneficiary Name', required: true },
  { key: 'lotNumber', label: 'Lot Number', required: true },
  { key: 'barangayLocation', label: 'Barangay', required: true },
  { key: 'area', label: 'Area (sqm)', required: true },
  { key: 'status', label: 'Status', required: true },
  { key: 'dateIssued', label: 'Date Issued', required: false },
  { key: 'dateRegistered', label: 'Date Registered', required: false },
  { key: 'dateReceived', label: 'Date Received', required: false },
  { key: 'dateDistributed', label: 'Date Distributed', required: false },
  { key: 'notes', label: 'Notes', required: false },
  { key: 'municipality', label: 'Municipality', required: true, description: 'Matches by name' },
];

export function ImportData({ onCancel, onImportComplete, municipalities }: ImportDataProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileData, setFileData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        setHeaders(data[0] as string[]);
        setFileData(data.slice(1)); // Exclude header row
        
        // Auto-map fields with exact same names
        const autoMap: Record<string, string> = {};
        const fileHeaders = data[0] as string[];
        
        SYSTEM_FIELDS.forEach(field => {
          const match = fileHeaders.find(h => 
            h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.label.toLowerCase().replace(/[^a-z0-9]/g, '') ||
            h.toLowerCase() === field.key.toLowerCase()
          );
          if (match) {
            autoMap[field.key] = match;
          }
        });
        setMapping(autoMap);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const processData = () => {
    // Transform data based on mapping
    const processed = fileData.map((row, index) => {
      const item: any = {};
      
      // Basic fields
      Object.entries(mapping).forEach(([sysKey, fileHeader]) => {
        const headerIndex = headers.indexOf(fileHeader);
        if (headerIndex !== -1) {
          let value = row[headerIndex];
          
          // Data cleaning
          if (typeof value === 'string') {
            value = value.trim();
          }
          
          item[sysKey] = value;
        }
      });
      
      return item;
    });
    
    return processed.filter(item => 
      // Filter out empty rows where required fields are missing
      SYSTEM_FIELDS.filter(f => f.required).every(f => 
        item[f.key] !== undefined && item[f.key] !== null && item[f.key] !== ''
      )
    );
  };

  const handleImport = async () => {
    setImporting(true);
    const dataToImport = processData();
    
    try {
      const response = await apiFetch('/titles/batch', {
        method: 'POST',
        body: JSON.stringify({ titles: dataToImport }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setImportStats({
          success: result.successCount,
          failed: result.failedCount,
          errors: result.errors
        });
        setStep(3);
      } else {
        alert(`Import failed: ${result.error}`);
        setImporting(false);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to connect to server');
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Import Data Wizard
            </h2>
            <p className="text-sm text-gray-500">Migrate existing data from SharePoint or Excel</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'}`}>1</div>
              <span>Upload</span>
            </div>
            <div className={`w-16 h-0.5 mx-2 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'}`}>2</div>
              <span>Map Fields</span>
            </div>
            <div className={`w-16 h-0.5 mx-2 ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'}`}>3</div>
              <span>Results</span>
            </div>
          </div>

          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-emerald-50/30 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload your Excel or CSV file</h3>
              <p className="text-gray-500 mb-6 text-center max-w-sm">
                Supported formats: .xlsx, .xls, .csv. First row should contain column headers.
              </p>
              
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    handleFileChange(e);
                    if (e.target.files?.[0]) setStep(2);
                  }}
                />
                <span className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-shadow shadow-md flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Select File
                </span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Map the columns from your uploaded file (Right) to the system fields (Left). 
                  Required fields are marked with an asterisk (*).
                </p>
              </div>

              <div className="grid gap-4">
                {SYSTEM_FIELDS.map((field) => (
                  <div key={field.key} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="col-span-5">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{field.description}</p>
                      )}
                    </div>
                    
                    <div className="col-span-1 flex justify-center text-gray-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="col-span-6 relative">
                      <select
                        value={mapping[field.key] || ''}
                        onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white ${
                          !mapping[field.key] && field.required ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">-- Ignore / Skip --</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && importStats && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h3>
              <p className="text-gray-500 mb-8">Your data has been processed.</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <p className="text-sm text-emerald-600 font-medium uppercase tracking-wider">Success</p>
                  <p className="text-3xl font-bold text-emerald-700">{importStats.success}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <p className="text-sm text-red-600 font-medium uppercase tracking-wider">Failed</p>
                  <p className="text-3xl font-bold text-red-700">{importStats.failed}</p>
                </div>
              </div>

              {importStats.errors.length > 0 && (
                <div className="max-w-xl mx-auto text-left bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-hidden">
                  <h4 className="font-semibold text-gray-900 mb-2">Error Log</h4>
                  <div className="max-h-40 overflow-y-auto text-sm text-gray-600 space-y-1">
                    {importStats.errors.map((err, i) => (
                      <p key={i} className="font-mono text-xs">{err}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Back to Upload
            </button>
          )}
          
          <div className="flex gap-3 ml-auto">
            {step < 3 && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            
            {step === 2 && (
              <button
                onClick={handleImport}
                disabled={importing || SYSTEM_FIELDS.some(f => f.required && !mapping[f.key])}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-md flex items-center gap-2
                  ${importing || SYSTEM_FIELDS.some(f => f.required && !mapping[f.key]) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'}`}
              >
                {importing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Start Import <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={onImportComplete}
                className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-md"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
