import { LayoutDashboard, Users, Download, Database, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ currentPage, onNavigate, onCollapse }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 fixed h-full transition-all duration-300 z-10 ${
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
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
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
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
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
