import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Search } from 'lucide-react';
import { TitleForm, LandTitle } from './TitleForm';

interface TitlesListProps {
  municipalityId: string;
  municipalityName: string;
  onBack: () => void;
}

// Use relative path to ensure it works when accessed from any device on the network
const API_BASE_URL = '/api';

export function TitlesList({ municipalityId, municipalityName, onBack }: TitlesListProps) {
  const [titles, setTitles] = useState<LandTitle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState<LandTitle | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load titles from API
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/titles/${municipalityId}`);
        if (response.ok) {
          const data = await response.json();
          // Ensure backward compatibility: convert titleNumber to serialNumber
          const updatedData = data.map((t: any) => ({
            ...t,
            serialNumber: t.serialNumber || t.titleNumber || '',
          }));
          setTitles(updatedData);
        } else {
          console.error('Failed to fetch titles');
        }
      } catch (error) {
        console.error('Error fetching titles:', error);
      }
    };

    fetchTitles();
  }, [municipalityId]);

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

  const handleSubmit = async (data: LandTitle) => {
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
          setShowForm(false);
          setEditingTitle(undefined);
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
          setShowForm(false);
          setEditingTitle(undefined);
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
  const motherCloaCount = titles.filter(t => t.titleType === 'MOTHER_CLOA').length;
  const legacyCloaCount = titles.filter(t => t.titleType === 'TCT-CLOA').length;
  const legacyEpCount = titles.filter(t => t.titleType === 'TCT-EP').length;
  
  // Combine counts for stats display
  const totalCloaLike = splitCount + motherCloaCount + legacyCloaCount; 
  const releasedCount = titles.filter(t => t.status === 'released' || t.status === 'Released').length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-emerald-700">Land Titles - {municipalityName}</h1>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Titles</p>
            <p className="text-2xl text-emerald-700">{titles.length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
            <p className="text-sm text-blue-800 mb-1">SPLIT Titles</p>
            <p className="text-2xl text-blue-700">{splitCount}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
            <p className="text-sm text-amber-800 mb-1">Mother CLOA</p>
            <p className="text-2xl text-amber-700">{motherCloaCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Released</p>
            <p className="text-2xl text-emerald-700">{releasedCount}</p>
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
            <option value="MOTHER_CLOA">MOTHER CCLOA</option>
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
            <option value="released">Released</option>
            <option value="Pending">Pending (Legacy)</option>
            <option value="Processed">Processed (Legacy)</option>
          </select>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Add Title</span>
          </button>
        </div>

        {/* Titles Table */}
        {filteredTitles.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Serial Number</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Beneficiary</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Barangay/Location</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Lot Number</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Area (sqm)</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Date Issued</th>
                    <th className="px-4 py-3 text-right text-xs text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTitles.map(title => (
                    <tr key={title.id} className="hover:bg-emerald-50">
                      <td className="px-4 py-3 text-sm">{title.serialNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          title.titleType === 'MOTHER_CLOA' ? 'bg-purple-100 text-purple-800' :
                          title.titleType === 'SPLIT' ? 'bg-orange-100 text-orange-800' :
                          title.titleType === 'TCT-CLOA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {title.titleType}
                          {title.subtype && ` (${title.subtype})`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{title.beneficiaryName}</td>
                      <td className="px-4 py-3 text-sm">{title.barangayLocation}</td>
                      <td className="px-4 py-3 text-sm">{title.lotNumber}</td>
                      <td className="px-4 py-3 text-sm">{title.area.toFixed(4)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          title.status === 'Released' || title.status === 'released'
                            ? 'bg-green-100 text-emerald-800'
                            : title.status === 'Processed'
                            ? 'bg-yellow-100 text-yellow-800'
                            : title.status === 'on-hand'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {title.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{title.dateIssued || '-'}</td>
                      <td className="px-4 py-3 text-right">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No land titles found</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              Add First Title
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <TitleForm
          title={editingTitle}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}