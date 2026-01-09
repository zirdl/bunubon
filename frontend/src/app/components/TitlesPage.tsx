import { useState, useEffect, lazy } from 'react';
import { Search, FileText, MapPin, ListFilter, Trash2, Edit2, Plus, Building2 } from 'lucide-react';
import { MunicipalityCard } from './MunicipalityCard';
import { MunicipalityForm, MunicipalityData } from './MunicipalityForm';
import { TitleForm, LandTitle } from './TitleForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import List from './VirtualList';

interface MunicipalitiesPageProps {
  userRole: string;
  onViewTitles: (municipalityId: string, municipalityName: string) => void;
}

// Row component for virtualization

// Use relative path to ensure it works when accessed from any device on the network
const API_BASE_URL = '/api';

// The 20 municipalities of La Union with land title tracking
const initialMunicipalities: MunicipalityData[] = [
  {
    id: '1',
    name: 'Agoo',
    tctCloaTotal: 520,
    tctCloaProcessed: 310,
    tctEpTotal: 400,
    tctEpProcessed: 220,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: 'Large agricultural area - ongoing collection',
    district: 1,
    isPredefined: true,
  },
  {
    id: '2',
    name: 'Aringay',
    tctCloaTotal: 280,
    tctCloaProcessed: 195,
    tctEpTotal: 210,
    tctEpProcessed: 145,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 1,
    isPredefined: true,
  },
  {
    id: '3',
    name: 'Bacnotan',
    tctCloaTotal: 310,
    tctCloaProcessed: 240,
    tctEpTotal: 265,
    tctEpProcessed: 200,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '4',
    name: 'Bagulin',
    tctCloaTotal: 190,
    tctCloaProcessed: 85,
    tctEpTotal: 150,
    tctEpProcessed: 60,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: false },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: 'Mountainous area - accessibility challenges',
    district: 2,
    isPredefined: true,
  },
  {
    id: '5',
    name: 'Balaoan',
    tctCloaTotal: 295,
    tctCloaProcessed: 210,
    tctEpTotal: 230,
    tctEpProcessed: 165,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '6',
    name: 'Bangar',
    tctCloaTotal: 325,
    tctCloaProcessed: 260,
    tctEpTotal: 275,
    tctEpProcessed: 215,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '7',
    name: 'Bauang',
    tctCloaTotal: 380,
    tctCloaProcessed: 290,
    tctEpTotal: 250,
    tctEpProcessed: 180,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: 'Ongoing verification for remaining titles',
    district: 2,
    isPredefined: true,
  },
  {
    id: '8',
    name: 'Burgos',
    tctCloaTotal: 165,
    tctCloaProcessed: 120,
    tctEpTotal: 140,
    tctEpProcessed: 95,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '9',
    name: 'Caba',
    tctCloaTotal: 245,
    tctCloaProcessed: 180,
    tctEpTotal: 200,
    tctEpProcessed: 155,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '10',
    name: 'Luna',
    tctCloaTotal: 410,
    tctCloaProcessed: 335,
    tctEpTotal: 340,
    tctEpProcessed: 275,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '11',
    name: 'Naguilian',
    tctCloaTotal: 340,
    tctCloaProcessed: 180,
    tctEpTotal: 280,
    tctEpProcessed: 140,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: 'Agricultural municipality - medium priority',
    district: 1,
    isPredefined: true,
  },
  {
    id: '12',
    name: 'Pugo',
    tctCloaTotal: 215,
    tctCloaProcessed: 95,
    tctEpTotal: 175,
    tctEpProcessed: 70,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: false },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: 'Upland area - ongoing data collection',
    district: 2,
    isPredefined: true,
  },
  {
    id: '13',
    name: 'Rosario',
    tctCloaTotal: 360,
    tctCloaProcessed: 310,
    tctEpTotal: 290,
    tctEpProcessed: 245,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: true },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '14',
    name: 'San Gabriel',
    tctCloaTotal: 185,
    tctCloaProcessed: 130,
    tctEpTotal: 155,
    tctEpProcessed: 100,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 1,
    isPredefined: true,
  },
  {
    id: '15',
    name: 'San Juan',
    tctCloaTotal: 220,
    tctCloaProcessed: 210,
    tctEpTotal: 180,
    tctEpProcessed: 170,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: true },
    ],
    notes: 'Near completion',
    district: 1,
    isPredefined: true,
  },
  {
    id: '16',
    name: 'Santol',
    tctCloaTotal: 270,
    tctCloaProcessed: 195,
    tctEpTotal: 225,
    tctEpProcessed: 160,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 1,
    isPredefined: true,
  },
  {
    id: '17',
    name: 'Santo Tomas',
    tctCloaTotal: 390,
    tctCloaProcessed: 285,
    tctEpTotal: 310,
    tctEpProcessed: 230,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 1,
    isPredefined: true,
  },
  {
    id: '18',
    name: 'Sudipen',
    tctCloaTotal: 305,
    tctCloaProcessed: 220,
    tctEpTotal: 255,
    tctEpProcessed: 180,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 1,
    isPredefined: true,
  },
  {
    id: '19',
    name: 'Tubao',
    tctCloaTotal: 330,
    tctCloaProcessed: 265,
    tctEpTotal: 270,
    tctEpProcessed: 210,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: false },
    ],
    notes: '',
    district: 2,
    isPredefined: true,
  },
  {
    id: '20',
    name: 'San Fernando',
    tctCloaTotal: 450,
    tctCloaProcessed: 420,
    tctEpTotal: 320,
    tctEpProcessed: 280,
    status: 'active',
    checkpoints: [
      { id: '1', label: 'Initial Documentation Completed', completed: true },
      { id: '2', label: 'Final Processing & Release', completed: true },
    ],
    notes: 'Capital city - Priority processing area',
    district: 1,
    isPredefined: true,
  },
];

export function TitlesPage({ userRole, onViewTitles }: MunicipalitiesPageProps) {
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [allTitles, setAllTitles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMunicipality, setEditingMunicipality] = useState<MunicipalityData | undefined>();
  const [showTitleForm, setShowTitleForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState<'all' | 1 | 2>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const [selectedMuniForTitle, setSelectedMuniForTitle] = useState<{id: string, name: string} | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 50;

  // Load data from API on mount
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/municipalities`);
        if (response.ok) {
          const data = await response.json();
          // Ensure district field exists for all municipalities
          const updatedData = data.map((m: any) => ({
            ...m,
            district: m.district !== undefined ? m.district : 1, // Default to district 1 if not present
          }));
          setMunicipalities(updatedData);
        } else {
          console.error('Failed to fetch municipalities');
          setMunicipalities(initialMunicipalities);
        }
      } catch (error) {
        console.error('Error fetching municipalities:', error);
        setMunicipalities(initialMunicipalities);
      }
    };

    fetchMunicipalities();
  }, []);

  // Fetch paginated titles for global search
  const fetchPaginatedTitles = async () => {
    setIsLoadingTitles(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        search: globalSearchQuery,
        status: filterStatus,
        type: filterType
      });

      const response = await fetch(`${API_BASE_URL}/titles?${queryParams}`);
      if (response.ok) {
        const result = await response.json();
        setAllTitles(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalRecords(result.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching titles:', error);
    } finally {
      setIsLoadingTitles(false);
    }
  };

  // Trigger fetch when filters or page change
  useEffect(() => {
    fetchPaginatedTitles();
  }, [currentPage, filterStatus, filterType, globalSearchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterType, globalSearchQuery]);

  const handleEdit = (municipality: MunicipalityData) => {
    setEditingMunicipality(municipality);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this municipality record?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/municipalities/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMunicipalities(prev => prev.filter(m => m.id !== id));
        } else {
          console.error('Failed to delete municipality');
          alert('Failed to delete municipality');
        }
      } catch (error) {
        console.error('Error deleting municipality:', error);
        alert('Error deleting municipality');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMunicipality(undefined);
  };

  const handleSubmit = async (data: MunicipalityData) => {
    try {
      if (editingMunicipality) {
        // Update existing
        const response = await fetch(`${API_BASE_URL}/municipalities/${editingMunicipality.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setMunicipalities(prev =>
            prev.map(m => (m.id === editingMunicipality.id ? { ...data, id: m.id } : m))
          );
          setShowForm(false);
          setEditingMunicipality(undefined);
        } else {
          console.error('Failed to update municipality');
          alert('Failed to update municipality');
        }
      } else {
        // Create new
        const newMunicipality = {
          ...data,
          id: Date.now().toString(),
        };
        const response = await fetch(`${API_BASE_URL}/municipalities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMunicipality),
        });

        if (response.ok) {
          const result = await response.json();
          // Update with the saved data
          setMunicipalities(prev => [...prev, { ...newMunicipality, id: result.id }]);
          setShowForm(false);
          setEditingMunicipality(undefined);
        } else {
          console.error('Failed to create municipality');
          alert('Failed to create municipality');
        }
      }
    } catch (error) {
      console.error('Error saving municipality:', error);
      alert('Error saving municipality');
    }
  };

  const handleTitleSubmit = async (data: LandTitle, stayOpen: boolean = false) => {
    let muniId = selectedMuniForTitle?.id;
    let muniName = selectedMuniForTitle?.name;

    // If not already selected (e.g. from global search), find it by name from form data
    if (!muniId && data.municipality) {
      const muni = municipalities.find(m => m.name === data.municipality);
      if (muni) {
        muniId = muni.id;
        muniName = muni.name;
      }
    }

    if (!muniId) {
      alert('Please select a valid municipality');
      return;
    }

    try {
      const newTitle = { ...data, id: Date.now().toString() };
      const response = await fetch(`${API_BASE_URL}/titles/${muniId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTitle),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh titles data
        const savedTitle = { 
          ...newTitle, 
          id: result.id || newTitle.id, 
          municipalityId: muniId, 
          municipalityName: muniName 
        };
        setAllTitles(prev => [...prev, savedTitle]);
        
        if (!stayOpen) {
          setShowTitleForm(false);
          setSelectedMuniForTitle(null);
        }
      } else {
        console.error('Failed to create title');
        alert('Failed to create title');
      }
    } catch (error) {
      console.error('Error saving title:', error);
      alert('Error saving title');
    }
  };

  // Filter municipalities
  const filteredMunicipalities = municipalities
    .filter(m => {
      const districtMatch = filterDistrict === 'all' || m.district === filterDistrict;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return districtMatch && matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 overflow-auto bg-emerald-50/30">
      <div className="max-w-[85%] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Land Title Management</h1>
          <p className="text-gray-600 mt-1">Manage municipalities and track individual land title records</p>
        </div>

        <Tabs defaultValue="global-search" className="w-full">
          <TabsList className="bg-white border border-gray-200 mb-6 p-1 h-12">
            <TabsTrigger value="global-search" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6 font-bold">
              <Search className="w-4 h-4 mr-2" />
              Global Search
            </TabsTrigger>
            <TabsTrigger value="municipalities" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6 font-bold">
              <MapPin className="w-4 h-4 mr-2" />
              By Municipality
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global-search" className="mt-0">
            {/* Global Search Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by serial #, beneficiary, or municipality..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="SPLIT">SPLIT</option>
                  <option value="Mother CCLOA">Mother CCLOA</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="on-hand">On-Hand</option>
                  <option value="processing">Processing</option>
                  <option value="released">Released</option>
                </select>
                
                {!userRole || userRole !== 'Viewer' ? (
                  <button
                    onClick={() => setShowTitleForm(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors shadow-md text-sm font-bold whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Title
                  </button>
                ) : null}
              </div>
            </div>

            {/* Titles Table */}
            {isLoadingTitles ? (
              <div className="bg-white rounded-xl border border-gray-200 p-20 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading title records...</p>
              </div>
                        ) : allTitles.length > 0 ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="w-[15%] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Serial Number</th>
                          <th className="w-[15%] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Municipality</th>
                          <th className="w-[15%] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="w-[20%] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Beneficiary</th>
                          <th className="w-[10%] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Area (sqm)</th>
                          <th className="w-[15%] px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="w-[10%] px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                    </table>
                    
                    <div className="max-h-[600px] overflow-y-auto">
                      {allTitles.map((title, index) => (
                        <div key={title.id || index} className="border-b border-gray-100 last:border-0">
                          <table className="w-full table-fixed h-full">
                            <tbody>
                              <tr className="hover:bg-emerald-50/50 transition-colors h-full">
                                <td className="w-[15%] px-6 py-4 text-sm font-bold text-gray-900 truncate">{title.serialNumber}</td>
                                <td className="w-[15%] px-6 py-4 text-sm text-gray-600 truncate">{title.municipalityName}</td>
                                <td className="w-[15%] px-6 py-4 text-sm">
                                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    title.titleType === 'SPLIT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {title.titleType}
                                  </span>
                                </td>
                                <td className="w-[20%] px-6 py-4 text-sm text-gray-700 truncate">{title.beneficiaryName}</td>
                                <td className="w-[10%] px-6 py-4 text-sm text-gray-700">{Number(title.area || 0).toFixed(2)}</td>
                                <td className="w-[15%] px-6 py-4">
                                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    title.status === 'released' ? 'bg-emerald-600 text-white' :
                                    title.status === 'processing' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                                  }`}>
                                    {title.status}
                                  </span>
                                </td>
                                <td className="w-[10%] px-6 py-4 text-right">
                                  <button
                                    onClick={() => onViewTitles(title.municipality_id, title.municipalityName)}
                                    className="text-xs font-bold text-emerald-700 hover:underline"
                                  >
                                    Go to Details
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200 shadow-sm">
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
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No titles match your search</h3>
                <p className="text-gray-500">Try different keywords or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="municipalities" className="mt-0">
            {/* Municipality Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search municipalities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value === 'all' ? 'all' : Number(e.target.value) as 1 | 2)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm font-medium"
                >
                  <option value="all">All Districts</option>
                  <option value={1}>District 1</option>
                  <option value={2}>District 2</option>
                </select>

                {!userRole || userRole !== 'Viewer' ? (
                  <button
                    onClick={() => setShowTitleForm(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors shadow-md text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Title
                  </button>
                ) : null}
              </div>
            </div>

            {/* Municipality Grid */}
            {filteredMunicipalities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMunicipalities.map(municipality => (
                  <MunicipalityCard
                    key={municipality.id}
                    municipality={municipality}
                    readOnly={userRole === 'Viewer'}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewTitles={onViewTitles}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No municipalities found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Modal */}
      {showForm && (
        <MunicipalityForm
          municipality={editingMunicipality}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Add Title Form Modal */}
      {showTitleForm && (
        <TitleForm
          municipalities={municipalities.map(m => ({ id: m.id, name: m.name }))}
          userRole={userRole}
          onSubmit={handleTitleSubmit}
          onCancel={() => {
            setShowTitleForm(false);
          }}
        />
      )}
    </div>
  );
}