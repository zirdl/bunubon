import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface LandTitle {
  id: string;
  serialNumber: string;
  titleType: 'TCT-CLOA' | 'TCT-EP';
  beneficiaryName: string;
  lotNumber: string;
  barangayLocation: string; // Added barangay/location field
  area: number;
  status: 'Pending' | 'Processed' | 'Released';
  dateIssued: string;
  notes: string;
}

interface TitleFormProps {
  title?: LandTitle;
  onSubmit: (data: LandTitle) => void;
  onCancel: () => void;
}

export function TitleForm({ title, onSubmit, onCancel }: TitleFormProps) {
  const [formData, setFormData] = useState<LandTitle>(
    title || {
      id: '',
      serialNumber: '',
      titleType: '',
      beneficiaryName: '',
      lotNumber: '',
      barangayLocation: '', // Added barangay/location field
      area: 0,
      status: '',
      dateIssued: '',
      notes: '',
    }
  );

  useEffect(() => {
    if (title) {
      setFormData(title);
    }
  }, [title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.serialNumber || !formData.titleType || !formData.beneficiaryName ||
        !formData.lotNumber || !formData.barangayLocation || formData.area <= 0 || !formData.status) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 overscroll-contain">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-white">{title ? 'Edit Land Title' : 'Add New Land Title'}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 relative">
                Serial Number
                {formData.serialNumber === '' && (
                  <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                )}
              </label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formData.serialNumber === ''
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="e.g., TCT-123456"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 relative">
                Title Type
                {formData.titleType === '' && (
                  <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                )}
              </label>
              <select
                value={formData.titleType}
                onChange={(e) => setFormData({ ...formData, titleType: e.target.value as 'TCT-CLOA' | 'TCT-EP' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formData.titleType === ''
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
              >
                <option value="">Select Type</option>
                <option value="TCT-CLOA">TCT-CLOA</option>
                <option value="TCT-EP">TCT-EP</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700 relative">
                Beneficiary Name
                {formData.beneficiaryName === '' && (
                  <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                )}
              </label>
              <input
                type="text"
                required
                value={formData.beneficiaryName}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow capital letters and some common characters
                  const capitalValue = value.replace(/[^A-Z\s\-\.\'\,]/g, '').toUpperCase();
                  setFormData({ ...formData, beneficiaryName: capitalValue });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formData.beneficiaryName === ''
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="Enter beneficiary name (CAPITAL LETTERS ONLY)"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 relative">
                Lot Number
                {formData.lotNumber === '' && (
                  <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                )}
              </label>
              <input
                type="text"
                required
                value={formData.lotNumber}
                onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formData.lotNumber === ''
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="e.g., Lot 123"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 relative">
                Barangay/Location
                {formData.barangayLocation === '' && (
                  <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                )}
              </label>
              <input
                type="text"
                required
                value={formData.barangayLocation}
                onChange={(e) => setFormData({ ...formData, barangayLocation: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formData.barangayLocation === ''
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="e.g., San Juan, Agoo"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 relative">
                Area (square meters)
                {formData.area === 0 && (
                  <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                )}
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formData.area === 0
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
                placeholder="e.g., 1000"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 relative">
                Status
                {formData.status === '' && (
                  <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                )}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pending' | 'Processed' | 'Released' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formData.status === ''
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-emerald-500'
                }`}
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Processed">Processed</option>
                <option value="Released">Released</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-gray-700">
                Date Issued
              </label>
              <input
                type="date"
                value={formData.dateIssued}
                onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 text-gray-700">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Enter any additional notes"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors shadow-md"
            >
              {title ? 'Update Title' : 'Add Title'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
