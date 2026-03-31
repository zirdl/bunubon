import { useState } from 'react';
import { 
  Book, 
  UserCircle, 
  FileText, 
  Settings, 
  Shield, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload,
  LogOut,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

interface HelpPageProps {
  userRole?: string;
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'admin' | 'editor' | 'viewer';
}

export function HelpPage({ userRole }: HelpPageProps) {
  const [activeSection, setActiveSection] = useState<'guide' | 'faq' | 'roles'>('guide');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQItem[] = [
    {
      question: "How do I log in to the system?",
      answer: "Enter your username and password on the login page. If you've forgotten your password, contact your administrator to reset it.",
      category: 'general'
    },
    {
      question: "How do I add a new land title?",
      answer: "Navigate to the Land Titles page, select a municipality, then click 'Add New Title'. Fill in all required fields including Serial Number, Title Type, Beneficiary Name, Lot Number, Barangay Location, Area, Status, and Date Issued.",
      category: 'editor'
    },
    {
      question: "What is the difference between SPLIT and Regular titles?",
      answer: "SPLIT titles are subdivided portions of a Mother CCLOA title, requiring Mother CCLOA No., Title No., and all date fields (Date Issued, Date Registered, Date Distributed). SPLIT titles only have 'On-Hand' and 'Released' status options. Regular titles include TCT-CLOA and TCT-EP subtypes for standard land titles and have 'On-Hand', 'Processing', and 'Released' status options.",
      category: 'editor'
    },
    {
      question: "How do I search for titles?",
      answer: "Use the search bar on the Land Titles page. You can search by Serial Number, Beneficiary Name, or Municipality. You can also filter by status and title type.",
      category: 'general'
    },
    {
      question: "How do I create a new user account?",
      answer: "Go to User Management (Admin only), click 'Create New User', fill in the username, full name, email, password, and select the appropriate role (Admin, Editor, or Viewer).",
      category: 'admin'
    },
    {
      question: "How do I reset a user's password?",
      answer: "In User Management, find the user and click the Reset Password icon. Enter a temporary password - the user will be required to change it on their next login.",
      category: 'admin'
    },
    {
      question: "Can I export title data?",
      answer: "Yes! Go to Export Data and select the format (Excel). You can export all titles or filter by municipality, status, or date range.",
      category: 'general'
    },
    {
      question: "What happens if I make a mistake?",
      answer: "Editors and Admins can edit existing titles. Click the Edit icon on any title record, make your changes, and save. All changes are logged in the Audit Logs.",
      category: 'editor'
    },
    {
      question: "How do I view audit logs?",
      answer: "Admins can access Audit Logs from the sidebar menu. This shows all user actions including logins, title modifications, and user management activities.",
      category: 'admin'
    },
    {
      question: "What is the Date Issued field?",
      answer: "Date Issued is a required field for all title types. It represents when the land title was officially issued. For SPLIT titles, you must also provide Date Registered and Date Distributed (all three dates are required). For Regular titles, only Date Issued is required.",
      category: 'editor'
    }
  ];

  const rolePermissions = {
    ADMIN: {
      title: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: [
        'Create, edit, and delete land titles',
        'Manage user accounts (create, edit, deactivate, delete)',
        'Reset user passwords',
        'Access audit logs',
        'Backup and restore system data',
        'Export data in various formats',
        'Configure system settings'
      ],
      color: 'purple'
    },
    EDITOR: {
      title: 'LTS Staff (Editor)',
      description: 'Can manage land titles and view data',
      permissions: [
        'Create and edit land titles',
        'View all municipalities and titles',
        'Export title data',
        'Update title status (On-Hand, Processing, Released)',
        'Add notes to title records'
      ],
      color: 'blue'
    },
    VIEWER: {
      title: 'Read-Only Viewer',
      description: 'View-only access to land title records',
      permissions: [
        'View all municipalities and titles',
        'Search and filter title records',
        'Export title data',
        'View dashboard statistics'
      ],
      restrictions: [
        'Cannot create or edit titles',
        'Cannot manage users',
        'Cannot access audit logs',
        'Cannot backup/restore data'
      ],
      color: 'gray'
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = faq.category === 'general' || 
                       faq.category === userRole?.toLowerCase() ||
                       !userRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-[95%] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Book className="w-8 h-8 text-emerald-700" />
            Help & Documentation
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to the Land Title Tracking System. Find guides, FAQs, and role-specific information.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection('guide')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeSection === 'guide'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              User Guide
            </button>
            <button
              onClick={() => setActiveSection('roles')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeSection === 'roles'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveSection('faq')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeSection === 'faq'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              FAQ
            </button>
          </div>
        </div>

        {/* User Guide Section */}
        {activeSection === 'guide' && (
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                Quick Start Guide
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">First Time Users</h3>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Receive your login credentials from the administrator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Log in with your username and temporary password</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>Change your password when prompted (required for security)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Explore the dashboard to familiarize yourself with the system</span>
                    </li>
                  </ol>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700">Common Tasks</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-700" />
                      <span>View dashboard statistics and municipality progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-700" />
                      <span>Search and filter land titles by various criteria</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-700" />
                      <span>Add new titles or update existing records</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-700" />
                      <span>Export data for reporting and analysis</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature Guides */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dashboard */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-gray-900">Dashboard</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  The dashboard provides an overview of all municipalities and their title processing status.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>View total and processed titles per municipality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>Track progress with visual indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>Click on municipalities to view detailed titles</span>
                  </li>
                </ul>
              </div>

              {/* Land Titles */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-700" />
                  </div>
                  <h3 className="font-bold text-gray-900">Land Titles</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Manage land title records with comprehensive search and filtering capabilities.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <span>Search by serial number, beneficiary, or location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <span>Filter by status and title type</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                    <span>Add, edit, or view title details</span>
                  </li>
                </ul>
              </div>

              {/* User Management */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-700" />
                  </div>
                  <h3 className="font-bold text-gray-900">User Management</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Admin-only section for managing system users and their permissions.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                    <span>Create new user accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                    <span>Assign roles (Admin, Editor, Viewer)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                    <span>Reset passwords and manage account status</span>
                  </li>
                </ul>
              </div>

              {/* Export & Backup */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-bold text-gray-900">Export & Backup</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Export data for reporting and backup critical system information.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>Export titles to Excel format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>Backup entire database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>Restore from backup files</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Roles & Permissions Section */}
        {activeSection === 'roles' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-emerald-700" />
                <h2 className="font-bold text-emerald-900">Your Current Role</h2>
              </div>
              <p className="text-emerald-800">
                You are logged in as <strong>{userRole || 'Guest'}</strong>. 
                Your permissions are based on this role assignment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(rolePermissions).map(([roleKey, roleData]) => {
                const RoleIcon = roleKey === 'ADMIN' ? Shield : roleKey === 'EDITOR' ? Edit2 : UserCircle;
                const colorClasses = {
                  purple: 'bg-purple-100 text-purple-700 border-purple-200',
                  blue: 'bg-blue-100 text-blue-700 border-blue-200',
                  gray: 'bg-gray-100 text-gray-700 border-gray-200'
                };
                const isActive = userRole === roleKey;

                return (
                  <div
                    key={roleKey}
                    className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                      isActive ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[roleData.color as keyof typeof colorClasses]}`}>
                        <RoleIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{roleData.title}</h3>
                        {isActive && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            Your Role
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{roleData.description}</p>
                    <ul className="space-y-2">
                      {roleData.permissions.map((permission, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                          <span>{permission}</span>
                        </li>
                      ))}
                      {roleData.restrictions?.map((restriction, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                          <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span>{restriction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {activeSection === 'faq' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No FAQs found matching your search.</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const isExpanded = expandedFaq === index;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : index)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">{faq.question}</span>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-4 pt-2">
                          <div className="ml-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                            <p className="text-sm text-gray-700">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Still Need Help?</h3>
                  <p className="text-emerald-100 text-sm">
                    Contact your system administrator for additional support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Import icons that were used
import { LayoutDashboard, Users } from 'lucide-react';
