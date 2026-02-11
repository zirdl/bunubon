import { LayoutDashboard, Users, Download, Database, FileSpreadsheet, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
  userRole?: string;
}

export function Sidebar({ onCollapse, userRole }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = ['ADMIN'].includes(userRole || '');
  const isEditor = ['EDITOR'].includes(userRole || '');

  const menuItems = [
    { id: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/titles', label: 'Land Titles', icon: FileSpreadsheet },
    { id: '/export', label: 'Export Data', icon: Download },
    ...(isAdmin ? [
      { id: '/users', label: 'User Management', icon: Users },
      { id: '/audit-logs', label: 'Audit Logs', icon: Activity },
      { id: '/backup', label: 'Backup & Restore', icon: Database },
    ] : []),
  ];

  const currentPath = location.pathname;

  return (
    <aside
      className={`bg-white border-r border-gray-200 sticky top-0 h-screen transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              const newCollapsed = !collapsed;
              setCollapsed(newCollapsed);
              if (onCollapse) {
                onCollapse(newCollapsed);
              }
            }}
            className="flex items-center gap-3 flex-1"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center">
              <ChevronRight className={`w-5 h-5 text-white transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <h2 className="text-sm">DAR</h2>
                <p className="text-xs text-gray-600">La Union</p>
              </div>
            )}
          </button>
        </div>

        <nav className="space-y-2 mb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if active: exact match for root, or starts with for others (to handle sub-routes like /titles/123)
            const isActive = item.id === '/' 
              ? currentPath === '/' 
              : currentPath.startsWith(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700' : 'text-gray-500'}`} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
