import { Database, Download, Upload, AlertCircle } from 'lucide-react';

export function BackupRestore() {
  const handleBackup = () => {
    // Get all data from localStorage
    const municipalities = localStorage.getItem('dar_municipalities');
    const currentUser = localStorage.getItem('currentUser');
    
    // Collect all title data
    const allTitles: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('titles_')) {
        allTitles[key] = localStorage.getItem(key) || '';
      }
    }
    
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      municipalities,
      currentUser,
      titles: allTitles
    };
    
    // Create and download backup file
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dar_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    link.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        if (confirm('This will replace all current data. Are you sure you want to restore from backup?')) {
          // Restore data
          if (backupData.municipalities) {
            localStorage.setItem('dar_municipalities', backupData.municipalities);
          }
          if (backupData.titles) {
            Object.entries(backupData.titles).forEach(([key, value]) => {
              localStorage.setItem(key, value as string);
            });
          }
          
          alert('Data restored successfully! The page will reload.');
          window.location.reload();
        }
      } catch (error) {
        alert('Error reading backup file. Please make sure it is a valid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-emerald-800">Backup & Restore</h1>
          <p className="text-gray-600 mt-1">Manage data backups and restore points</p>
        </div>

        <div className="space-y-6">
          {/* Backup */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Create Backup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Download a complete backup of all municipality data and land titles. Store this file in a safe location.
                </p>
                <button
                  onClick={handleBackup}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-lg hover:from-emerald-800 hover:to-emerald-900 transition-colors shadow-md"
                >
                  <Database className="w-5 h-5" />
                  <span>Download Backup</span>
                </button>
              </div>
            </div>
          </div>

          {/* Restore */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">Restore from Backup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a previously created backup file to restore all data. This will replace current data.
                </p>
                <label className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors shadow-md cursor-pointer inline-flex">
                  <Upload className="w-5 h-5" />
                  <span>Upload Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-yellow-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Always create a backup before making major changes</li>
                  <li>Store backup files in a secure location</li>
                  <li>Restoring from backup will replace all current data</li>
                  <li>Backup files are date-stamped for easy identification</li>
                  <li>Regular backups are recommended (daily or weekly)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
