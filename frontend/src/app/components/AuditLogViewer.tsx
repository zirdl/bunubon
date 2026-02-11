import { useState, useEffect } from 'react';
import { Search, Calendar, User, Activity, Filter, RefreshCcw } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: any;
  timestamp: string;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filter States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [users, setUsers] = useState<{id: string, username: string}[]>([]);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, [selectedAction, selectedUser, startDate, endDate]);

  const fetchUsers = async () => {
    try {
      const response = await apiFetch('/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users for filter:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedAction) params.append('action', selectedAction);
      if (selectedUser) params.append('userId', selectedUser);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const endpoint = `/audit-logs${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Could not load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    'USER_CREATED', 'USER_UPDATED', 'USER_DEACTIVATED', 'USER_DELETED',
    'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_BY_ADMIN'
  ];

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-green-50 text-green-700 border-green-200';
    if (action.includes('DELETED') || action.includes('DEACTIVATED')) return 'bg-red-50 text-red-700 border-red-200';
    if (action.includes('PASSWORD')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const formatAuditDetails = (details: any) => {
    if (!details) return <span className="text-gray-400 italic">No additional details</span>;
    
    // If it's already a string (shouldn't happen with our API but good for safety)
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (e) {
        return <span>{details}</span>;
      }
    }

    const entries = Object.entries(details);
    if (entries.length === 0) return <span className="text-gray-400 italic">No additional details</span>;

    return (
      <div className="space-y-1">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-2 text-[11px]">
            <span className="font-bold text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="text-gray-500">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCcw className="animate-spin w-10 h-10 text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading system activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-[95%] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
            <p className="text-gray-600 mt-1">Immutable record of administrative actions and user management events.</p>
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 font-semibold"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search within these results..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all ${
                showAdvanced 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
            </button>
          </div>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Action Type</label>
                <select 
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Actions</option>
                  {actions.map(action => (
                    <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Performed By</label>
                <select 
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Start Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">End Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button 
                  onClick={() => {
                    setSelectedAction('');
                    setSelectedUser('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5 text-xs font-medium text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">{log.username || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        {formatAuditDetails(log.details)}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No activity logs found matching your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
