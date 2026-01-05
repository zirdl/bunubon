import { useState, useEffect } from 'react';
import { Plus, LogOut, Search, BarChart3, FileText, CheckCircle, MapPin, Users, Map, AlertCircle, Package, Calendar, Building2 } from 'lucide-react';
import { MunicipalityCard } from './MunicipalityCard';
import { MunicipalityForm, MunicipalityData } from './MunicipalityForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  username: string;
  onLogout: () => void;
  onViewTitles: (municipalityId: string, municipalityName: string) => void;
}

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

export function Dashboard({ username, onLogout, onViewTitles }: DashboardProps) {
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMunicipality, setEditingMunicipality] = useState<MunicipalityData | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');  // Keeping for compatibility but not used in filtering
  const [filterDistrict, setFilterDistrict] = useState<'all' | 1 | 2>('all');
  const [filterType, setFilterType] = useState<'all' | 'cloa' | 'ep'>('all');  // Keeping for compatibility but not used in filtering
  const [dateRange, setDateRange] = useState<string>('all'); // For date range filter
  const [showAddTitleDialog, setShowAddTitleDialog] = useState(false); // For the add title municipality selection dialog

  // State to store titles data
  const [titlesData, setTitlesData] = useState<any[]>([]);

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
          // Fallback to initial data if API fails
          setMunicipalities(initialMunicipalities);
        }
      } catch (error) {
        console.error('Error fetching municipalities:', error);
        // Fallback to initial data if API fails
        setMunicipalities(initialMunicipalities);
      }
    };

    fetchMunicipalities();
  }, []);

  // Load titles data for enhanced statistics
  useEffect(() => {
    const fetchAllTitles = async () => {
      try {
        // Fetch titles for each municipality to calculate enhanced statistics
        const titlesPromises = municipalities.map(mun =>
          fetch(`${API_BASE_URL}/titles/${mun.id}`)
            .then(res => res.json())
            .then(titles => titles.map((t: any) => ({ ...t, municipalityId: mun.id, municipalityName: mun.name })))
        );

        const allTitlesData = await Promise.all(titlesPromises);
        const flatTitles = allTitlesData.flat();
        setTitlesData(flatTitles);
      } catch (error) {
        console.error('Error fetching titles for statistics:', error);
      }
    };

    if (municipalities.length > 0) {
      fetchAllTitles();
    }
  }, [municipalities]);


  const handleCreate = () => {
    setEditingMunicipality(undefined);
    setShowForm(true);
  };

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
          // Remove from local state if successful
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

  const handleCancel = () => {
    setShowForm(false);
    setEditingMunicipality(undefined);
  };

  // Filter municipalities for the bottom section with search only
  const filteredMunicipalities = municipalities.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate statistics from titlesData directly for accuracy with new types
  const splitTotal = titlesData.filter(t => t.titleType === 'SPLIT').length;
  const splitProcessed = titlesData.filter(t => t.titleType === 'SPLIT' && (t.status === 'Released' || t.status === 'released')).length;
  
  const motherCloaTotal = titlesData.filter(t => t.titleType === 'MOTHER_CLOA').length;
  const motherCloaProcessed = titlesData.filter(t => t.titleType === 'MOTHER_CLOA' && (t.status === 'Released' || t.status === 'released')).length;

  const completedProgress = municipalities.filter(m =>
    m.checkpoints.every(cp => cp.completed)
  ).length;

  // New enhanced statistics - calculated from titles data
  const totalLandTitles = titlesData.length; // Total titles across all municipalities
  const totalBeneficiaries = [...new Set(titlesData.map(t => t.beneficiaryName))].length; // Unique beneficiaries
  const totalAreaDistributed = titlesData.reduce((sum, t) => sum + (t.area || 0), 0); // Sum of all title areas
  // Handle legacy "Pending" and new "on-hand" (which is pending for processing)
  const pendingTitles = titlesData.filter(t => t.status === 'Pending' || t.status === 'on-hand').length;
  const titlesForRelease = titlesData.filter(t => t.status === 'Processed').length; // Titles ready for release
  const releasedThisMonth = titlesData.filter(t =>
    (t.status === 'Released' || t.status === 'released') &&
    t.dateIssued &&
    new Date(t.dateIssued) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  ).length;

  // Calculate titles by status for more detailed stats
  const releasedTitles = titlesData.filter(t => t.status === 'Released' || t.status === 'released').length;
  const processingTitles = titlesData.filter(t => t.status === 'Processed').length; // Using 'Processed' as processing status
  const pendingDocuments = titlesData.filter(t => t.status === 'Pending' || t.status === 'on-hand').length;
  const onHoldTitles = 0; // Currently not used, but could be implemented with additional status

  // Generate data for Title Processing Timeline chart
  const generateTimelineData = () => {
    // Get the last 12 months
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear().toString().substr(-2);

      // Filter titles for this month
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const titlesThisMonth = titlesData.filter(t => {
        if (!t.dateIssued) return false;
        const titleDate = new Date(t.dateIssued);
        return titleDate >= monthStart && titleDate <= monthEnd;
      });

      const splitThisMonth = titlesThisMonth.filter(t => t.titleType === 'SPLIT').length;
      const motherCloaThisMonth = titlesThisMonth.filter(t => t.titleType === 'MOTHER_CLOA').length;

      months.push({
        month: monthName,
        'SPLIT': splitThisMonth,
        'Mother CLOA': motherCloaThisMonth
      });
    }

    return months;
  };

  const timelineData = generateTimelineData();

  // Filter municipalities for chart based on district only
  const filteredForChart = municipalities.filter(m => {
    const districtMatch = filterDistrict === 'all' || m.district === filterDistrict;
    return districtMatch;
  });

  // Chart data
  const chartData = filteredForChart.map(m => {
    // Get titles for this municipality from the loaded titlesData
    const muniTitles = titlesData.filter(t => t.municipalityId === m.id);
    const splitPending = muniTitles.filter(t => t.titleType === 'SPLIT' && t.status !== 'Released' && t.status !== 'released').length;
    const motherCloaPending = muniTitles.filter(t => t.titleType === 'MOTHER_CLOA' && t.status !== 'Released' && t.status !== 'released').length;
    
    return {
      name: m.name,
      'SPLIT Pending': splitPending,
      'Mother CLOA Pending': motherCloaPending,
    };
  })
  .filter(item => (item['SPLIT Pending'] || 0) > 0 || (item['Mother CLOA Pending'] || 0) > 0) // Only show if there's pending items
  .sort((a, b) => {
    const aTotal = (a['SPLIT Pending'] || 0) + (a['Mother CLOA Pending'] || 0);
    const bTotal = (b['SPLIT Pending'] || 0) + (b['Mother CLOA Pending'] || 0);
    return bTotal - aTotal;
  })
  .slice(0, 10);

  // Filter municipalities for the list based on district only
  const filteredMunicipalitiesForDisplay = municipalities.filter(m => {
    const districtMatch = filterDistrict === 'all' || m.district === filterDistrict;
    return districtMatch;
  });

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                <img
                  src="/dar-logo.png"
                  alt="DAR Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Department of Agrarian Reform</h1>
                <p className="text-sm text-emerald-50">Provincial Office - La Union | Land Title Tracking System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-emerald-100">Logged in as</p>
                <p className="text-white">{username}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Compact Statistics Cards - Single Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-emerald-700 mr-3">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-emerald-700">SPLIT Titles</p>
                <p className="text-lg font-semibold text-emerald-700">{splitProcessed} / {splitTotal}</p>
                <p className="text-xs text-emerald-700">{splitTotal > 0 ? ((splitProcessed / splitTotal) * 100).toFixed(0) : 0}%</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-blue-800">Mother CLOA</p>
                <p className="text-lg font-semibold text-blue-700">{motherCloaProcessed} / {motherCloaTotal}</p>
                <p className="text-xs text-blue-600">{motherCloaTotal > 0 ? ((motherCloaProcessed / motherCloaTotal) * 100).toFixed(0) : 0}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-gray-600 mr-3">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Complete</p>
                <p className="text-lg font-semibold text-emerald-700">{completedProgress}</p>
                <p className="text-xs text-gray-500">Muns</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-cyan-600 mr-3">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-cyan-800">Total Titles</p>
                <p className="text-lg font-semibold text-cyan-700">{totalLandTitles}</p>
                <p className="text-xs text-cyan-600">All</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-purple-600 mr-3">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-purple-800">Beneficiaries</p>
                <p className="text-lg font-semibold text-purple-700">{totalBeneficiaries}</p>
                <p className="text-xs text-purple-600">Unique</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-amber-600 mr-3">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-amber-800">Area (ha)</p>
                <p className="text-lg font-semibold text-amber-700">{totalAreaDistributed.toFixed(0)}</p>
                <p className="text-xs text-amber-600">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-amber-500 mr-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-yellow-800">Pending</p>
                <p className="text-xl font-semibold text-yellow-700">{pendingTitles}</p>
                <p className="text-xs text-yellow-600">Attention</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-indigo-600 mr-3">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-indigo-800">For Release</p>
                <p className="text-xl font-semibold text-indigo-700">{titlesForRelease}</p>
                <p className="text-xs text-indigo-600">Ready</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-green-800">Released</p>
                <p className="text-xl font-semibold text-green-700">{releasedThisMonth}</p>
                <p className="text-xs text-green-600">This Mo</p>
              </div>
            </div>
          </div>
        </div>


        {/* Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-semibold text-emerald-700">Pending Land Titles by Municipality</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="SPLIT Pending" fill="#3b82f6" name="SPLIT Pending" />
              <Bar dataKey="Mother CLOA Pending" fill="#f59e0b" name="Mother CLOA Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Title Processing Timeline Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-semibold text-emerald-700">Monthly Title Processing</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="SPLIT" stroke="#3b82f6" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Mother CLOA" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <h2 className="text-xl font-semibold text-emerald-700">Status Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Released', value: releasedTitles },
                    { name: 'Processing', value: processingTitles },
                    { name: 'Pending', value: pendingDocuments },
                    { name: 'On Hold', value: onHoldTitles }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Released', value: releasedTitles, color: '#10B981' },
                    { name: 'Processing', value: processingTitles, color: '#F59E0B' },
                    { name: 'Pending', value: pendingDocuments, color: '#EF4444' },
                    { name: 'On Hold', value: onHoldTitles, color: '#6B7280' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Comparison Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-semibold text-emerald-700">District Comparison</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  district: 'District 1',
                  'SPLIT': titlesData.filter(t => municipalities.find(m => m.id === t.municipalityId)?.district === 1 && t.titleType === 'SPLIT').length,
                  'Mother CLOA': titlesData.filter(t => municipalities.find(m => m.id === t.municipalityId)?.district === 1 && t.titleType === 'MOTHER_CLOA').length,
                },
                {
                  district: 'District 2',
                  'SPLIT': titlesData.filter(t => municipalities.find(m => m.id === t.municipalityId)?.district === 2 && t.titleType === 'SPLIT').length,
                  'Mother CLOA': titlesData.filter(t => municipalities.find(m => m.id === t.municipalityId)?.district === 2 && t.titleType === 'MOTHER_CLOA').length,
                }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="SPLIT" fill="#3b82f6" name="SPLIT Titles" />
              <Bar dataKey="Mother CLOA" fill="#f59e0b" name="Mother CLOA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consolidated Filters - above municipality cards */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value === 'all' ? 'all' : Number(e.target.value) as 1 | 2)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Districts</option>
              <option value={1}>District 1</option>
              <option value={2}>District 2</option>
            </select>
          </div>

          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search municipalities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Municipality Grid - takes 3/4 of the width */}
          <div className="lg:col-span-3">
            {filteredMunicipalitiesForDisplay.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMunicipalitiesForDisplay.map(municipality => (
                  <MunicipalityCard
                    key={municipality.id}
                    municipality={municipality}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewTitles={onViewTitles}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No municipality records found</p>
              </div>
            )}
          </div>

          {/* Quick Actions and Recent Activity - takes 1/4 of the width */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-emerald-700" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg border border-yellow-200 transition-colors"
                  onClick={() => setShowAddTitleDialog(true)}
                >
                  <div className="font-medium text-yellow-800">Add New Title</div>
                  <div className="text-xs text-yellow-600">Create a new land title record</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-colors">
                  <div className="font-medium text-blue-800">Generate Report</div>
                  <div className="text-xs text-blue-600">Create monthly summary</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-colors">
                  <div className="font-medium text-purple-800">Export Data</div>
                  <div className="text-xs text-purple-600">Download all records</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-lg border border-amber-200 transition-colors">
                  <div className="font-medium text-amber-800">Manage Beneficiaries</div>
                  <div className="text-xs text-amber-600">Add/Edit beneficiary records</div>
                </button>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-emerald-700" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Title #2024-001 released</p>
                    <p className="text-xs text-gray-500">Agoo • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Title #2024-002 pending docs</p>
                    <p className="text-xs text-gray-500">Luna • 3 hours ago</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Beneficiary added: Juan Dela Cruz</p>
                    <p className="text-xs text-gray-500">Naguilian • 5 hours ago</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mr-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">Report: Monthly Summary</p>
                    <p className="text-xs text-gray-500">Admin • 1 day ago</p>
                  </div>
                </div>
                <button className="w-full mt-2 text-center text-sm text-emerald-700 hover:text-emerald-700 font-medium">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Title Municipality Selection Dialog */}
      {showAddTitleDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50 overscroll-contain">
          <div className="bg-white/95 backdrop-blur rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Land Title</h3>
                <button
                  onClick={() => setShowAddTitleDialog(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">Select a municipality to add a new land title:</p>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {municipalities.map(municipality => (
                  <div
                    key={municipality.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors"
                    onClick={() => {
                      onViewTitles(municipality.id, municipality.name);
                      setShowAddTitleDialog(false);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{municipality.name}</h4>
                        <p className="text-sm text-gray-500">District {municipality.district}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAddTitleDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <MunicipalityForm
          municipality={editingMunicipality}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}