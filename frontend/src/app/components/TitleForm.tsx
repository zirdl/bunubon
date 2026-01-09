import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { laUnionLocations } from '../data/laUnionLocations';

export interface LandTitle {
  id: string;
  serialNumber: string;
  titleType: 'SPLIT' | 'Mother CCLOA' | string;
  subtype?: 'TCT' | 'CLOA' | string;
  beneficiaryName: string;
  lotNumber: string;
  barangayLocation: string;
  area: number;
  status: 'on-hand' | 'processing' | 'released' | string;
  dateIssued: string;
  dateRegistered?: string;
  dateReceived?: string;
  dateDistributed?: string;
  notes: string;
  municipality?: string; // Add municipality name for the form
}

interface TitleFormProps {
  title?: LandTitle;
  municipalities?: { id: string; name: string }[]; // List of available municipalities
  defaultMunicipality?: { id: string; name: string }; // Default municipality when accessed from municipal page
  userRole?: string;
  onSubmit: (data: LandTitle, stayOpen?: boolean) => void;
  onCancel: () => void;
}

export function TitleForm({ title, municipalities = [], defaultMunicipality, userRole, onSubmit, onCancel }: TitleFormProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [barangayOptions, setBarangayOptions] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<LandTitle>(() => {
    const initialData = title || {
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
      municipality: '',
    };

    // Only set municipality if it's not already set and we have a default
    if (!initialData.municipality && defaultMunicipality) {
      initialData.municipality = defaultMunicipality.name;
    }

    return initialData;
  });

  useEffect(() => {
    if (title) {
      setFormData(title);
      // Try to infer municipality if provided in title
      if (title.municipality) {
        setSelectedMunicipality(title.municipality);
      }
    } else if (defaultMunicipality) {
      // Set default municipality if provided and not editing an existing title
      setSelectedMunicipality(defaultMunicipality.name);
    }
  }, [title, defaultMunicipality]);

  // Update barangay options when municipality changes
  useEffect(() => {
    if (selectedMunicipality && laUnionLocations[selectedMunicipality]) {
      setBarangayOptions(laUnionLocations[selectedMunicipality].sort());
    } else {
      setBarangayOptions([]);
    }
  }, [selectedMunicipality]);

  const handleFormSubmit = (e: React.FormEvent, stayOpen: boolean = false) => {
    e.preventDefault();

    // Validation
    if (!formData.serialNumber || !formData.titleType || !formData.beneficiaryName ||
        !formData.lotNumber || !formData.barangayLocation || formData.area <= 0 || !formData.status ||
        (!selectedMunicipality && !defaultMunicipality)) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.titleType === 'Mother CCLOA' && !formData.subtype) {
      alert('Please select a subtype for Mother CCLOA');
      return;
    }

    const dataToSubmit = {
      ...formData,
      municipality: selectedMunicipality || defaultMunicipality?.name || formData.municipality
    };

    onSubmit(dataToSubmit, stayOpen);
    
    if (stayOpen) {
      // Reset form for next entry but keep some fields for convenience
      setFormData({
        ...formData,
        id: '',
        serialNumber: '',
        beneficiaryName: '',
        lotNumber: '',
        area: 0,
        // Keep titleType, subtype, status, dates, municipality as they might be similar for next entry
      });
      // Municipality and Barangay selection remains
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 overscroll-contain">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain border border-gray-100">
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 z-20 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title ? 'Edit Land Title' : 'Add New Land Title'}</h2>
            <p className="text-sm text-gray-500">Enter the details of the land title record</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleFormSubmit(e)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sequence Number */}
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Sequence Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={formData.serialNumber}
                onChange={(e) => userRole !== 'Viewer' ? setFormData({ ...formData, serialNumber: e.target.value }) : undefined}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                placeholder="e.g., TCT-123456"
                disabled={userRole === 'Viewer'}
              />
            </div>

            {/* Title Type */}
            <div className="relative">
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Title Type <span className="text-red-500">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => userRole !== 'Viewer' ? setIsDropdownOpen(!isDropdownOpen) : undefined}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm flex items-center justify-between text-left"
                disabled={userRole === 'Viewer'}
              >
                <span className={formData.titleType ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.titleType === 'SPLIT' ? 'SPLIT' :
                    formData.titleType === 'Mother CCLOA' ? `Mother CCLOA (${formData.subtype})` :
                    formData.titleType === 'TCT-CLOA' ? 'TCT-CLOA (Legacy)' :
                    formData.titleType === 'TCT-EP' ? 'TCT-EP (Legacy)' :
                    'Select Type'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 ${userRole === 'Viewer' ? 'opacity-50' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                  <ul>
                    <li>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700 text-sm"
                        onClick={() => {
                          setFormData({ ...formData, titleType: 'SPLIT', subtype: '' });
                          setIsDropdownOpen(false);
                        }}
                      >
                        SPLIT
                      </button>
                    </li>
                    <li className="relative group">
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700 flex items-center justify-between text-sm"
                      >
                        <span>Mother CCLOA</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <div className="absolute right-full top-0 mr-1 w-32 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50">
                        <ul className="py-1">
                          <li>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700 text-sm"
                              onClick={() => {
                                setFormData({ ...formData, titleType: 'Mother CCLOA', subtype: 'TCT' });
                                setIsDropdownOpen(false);
                              }}
                            >
                              TCT
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700 text-sm"
                              onClick={() => {
                                setFormData({ ...formData, titleType: 'Mother CCLOA', subtype: 'CLOA' });
                                setIsDropdownOpen(false);
                              }}
                            >
                              CLOA
                            </button>
                          </li>
                        </ul>
                      </div>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700 text-sm"
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
                        className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-gray-700 text-sm"
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

            {/* Municipality Dropdown */}
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Municipality <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedMunicipality}
                onChange={(e) => {
                  if (userRole !== 'Viewer') {
                    setSelectedMunicipality(e.target.value);
                    setFormData({ ...formData, barangayLocation: '' }); // Reset barangay on municipality change
                  }
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm appearance-none"
                disabled={!!title || !!defaultMunicipality || userRole === 'Viewer'} // Disable if editing existing, default municipality is provided, or user is a viewer
              >
                {defaultMunicipality ? (
                  <option value={defaultMunicipality.name}>{defaultMunicipality.name}</option>
                ) : (
                  <>
                    <option value="" disabled>Select Municipality</option>
                    {municipalities.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Barangay Dropdown */}
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Barangay <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.barangayLocation}
                onChange={(e) => userRole !== 'Viewer' ? setFormData({ ...formData, barangayLocation: e.target.value }) : undefined}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm appearance-none"
                disabled={!selectedMunicipality || userRole === 'Viewer'}
              >
                <option value="" disabled>Select Barangay</option>
                {barangayOptions.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Beneficiary Name */}
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Beneficiary Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={formData.beneficiaryName}
                onChange={(e) => {
                  if (userRole !== 'Viewer') {
                    const value = e.target.value;
                    const capitalValue = value.replace(/[^A-Z\s\-\.\'\,]/gi, '').toUpperCase();
                    setFormData({ ...formData, beneficiaryName: capitalValue });
                  }
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                placeholder="Enter beneficiary name (CAPITAL LETTERS ONLY)"
                disabled={userRole === 'Viewer'}
              />
            </div>

            {/* Lot Number */}
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Lot Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={30}
                value={formData.lotNumber}
                onChange={(e) => {
                  if (userRole !== 'Viewer') {
                    const val = e.target.value.toUpperCase();
                    const cleanVal = val.replace(/[^A-Z0-9\-\.\s]/g, '');
                    setFormData({ ...formData, lotNumber: cleanVal });
                  }
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                placeholder="e.g., LOT-123.A"
                disabled={userRole === 'Viewer'}
              />
            </div>

            {/* Area */}
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Area (sqm) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.area === 0 ? '' : formData.area}
                onChange={(e) => {
                  if (userRole !== 'Viewer') {
                    const val = e.target.value;

                    // Use regex to allow only numbers and a single decimal point
                    const cleanVal = val.replace(/[^0-9.]/g, '');

                    // Prevent multiple decimal points
                    const parts = cleanVal.split('.');
                    if (parts.length > 2) return;

                    if (cleanVal === '') {
                      setFormData({ ...formData, area: 0 });
                      return;
                    }

                    // Limit to 2 decimal places
                    if (parts[1] && parts[1].length > 2) return;

                    setFormData({ ...formData, area: cleanVal as any });
                  }
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                placeholder="e.g., 1000.00"
                disabled={userRole === 'Viewer'}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 h-[42px]">
                {['on-hand', 'processing', 'released'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => userRole !== 'Viewer' ? setFormData({ ...formData, status }) : undefined}
                    className={`flex-1 px-2 rounded-md transition-all font-semibold text-[10px] uppercase tracking-wider ${
                      formData.status === status
                        ? status === 'released' ? 'bg-emerald-600 text-white shadow-sm' :
                          status === 'processing' ? 'bg-amber-500 text-white shadow-sm' :
                          'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    disabled={userRole === 'Viewer'}
                  >
                    {status === 'on-hand' ? 'On-Hand' : status === 'processing' ? 'Processing' : 'Released'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates based on Type */}
            {formData.titleType !== 'SPLIT' ? (
              <div>
                <label className="block mb-1.5 text-sm font-semibold text-gray-700">Date Issued</label>
                <input
                  type="date"
                  value={formData.dateIssued}
                  onChange={(e) => userRole !== 'Viewer' ? setFormData({ ...formData, dateIssued: e.target.value }) : undefined}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                  disabled={userRole === 'Viewer'}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">Date Registered</label>
                  <input
                    type="date"
                    value={formData.dateRegistered || ''}
                    onChange={(e) => userRole !== 'Viewer' ? setFormData({ ...formData, dateRegistered: e.target.value }) : undefined}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                    disabled={userRole === 'Viewer'}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">Date Received</label>
                  <input
                    type="date"
                    value={formData.dateReceived || ''}
                    onChange={(e) => userRole !== 'Viewer' ? setFormData({ ...formData, dateReceived: e.target.value }) : undefined}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                    disabled={userRole === 'Viewer'}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">Date Distributed</label>
                  <input
                    type="date"
                    value={formData.dateDistributed || ''}
                    onChange={(e) => userRole !== 'Viewer' ? setFormData({ ...formData, dateDistributed: e.target.value }) : undefined}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                    disabled={userRole === 'Viewer'}
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-sm font-semibold text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                maxLength={200}
                onChange={(e) => userRole !== 'Viewer' ? setFormData({ ...formData, notes: e.target.value }) : undefined}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                rows={3}
                placeholder="Enter any additional notes..."
                disabled={userRole === 'Viewer'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            {!title && (
              <button
                type="button"
                onClick={(e) => handleFormSubmit(e, true)}
                className="px-5 py-2.5 text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-sm"
                disabled={userRole === 'Viewer'}
              >
                Save & Add Another
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm"
              disabled={userRole === 'Viewer'}
            >
              {title ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}