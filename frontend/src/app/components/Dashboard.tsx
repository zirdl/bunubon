import { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  CheckCircle,
  MapPin,
  Package,
  Calendar,
  Plus,
  Filter,
  AlertCircle,
  Map,
  Download,
  PlusCircle,
  Database,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TitleForm } from './TitleForm';
import { ImportData } from './ImportData';

interface DashboardProps {
  username: string;
  userRole: string;
  onLogout: () => void;
  onViewTitles: (municipalityId: string, municipalityName: string) => void;
}

// Use relative path to ensure it works when accessed from any device on the network
const API_BASE_URL = "/api";

export function Dashboard({
  username,
  userRole,
  onLogout,
  onViewTitles,
}: DashboardProps) {
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [titlesData, setTitlesData] = useState<any[]>([]);
  const [showTitleForm, setShowTitleForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Filter States
  const [filterType, setFilterType] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");

  // Load data from API on mount
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/municipalities`);
        if (response.ok) {
          const data = await response.json();
          setMunicipalities(data);
        }
      } catch (error) {
        console.error("Error fetching municipalities:", error);
      }
    };

    fetchMunicipalities();
  }, []);

  // Load titles data for enhanced statistics
  useEffect(() => {
    const fetchAllTitles = async () => {
      try {
        const titlesPromises = municipalities.map((mun) =>
          fetch(`${API_BASE_URL}/titles/${mun.id}?limit=1000`) // Fetch more for stats, but still limited
            .then((res) => res.json())
            .then((result) =>
              (result.data || []).map((t: any) => ({
                ...t,
                municipalityId: mun.id,
                municipalityName: mun.name,
              })),
            ),
        );

        const allTitlesData = await Promise.all(titlesPromises);
        const flatTitles = allTitlesData.flat();
        setTitlesData(flatTitles);
      } catch (error) {
        console.error("Error fetching titles for statistics:", error);
      }
    };

    if (municipalities.length > 0) {
      fetchAllTitles();
    }
  }, [municipalities]);

  // --- Filtering Logic ---
  const availableYears = [
    ...new Set(
      titlesData
        .map((t) => {
          const dateStr = t.dateIssued || t.dateRegistered || t.dateReceived;
          return dateStr ? new Date(dateStr).getFullYear().toString() : null;
        })
        .filter(Boolean),
    ),
  ]
    .sort()
    .reverse();

  // Define helper functions before they're used
  const isRegularType = (type: string) =>
    type === "Regular" || type === "Mother CCLOA" || type === "TCT-EP" || type === "TCT-EP (Legacy)";
  const isSplitType = (type: string) =>
    type === "SPLIT" || type === "TCT-CLOA" || type === "TCT-CLOA (Legacy)";

  const filteredTitlesData = titlesData.filter((t) => {
    // Apply title type filter
    if (filterType !== "all") {
      if (filterType === "SPLIT") {
        if (!isSplitType(t.titleType)) return false;
      } else if (filterType === "Regular") {
        if (!isRegularType(t.titleType)) return false;
      } else if (t.titleType !== filterType) {
        // For other specific types
        return false;
      }
    }

    // Apply date filters
    const dateStr = t.dateIssued || t.dateRegistered || t.dateReceived;
    if (dateStr) {
      const d = new Date(dateStr);
      if (filterYear !== "all" && d.getFullYear().toString() !== filterYear) return false;
      if (filterMonth !== "all" && d.getMonth().toString() !== filterMonth) return false;
    } else if (filterYear !== "all" || filterMonth !== "all") {
      // If a date filter is applied but the title has no date, exclude it
      return false;
    }

    return true;
  });

  const resetFilters = () => {
    setFilterType("all");
    setFilterYear("all");
    setFilterMonth("all");
  };

  // --- Statistics ---
  const totalLandTitles = filteredTitlesData.length;
  const totalAreaDistributed = filteredTitlesData.reduce((sum, t) => sum + (t.area || 0), 0);
  const pendingDocuments = filteredTitlesData.filter((t) => t.status === "on-hand").length;
  const processingTitles = filteredTitlesData.filter((t) => t.status === "processing").length;
  const releasedTitles = filteredTitlesData.filter((t) => t.status === "released").length;

  // Timeline Data
  const generateTimelineData = () => {
    const dataPoints = [];
    if (filterYear !== "all") {
      const year = parseInt(filterYear);
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month, 1);
        const monthName = date.toLocaleString("default", { month: "short" });
        const titlesInMonth = filteredTitlesData.filter((t) => {
          const dStr = t.dateIssued || t.dateRegistered || t.dateReceived;
          if (!dStr) return false;
          const d = new Date(dStr);
          return d.getMonth() === month && d.getFullYear() === year;
        });

        // Calculate values based on the active filter
        let splitCount = 0, regularCount = 0;
        if (filterType === "all" || filterType === "SPLIT") {
          splitCount = titlesInMonth.filter((t) => isSplitType(t.titleType)).length;
        }
        if (filterType === "all" || filterType === "Regular") {
          regularCount = titlesInMonth.filter((t) => isRegularType(t.titleType)).length;
        }

        dataPoints.push({
          month: monthName,
          SPLIT: splitCount,
          Regular: regularCount,
        });
      }
    } else {
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString("default", { month: "short" }) + " " + date.getFullYear().toString().substr(-2);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const titlesThisMonth = filteredTitlesData.filter((t) => {
          const dStr = t.dateIssued || t.dateRegistered || t.dateReceived;
          if (!dStr) return false;
          const titleDate = new Date(dStr);
          return titleDate >= monthStart && titleDate <= monthEnd;
        });

        // Calculate values based on the active filter
        let splitCount = 0, regularCount = 0;
        if (filterType === "all" || filterType === "SPLIT") {
          splitCount = titlesThisMonth.filter((t) => isSplitType(t.titleType)).length;
        }
        if (filterType === "all" || filterType === "Regular") {
          regularCount = titlesThisMonth.filter((t) => isRegularType(t.titleType)).length;
        }

        dataPoints.push({
          month: monthName,
          SPLIT: splitCount,
          Regular: regularCount,
        });
      }
    }
    return dataPoints;
  };

  const timelineData = generateTimelineData();

  const chartData = municipalities
    .map((m) => {
      const muniTitles = filteredTitlesData.filter((t) => t.municipalityId === m.id);

      // Calculate values based on the active filter
      let splitOnHand = 0, splitProcessing = 0, regularOnHand = 0, regularProcessing = 0;

      if (filterType === "all" || filterType === "SPLIT") {
        splitOnHand = muniTitles.filter((t) => isSplitType(t.titleType) && (t.status === "on-hand" || t.status === "Pending")).length;
        splitProcessing = muniTitles.filter((t) => isSplitType(t.titleType) && (t.status === "processing" || t.status === "Processed")).length;
      }

      if (filterType === "all" || filterType === "Regular") {
        regularOnHand = muniTitles.filter((t) => isRegularType(t.titleType) && (t.status === "on-hand" || t.status === "Pending")).length;
        regularProcessing = muniTitles.filter((t) => isRegularType(t.titleType) && (t.status === "processing" || t.status === "Processed")).length;
      }

      return {
        name: m.name,
        "SPLIT On-Hand": splitOnHand,
        "SPLIT Processing": splitProcessing,
        "Regular On-Hand": regularOnHand,
        "Regular Processing": regularProcessing,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-emerald-50">
      <main className="w-full max-w-[80%] mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
            <p className="text-sm text-gray-500">Tracking land title inventory and processing flow</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <Filter className="w-4 h-4 text-emerald-700 ml-2" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer">
                <option value="all">All Types</option>
                <option value="SPLIT">SPLIT</option>
                <option value="Regular">Regular</option>
            </select>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer">
                <option value="all">Year</option>
                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-transparent px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer">
                <option value="all">Month</option>
                {[...Array(12)].map((_, i) => <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>)}
            </select>
            <button onClick={resetFilters} className="ml-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md hover:bg-emerald-100 transition-colors">Reset</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText className="w-6 h-6" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">Inventory</span>
            </div>
            <p className="text-sm font-medium text-gray-500">On-Hand Titles</p>
            <p className="text-3xl font-bold text-gray-900">{pendingDocuments}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Package className="w-6 h-6" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded">In-Process</span>
            </div>
            <p className="text-sm font-medium text-gray-500">Processing Pipeline</p>
            <p className="text-3xl font-bold text-gray-900">{processingTitles}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle className="w-6 h-6" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Completed</span>
            </div>
            <p className="text-sm font-medium text-gray-500">Released Titles</p>
            <p className="text-3xl font-bold text-gray-900">{releasedTitles}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Map className="w-6 h-6" /></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-1 rounded">Coverage</span>
            </div>
            <p className="text-sm font-medium text-gray-500">Total Area (ha)</p>
            <p className="text-3xl font-bold text-gray-900">{(totalAreaDistributed / 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <h2 className="text-lg font-bold text-gray-900">Municipality Inventory & Backlog</h2>
              </div>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    payload={
                      [
                        ...(filterType === "all" || filterType === "SPLIT" ? [{ value: 'SPLIT (On-Hand)', type: 'rect', id: 'SPLIT On-Hand', color: '#3b82f6' }] : []),
                        ...(filterType === "all" || filterType === "SPLIT" ? [{ value: 'SPLIT (Processing)', type: 'rect', id: 'SPLIT Processing', color: '#93c5fd' }] : []),
                        ...(filterType === "all" || filterType === "Regular" ? [{ value: 'Regular (On-Hand)', type: 'rect', id: 'Regular On-Hand', color: '#f59e0b' }] : []),
                        ...(filterType === "all" || filterType === "Regular" ? [{ value: 'Regular (Processing)', type: 'rect', id: 'Regular Processing', color: '#fcd34d' }] : [])
                      ]
                    }
                  />
                  {(filterType === "all" || filterType === "SPLIT") && (
                    <>
                      <Bar dataKey="SPLIT On-Hand" stackId="a" fill="#3b82f6" name="SPLIT (On-Hand)" />
                      <Bar dataKey="SPLIT Processing" stackId="a" fill="#93c5fd" name="SPLIT (Processing)" />
                    </>
                  )}
                  {(filterType === "all" || filterType === "Regular") && (
                    <>
                      <Bar dataKey="Regular On-Hand" stackId="b" fill="#f59e0b" name="Regular (On-Hand)" />
                      <Bar dataKey="Regular Processing" stackId="b" fill="#fcd34d" name="Regular (Processing)" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-gray-900">Overall Process Health</h2>
            </div>
            <div className="flex-1 flex flex-col">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={[{ name: "Released", value: releasedTitles }, { name: "Processing", value: processingTitles }, { name: "On-Hand", value: pendingDocuments }]} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={5} dataKey="value">
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-gray-600">Released</span></div>
                  <span className="font-bold">{totalLandTitles > 0 ? ((releasedTitles / totalLandTitles) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div><span className="text-gray-600">Processing</span></div>
                  <span className="font-bold">{totalLandTitles > 0 ? ((processingTitles / totalLandTitles) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-gray-600">On-Hand</span></div>
                  <span className="font-bold">{totalLandTitles > 0 ? ((pendingDocuments / totalLandTitles) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-gray-900">Monthly Processing Efficiency</h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    payload={
                      [
                        ...(filterType === "all" || filterType === "SPLIT" ? [{ value: 'SPLIT Titles', type: 'line', id: 'SPLIT', color: '#3b82f6' }] : []),
                        ...(filterType === "all" || filterType === "Regular" ? [{ value: 'Regular Titles', type: 'line', id: 'Regular', color: '#f59e0b' }] : [])
                      ]
                    }
                  />
                  {(filterType === "all" || filterType === "SPLIT") && (
                    <Line type="monotone" dataKey="SPLIT" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="SPLIT Titles" />
                  )}
                  {(filterType === "all" || filterType === "Regular") && (
                    <Line type="monotone" dataKey="Regular" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="Regular Titles" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-gray-900">Action Center</h2>
            </div>
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 gap-3">
                {userRole !== 'Viewer' ? (
                  <>
                    <button
                      onClick={() => setShowTitleForm(true)}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">Add New Title</div>
                        <div className="text-xs opacity-90">Create a new land title record</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setShowImport(true)}
                      className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                    >
                      <Database className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">Import Data</div>
                        <div className="text-xs opacity-90">Migrate data from SharePoint/Excel</div>
                      </div>
                    </button>
                  </>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-600">Read-Only Access</p>
                    <p className="text-xs text-gray-500 mt-1">You are logged in as a Viewer.</p>
                  </div>
                )}
              </div>
              <div className="mt-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-gray-700 uppercase">Attention Required</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">There are <span className="font-bold text-amber-700">{pendingDocuments}</span> titles currently in the queue across the province.</p>
              </div>
            </div>
          </div>
        </div>

        {showTitleForm && (
          <TitleForm
            municipalities={municipalities.map(m => ({ id: m.id, name: m.name }))}
            onSubmit={(data, stayOpen) => {
              // Handle form submission
              setShowTitleForm(false);
            }}
            onCancel={() => setShowTitleForm(false)}
          />
        )}

        {showImport && (
          <ImportData
            municipalities={municipalities.map(m => ({ id: m.id, name: m.name }))}
            onCancel={() => setShowImport(false)}
            onImportComplete={() => {
              setShowImport(false);
              alert('Import completed successfully!');
              window.location.reload();
            }}
          />
        )}
      </main>
    </div>
  );
}
