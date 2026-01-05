import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';

export interface LandTitle {
  id: string;
  serialNumber: string;
  titleType: 'SPLIT' | 'MOTHER_CLOA' | string; // keeping string for backward compatibility
  subtype?: 'TCT' | 'CLOA' | string;
  beneficiaryName: string;
  lotNumber: string;
  barangayLocation: string;
  area: number;
  status: 'on-hand' | 'released' | string;
  dateIssued: string;
  dateRegistered?: string;
  dateReceived?: string;
  dateDistributed?: string;
  notes: string;
}

interface TitleFormProps {
  title?: LandTitle;
  onSubmit: (data: LandTitle) => void;
  onCancel: () => void;
}

export function TitleForm({ title, onSubmit, onCancel }: TitleFormProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<LandTitle>(
    title || {
      id: '',
      serialNumber: '',
      titleType: '',
      subtype: '',
      beneficiaryName: '',
      lotNumber: '',
      barangayLocation: '',
      area: 0,
      status: 'on-hand',
      dateIssued: '',
      dateRegistered: '',
      dateReceived: '',
      dateDistributed: '',
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

    if (formData.titleType === 'MOTHER_CLOA' && !formData.subtype) {
      alert('Please select a subtype for Mother CLOA');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 overscroll-contain">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="sticky top-0 bg-emerald-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
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

                                    <div className="relative">
                                      <label className="block mb-2 text-gray-700 relative">
                                        Title Type
                                        {formData.titleType === '' && (
                                          <span className="absolute -top-1 -right-1 text-red-500 text-lg">*</span>
                                        )}
                                      </label>
                                      
                                      {/* Custom Dropdown Trigger */}
                                      <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 flex items-center justify-between bg-white ${
                                          formData.titleType === ''
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-emerald-500'
                                        }`}
                                      >
                                        <span className={formData.titleType ? 'text-gray-900' : 'text-gray-500'}>
                                          {formData.titleType === 'SPLIT' ? 'SPLIT' :
                                           formData.titleType === 'MOTHER_CLOA' ? `MOTHER CCLOA (${formData.subtype})` :
                                           formData.titleType === 'TCT-CLOA' ? 'TCT-CLOA (Legacy)' :
                                           formData.titleType === 'TCT-EP' ? 'TCT-EP (Legacy)' :
                                           'Select Type'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                      </button>
                        
                                      {/* Dropdown Menu */}
                                      {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                          <ul className="py-1">
                                            {/* SPLIT Option */}
                                            <li>
                                              <button
                                                type="button"
                                                className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700"
                                                onClick={() => {
                                                  setFormData({ ...formData, titleType: 'SPLIT', subtype: '' });
                                                  setIsDropdownOpen(false);
                                                }}
                                              >
                                                SPLIT
                                              </button>
                                            </li>
                        
                                            {/* MOTHER CCLOA with Hover Submenu */}
                                            <li className="relative group">
                                                                    <button
                                                                      type="button"
                                                                      className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700 flex items-center justify-between"
                                                                    >
                                                                      <span>MOTHER CCLOA</span>
                                                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                                                    </button>
                                                                    
                                                                    {/* Submenu - Opens to the left to prevent overflow */}
                                                                    <div className="absolute right-full top-0 mr-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-50">
                                                                      <ul className="py-1">
                                                                        <li>
                                                                          <button
                                                                            type="button"
                                                                            className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700"
                                                                            onClick={() => {
                                                                              setFormData({ ...formData, titleType: 'MOTHER_CLOA', subtype: 'TCT' });
                                                                              setIsDropdownOpen(false);
                                                                            }}
                                                                          >
                                                                            TCT
                                                                          </button>
                                                                        </li>
                                                                        <li>
                                                                          <button
                                                                            type="button"
                                                                            className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700"
                                                                            onClick={() => {
                                                                              setFormData({ ...formData, titleType: 'MOTHER_CLOA', subtype: 'CLOA' });
                                                                              setIsDropdownOpen(false);
                                                                            }}
                                                                          >
                                                                            CLOA
                                                                          </button>
                                                                        </li>
                                                                      </ul>
                                                                    </div>                                            </li>
                        
                                            <div className="border-t border-gray-100 my-1"></div>
                                            
                                            {/* Legacy Options */}
                                            <li>
                                              <button
                                                type="button"
                                                className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-500 text-sm"
                                                onClick={() => {
                                                  setFormData({ ...formData, titleType: 'TCT-CLOA', subtype: '' });
                                                  setIsDropdownOpen(false);
                                                }}
                                              >
                                                TCT-CLOA (Legacy)
                                              </button>
                                            </li>
                                            <li>
                                              <button
                                                type="button"
                                                className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-500 text-sm"
                                                onClick={() => {
                                                  setFormData({ ...formData, titleType: 'TCT-EP', subtype: '' });
                                                  setIsDropdownOpen(false);
                                                }}
                                              >
                                                TCT-EP (Legacy)
                                              </button>
                                            </li>
                                          </ul>
                                        </div>
                                      )}
                                    </div>            
                        <div className="md:col-span-2">
                          <label className="block mb-2 text-gray-700 relative">
                            Beneficiary Name                {formData.beneficiaryName === '' && (
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
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'on-hand' })}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all font-medium ${
                    formData.status === 'on-hand'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                  }`}
                >
                  On-Hand
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'released' })}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all font-medium ${
                    formData.status === 'released' || formData.status === 'Released'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-200'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50'
                  }`}
                >
                  Released
                </button>
              </div>
              
              {/* Legacy Status Indicator */}
              {['Pending', 'Processed'].includes(formData.status) && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                  Current Status: {formData.status} (Legacy) - Please update
                </div>
              )}
            </div>

            {/* Common Date Issued - Hidden for SPLIT */}
            {formData.titleType !== 'SPLIT' && (
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
            )}

            {/* SPLIT Specific Dates */}
            {formData.titleType === 'SPLIT' && (
              <>
                <div>
                  <label className="block mb-2 text-gray-700">
                    Date Registered
                  </label>
                  <input
                    type="date"
                    value={formData.dateRegistered || ''}
                    onChange={(e) => setFormData({ ...formData, dateRegistered: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">
                    Date Received from ROD
                  </label>
                  <input
                    type="date"
                    value={formData.dateReceived || ''}
                    onChange={(e) => setFormData({ ...formData, dateReceived: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">
                    Date Distributed
                  </label>
                  <input
                    type="date"
                    value={formData.dateDistributed || ''}
                    onChange={(e) => setFormData({ ...formData, dateDistributed: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

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
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-lg hover:from-emerald-800 hover:to-emerald-900 transition-colors shadow-md"
            >
              {title ? 'Update Title' : 'Add Title'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}