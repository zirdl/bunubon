import { useState, useEffect, lazy } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Search } from 'lucide-react';
import { TitleForm, LandTitle } from './TitleForm';
import List from './VirtualList';

// Row component for virtualization
const TitlesListRow = ({ index, style, titles, onEdit, onDelete }: any) => {
  const title = titles[index];
  if (!title) return null;

  return (
    <div style={style} className="border-b border-gray-100 last:border-0">
      <table className="w-full table-fixed h-full">
        <tbody>
          <tr className="hover:bg-emerald-50 transition-colors h-full">
            <td className="w-[15%] px-4 py-3 text-sm font-medium truncate">{title.serialNumber}</td>
            <td className="w-[15%] px-4 py-3">
              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                title.titleType === 'Mother CCLOA' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                title.titleType === 'SPLIT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                title.titleType === 'TCT-CLOA' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                title.titleType === 'TCT-EP' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {title.titleType}
              </span>
            </td>
            <td className="w-[15%] px-4 py-3 text-sm truncate">{title.beneficiaryName}</td>
            <td className="w-[15%] px-4 py-3 text-sm truncate">{title.barangayLocation}</td>
            <td className="w-[10%] px-4 py-3 text-sm truncate">{title.lotNumber}</td>
            <td className="w-[10%] px-4 py-3 text-sm">{title.area.toFixed(2)}</td>
            <td className="w-[10%] px-4 py-3">
              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                title.status === 'Released' || title.status === 'released'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : title.status === 'Processed' || title.status === 'processing'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : title.status === 'on-hand' || title.status === 'Pending'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {title.status}
              </span>
            </td>
            <td className="w-[10%] px-4 py-3 text-right">
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => onEdit(title)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDelete(title.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

interface TitlesListProps {
  municipalityId: string;
  municipalityName: string;
  userRole: string;
  onBack: () => void;
}

// Use relative path to ensure it works when accessed from any device on the network
const API_BASE_URL = '/api';

export function TitlesList({ municipalityId, municipalityName, userRole, onBack }: TitlesListProps) {
  const [titles, setTitles] = useState<LandTitle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState<LandTitle | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 50;

  // Load titles from API
  const fetchTitles = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: searchQuery,
        status: filterStatus,
        type: filterType
      });

      const response = await fetch(`${API_BASE_URL}/titles/${municipalityId}?${queryParams}`);
      if (response.ok) {
        const result = await response.json();
        // Ensure backward compatibility: convert titleNumber to serialNumber
        const updatedData = result.data.map((t: any) => ({
          ...t,
          serialNumber: t.serialNumber || t.titleNumber || '',
        }));
        setTitles(updatedData);
        setTotalPages(result.pagination.totalPages);
        setTotalRecords(result.pagination.total);
      } else {
        console.error('Failed to fetch titles');
      }
    } catch (error) {
      console.error('Error fetching titles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTitles();
  }, [municipalityId, currentPage, searchQuery, filterStatus, filterType]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterType]);

  const handleCreate = () => {
    setEditingTitle(undefined);
    setShowForm(true);
  };

  const handleEdit = (title: LandTitle) => {
    setEditingTitle(title);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this land title?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/titles/${municipalityId}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state if successful
          setTitles(prev => prev.filter(t => t.id !== id));
        } else {
          console.error('Failed to delete title');
          alert('Failed to delete title');
        }
      } catch (error) {
        console.error('Error deleting title:', error);
        alert('Error deleting title');
      }
    }
  };

  const handleSubmit = async (data: LandTitle, stayOpen: boolean = false) => {
    try {
      if (editingTitle) {
        // Update existing title
        const response = await fetch(`${API_BASE_URL}/titles/${municipalityId}/${editingTitle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setTitles(prev => prev.map(t => (t.id === editingTitle.id ? { ...data, id: t.id } : t)));
          if (!stayOpen) {
            setShowForm(false);
            setEditingTitle(undefined);
          }
        } else {
          console.error('Failed to update title');
          alert('Failed to update title');
        }
      } else {
        // Create new title
        const newTitle = { ...data, id: Date.now().toString() };
        const response = await fetch(`${API_BASE_URL}/titles/${municipalityId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTitle),
        });

        if (response.ok) {
          const result = await response.json();
          // Update with the saved data
          setTitles(prev => [...prev, { ...newTitle, id: result.id }]);
          if (!stayOpen) {
            setShowForm(false);
            setEditingTitle(undefined);
          }
        } else {
          console.error('Failed to create title');
          alert('Failed to create title');
        }
      }
    } catch (error) {
      console.error('Error saving title:', error);
      alert('Error saving title');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTitle(undefined);
  };

  // Filter titles
  const filteredTitles = titles.filter(t => {
    const matchesSearch =
      t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.barangayLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || t.titleType === filterType;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const splitCount = titles.filter(t => t.titleType === 'SPLIT').length;
  const motherCloaCount = titles.filter(t => t.titleType === 'Mother CCLOA').length;
  
  const releasedCount = titles.filter(t => t.status === 'released' || t.status === 'Released').length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-[80%] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-emerald-700">Land Titles - {municipalityName}</h1>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Titles</p>
            <p className="text-2xl text-emerald-700 font-bold">{totalRecords}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
            <p className="text-sm text-amber-800 mb-1 font-medium">SPLIT Titles</p>
            <p className="text-2xl text-amber-700 font-bold">{splitCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
            <p className="text-sm text-purple-800 mb-1 font-medium">Mother CCLOA</p>
            <p className="text-2xl text-purple-700 font-bold">{motherCloaCount}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm">
            <p className="text-sm text-emerald-800 mb-1 font-medium">Released</p>
            <p className="text-2xl text-emerald-700 font-bold">{releasedCount}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by serial number, beneficiary, barangay, or lot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="SPLIT">SPLIT</option>
            <option value="Mother CCLOA">Mother CCLOA</option>
            <option value="TCT-CLOA">TCT-CLOA (Legacy)</option>
            <option value="TCT-EP">TCT-EP (Legacy)</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="on-hand">On-Hand</option>
            <option value="processing">Processing</option>
            <option value="released">Released</option>
          </select>
          {userRole !== 'Viewer' && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Add Title</span>
            </button>
          )}
        </div>

        {/* Titles Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading title records...</p>
          </div>
        ) : titles.length > 0 ? (
          <>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-emerald-50 border-b border-gray-200">
                    <tr>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-600">Serial Number</th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-600">Type</th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-600">Beneficiary</th>
                      <th className="w-[15%] px-4 py-3 text-left text-xs font-bold text-gray-600">Barangay</th>
                      <th className="w-[10%] px-4 py-3 text-left text-xs font-bold text-gray-600">Lot #</th>
                      <th className="w-[10%] px-4 py-3 text-left text-xs font-bold text-gray-600">Area</th>
                      <th className="w-[10%] px-4 py-3 text-left text-xs font-bold text-gray-600">Status</th>
                      {userRole !== 'Viewer' && <th className="w-[10%] px-4 py-3 text-right text-xs font-bold text-gray-600">Actions</th>}
                    </tr>
                  </thead>
                </table>

                <div className="max-h-[600px] overflow-y-auto">
                  {titles.map((title, index) => (
                    <div key={title.id || index} className="border-b border-gray-100 last:border-0">
                      <table className="w-full table-fixed h-full">
                        <tbody>
                          <tr className="hover:bg-emerald-50 transition-colors h-full">
                            <td className="w-[15%] px-4 py-3 text-sm font-medium truncate">{title.serialNumber}</td>
                            <td className="w-[15%] px-4 py-3">
                              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                title.titleType === 'Mother CCLOA' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                title.titleType === 'SPLIT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                title.titleType === 'TCT-CLOA' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                title.titleType === 'TCT-EP' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {title.titleType}
                              </span>
                            </td>
                            <td className="w-[15%] px-4 py-3 text-sm truncate">{title.beneficiaryName}</td>
                            <td className="w-[15%] px-4 py-3 text-sm truncate">{title.barangayLocation}</td>
                            <td className="w-[10%] px-4 py-3 text-sm truncate">{title.lotNumber}</td>
                            <td className="w-[10%] px-4 py-3 text-sm">{title.area.toFixed(2)}</td>
                            <td className="w-[10%] px-4 py-3">
                              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                title.status === 'Released' || title.status === 'released'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : title.status === 'Processed' || title.status === 'processing'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : title.status === 'on-hand' || title.status === 'Pending'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-800 border border-gray-200'
                              }`}>
                                {title.status}
                              </span>
                            </td>
                            {userRole !== 'Viewer' && (
                              <td className="w-[10%] px-4 py-3 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleEdit(title)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(title.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border border-gray-200 shadow-sm">
              {totalRecords > 0 && (
                <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-900">
                    {Math.min((currentPage - 1) * limit + 1, totalRecords)} - {Math.min(currentPage * limit, totalRecords)}
                  </span> of <span className="font-bold text-gray-900">{totalRecords}</span> records
                </div>
              )}
              {!totalRecords && (
                <div className="text-sm text-gray-500">
                  Showing <span className="font-bold text-gray-900">0</span> of <span className="font-bold text-gray-900">0</span> records
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 text-sm font-bold text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No land titles found</p>
            {userRole !== 'Viewer' && (
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
              >
                Add First Title
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <TitleForm
          title={editingTitle}
          municipalities={[]} // Municipalities not needed since default is set
          defaultMunicipality={{ id: municipalityId, name: municipalityName }}
          userRole={userRole}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}